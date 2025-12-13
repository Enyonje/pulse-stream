require('dotenv').config();
const WebSocket = require('ws');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

async function start() {
  console.log("🚀 Starting Ingestor Service...");

  await producer.connect();

  const ws = new WebSocket(process.env.BINANCE_WS);

  ws.on('open', () => {
    console.log("🔌 Connected to Binance WebSocket...");
  });

  ws.on('message', async (data) => {
    const event = JSON.parse(data);

    const priceData = {
      symbol: event.s,
      price: event.p,
      timestamp: event.T,
    };

    console.log("📡 Incoming Price:", priceData);

    await producer.send({
      topic: process.env.KAFKA_TOPIC,
      messages: [
        {
          value: JSON.stringify(priceData),
        },
      ],
    });
  });

  ws.on('close', () => {
    console.log("❌ Binance WebSocket closed.");
  });

  ws.on('error', (err) => {
    console.error("⚠️ WebSocket error:", err);
  });
}

start().catch(console.error);
