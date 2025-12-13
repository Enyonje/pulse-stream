const WebSocket = require("ws");
const { createClient } = require("redis");

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// ✅ Redis subscriber
const redis = createClient({ url: "redis://redis:6379" });
redis.connect();

redis.subscribe("prices", (message) => {
  console.log("📩 Redis message:", message);
  // Broadcast to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");
});