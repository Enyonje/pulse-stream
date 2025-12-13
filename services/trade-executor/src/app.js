import 'dotenv/config';
import express from 'express';
import logger from './logger.js';
import { createKafka, createConsumer, createProducer } from './kafka.js';
import { getUserPrefs } from './prefs.js';
import { placeOrder } from './exchange.js';

const PORT = parseInt(process.env.PORT || '3004', 10);
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'redpanda:9092';
const TRADE_SIGNALS_TOPIC = process.env.TRADE_SIGNALS_TOPIC || 'trade.signals';
const TRADES_EXECUTED_TOPIC = process.env.TRADES_EXECUTED_TOPIC || 'trades.executed';

const app = express();
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'trade-executor' }));

let consumer, producer;

async function validateSignal(signal) {
  // Minimal validation
  if (!signal) return { ok: false, reason: 'empty' };
  const { userId, symbol, side, size } = signal;
  if (!userId || !symbol || !side || !size) return { ok: false, reason: 'missing_fields' };
  if (!['buy', 'sell'].includes(side)) return { ok: false, reason: 'invalid_side' };
  return { ok: true };
}

async function handleSignal(signal) {
  const v = await validateSignal(signal);
  if (!v.ok) {
    logger.warn({ signal, reason: v.reason }, 'Signal rejected');
    return { status: 'rejected', reason: v.reason };
  }

  const prefs = await getUserPrefs(signal.userId);
  if (!prefs.enabled) {
    logger.info({ userId: signal.userId }, 'Trading disabled by user prefs');
    return { status: 'skipped', reason: 'disabled' };
  }

  // Apply simple risk control
  const allowedSize = Math.min(signal.size, prefs.tradeSize || signal.size);
  const order = {
    userId: signal.userId,
    symbol: signal.symbol,
    side: signal.side,
    size: allowedSize,
    meta: { source: 'trade-executor', riskCap: prefs.maxRisk || 0.02 }
  };

  const result = await placeOrder(order);
  logger.info({ orderId: result.id, symbol: order.symbol, side: order.side, size: order.size }, 'Order executed');

  // Emit execution event
  await producer.send({
    topic: TRADES_EXECUTED_TOPIC,
    messages: [{ key: String(order.userId), value: JSON.stringify({ order, result }) }]
  });

  return { status: 'executed', orderId: result.id };
}

async function start() {
  const kafka = createKafka(KAFKA_BROKER);
  consumer = await createConsumer(kafka);
  producer = await createProducer(kafka);

  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({ topic: TRADE_SIGNALS_TOPIC, fromBeginning: false });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString();
      const valueStr = message.value?.toString() || '{}';
      let payload;
      try {
        payload = JSON.parse(valueStr);
      } catch (err) {
        logger.warn({ key, err: err.message }, 'Invalid JSON in trade signal');
        return;
      }

      logger.debug({ topic, partition, key, payload }, 'Received trade signal');
      try {
        await handleSignal(payload);
      } catch (err) {
        logger.error({ err: err.message, key }, 'Failed to handle signal');
      }
    }
  });

  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Trade Executor service started');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    try {
      await consumer?.disconnect();
      await producer?.disconnect();
    } catch (err) {
      logger.error({ err: err.message }, 'Error during shutdown');
    } finally {
      process.exit(0);
    }
  });
}

start().catch(err => {
  logger.error({ err: err.message }, 'Failed to start trade executor');
  process.exit(1);
});