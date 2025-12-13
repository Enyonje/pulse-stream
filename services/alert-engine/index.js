import express from "express";
import http from "http";
import { startWSServer } from "./ws.js";

const app = express();
const server = http.createServer(app);

const ws = startWSServer(server);

export function emitAlert(alert) {
  ws.broadcast({
    type: "ALERT_TRIGGERED",
    ...alert
  });
}

server.listen(4001, () => {
  console.log("🚨 Alert Engine running on :4001");
});
