const express = require("express");
const axios = require("axios");
const { createClient } = require("redis");

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Redis client
const redis = createClient({ url: "redis://redis:6379" });
redis.on("error", (err) => console.error("Redis error", err));
redis.connect();

app.get("/price/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const fakePrice = (Math.random() * 100).toFixed(2);

  // Publish to Redis channel
  const message = { type: "PRICE_UPDATE", symbol, price: fakePrice };
  await redis.publish("prices", JSON.stringify(message));

  res.json(message);
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`📈 Price API running on port ${PORT}`);
});