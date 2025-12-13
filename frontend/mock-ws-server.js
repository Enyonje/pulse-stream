import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 4000 });

console.log("🧪 Mock WS server running on ws://localhost:4000");

wss.on("connection", (ws) => {
  console.log("Client connected");

  setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "ALERT_TRIGGERED",
        symbol: "BTCUSDT",
        price: 92244,
        action: "BUY"
      })
    );
  }, 3000);
});
