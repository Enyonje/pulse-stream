require('dotenv').config();
const { Kafka } = require('kafkajs');
const Redis = require('ioredis');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'pulse-processor',
  brokers: [(process.env.KAFKA_BROKER || 'redpanda:9092')],
  retry: { retries: 8 }
});

const consumer = kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_GROUP || 'processor-group' });
const producer = kafka.producer();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379)
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const INPUT_TOPIC = process.env.KAFKA_INPUT_TOPIC || 'price_stream';
const ANALYTICS_TOPIC = process.env.KAFKA_ANALYTICS_TOPIC || 'events.analytics';
const ALERTS_TOPIC = process.env.KAFKA_ALERTS_TOPIC || 'events.alerts';
const WINDOW_1M = Number(process.env.WINDOW_1M_SEC || 60);
const WINDOW_5M = Number(process.env.WINDOW_5M_SEC || 300);
const PCT_ALERT = Number(process.env.PERCENT_CHANGE_ALERT || 1.5);

async function ensureTimescale() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS measurements (
        time timestamptz NOT NULL,
        symbol text NOT NULL,
        price numeric,
        avg_1m numeric,
        avg_5m numeric,
        PRIMARY KEY (time, symbol)
      );`);
    // create hypertable (safe to call repeatedly)
    await client.query(`SELECT create_hypertable('measurements','time', if_not_exists => true);`);
    console.log('✅ Timescale table ready');
  } finally {
    client.release();
  }
}

async function pushToTimescale(ts, symbol, price, avg1, avg5) {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO measurements (time, symbol, price, avg_1m, avg_5m)
       VALUES ($1, $2, $3, $4, $5)`,
      [new Date(ts), symbol, price, avg1, avg5]
    );
  } catch (err) {
    console.error('Timescale insert error', err);
  } finally {
    client.release();
  }
}

function histogramKey(symbol, windowSec) {
  return `window:${symbol}:${windowSec}`;
}

// sliding window average using Redis sorted set (score = timestamp)
async function addToWindow(symbol, ts, price, windowSec) {
  const key = histogramKey(symbol, windowSec);
  const score = Number(ts);
  // add member = `${score}:${randomUUID}` to avoid collisions
  const member = `${score}:${uuidv4()}`;
  await redis.zadd(key, score, member);
  // remove older than windowSec
  const minScore = score - windowSec * 1000;
  await redis.zremrangebyscore(key, 0, minScore);
}

async function computeAvg(symbol, windowSec) {
  const key = histogramKey(symbol, windowSec);
  const members = await redis.zrange(key, 0, -1);
  if (!members || members.length === 0) return null;
  // members are like "timestamp:uuid" — we stored price implicitly via a separate map? Simpler: store price as value in hash keyed by member.
  // We'll instead fetch prices from a Redis hash where we set price per member
  const values = [];
  for (const m of members) {
    const p = await redis.hget('prices', m);
    if (p) values.push(Number(p));
  }
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

// helper to add price value to prices hash for a member
async function setPriceForMember(member, price) {
  await redis.hset('prices', member, String(price));
}

// clean up old hash keys (optional): not implemented here for brevity

async function start() {
  await ensureTimescale();
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: INPUT_TOPIC, fromBeginning: false });
  console.log('🔁 Processor subscribed to', INPUT_TOPIC);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const payload = JSON.parse(message.value.toString());
        const ts = payload.timestamp || Date.now();
        const symbol = payload.symbol || 'UNKNOWN';
        const price = Number(payload.price);

        // create members and add to windows
        const member1 = `${ts}:${uuidv4()}`;
        await setPriceForMember(member1, price);
        await redis.zadd(histogramKey(symbol, WINDOW_1M), ts, member1);
        await redis.zadd(histogramKey(symbol, WINDOW_5M), ts, member1);

        // trim older entries
        const min1 = ts - WINDOW_1M * 1000;
        const min5 = ts - WINDOW_5M * 1000;
        await redis.zremrangebyscore(histogramKey(symbol, WINDOW_1M), 0, min1);
        await redis.zremrangebyscore(histogramKey(symbol, WINDOW_5M), 0, min5);

        // compute averages
        const avg1 = await computeAvg(symbol, WINDOW_1M);
        const avg5 = await computeAvg(symbol, WINDOW_5M);

        // persist to Timescale
        await pushToTimescale(ts, symbol, price, avg1, avg5);

        // publish analytics event
        const analytics = {
          id: uuidv4(),
          symbol,
          ts,
          price,
          avg_1m: avg1,
          avg_5m: avg5
        };

        await producer.send({
          topic: ANALYTICS_TOPIC,
          messages: [{ value: JSON.stringify(analytics) }]
        });

        // simple percent-change alert: compare latest price vs avg_5m
        if (avg5 && Math.abs((price - avg5) / avg5 * 100) >= PCT_ALERT) {
          const alert = {
            id: uuidv4(),
            symbol,
            ts,
            price,
            avg_5m: avg5,
            pct_change: ((price - avg5) / avg5 * 100),
            type: 'percent_change'
          };

          await producer.send({
            topic: ALERTS_TOPIC,
            messages: [{ value: JSON.stringify(alert) }]
          });

          console.log('🔔 Alert published', alert);
        }

        console.log('Processed', symbol, price, 'avg1m=', avg1, 'avg5m=', avg5);
      } catch (err) {
        console.error('Processor error', err);
      }
    }
  });
}

start().catch(err => {
  console.error('Processor failed to start', err);
  process.exit(1);
});
