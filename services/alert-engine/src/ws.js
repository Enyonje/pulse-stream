import { WebSocketServer } from "ws";

export function startWSServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("🧠 Frontend connected to Alert Engine");

    ws.send(JSON.stringify({
      type: "CONNECTED"
    }));
  });

  return {
    broadcast(alert) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(alert));
        }
      });
    }
  };
}
