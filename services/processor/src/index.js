import Redis from "ioredis";
const redis = new Redis("redis://redis:6379");

const priceEvent = {
  type: "PRICE_TICK",
  symbol: "BTCUSDT",
  price: Number(price),
  timestamp: Date.now()
};

// publish for WS
await redis.publish("prices", JSON.stringify(priceEvent));
