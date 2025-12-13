import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import url from "url";
import { connections } from "./state.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const redis = new Redis("redis://redis:6379");
const wss = new WebSocketServer({ port: 8080 });

console.log("📡 WS Gateway running on :8080");

redis.subscribe("prices", "alerts", "trades");

wss.on("connection", (ws, req) => {
  const { query } = url.parse(req.url, true);
  const token = query.token;

  if (!token) return ws.close(4001, "Missing token");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    connections.set(ws, {
      userId: decoded.sub,
      symbols: new Set()
    });
    console.log("✅ WS user:", decoded.sub);
  } catch {
    return ws.close(4002, "Invalid token");
  }

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString());

    if (msg.type === "SUBSCRIBE") {
      msg.symbols.forEach((s) =>
        connections.get(ws).symbols.add(s)
      );
    }

    if (msg.type === "UNSUBSCRIBE") {
      msg.symbols.forEach((s) =>
        connections.get(ws).symbols.delete(s)
      );
    }
  });

  ws.on("close", () => {
    connections.delete(ws);
  });
});

redis.on("message", (_, raw) => {
  const event = JSON.parse(raw);

  for (const [ws, meta] of connections.entries()) {
    if (
      ws.readyState === WebSocket.OPEN &&
      event.userId === meta.userId &&
      (!event.symbol || meta.symbols.has(event.symbol))
    ) {
      ws.send(JSON.stringify(event));
    }
  }
});
