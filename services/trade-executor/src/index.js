import { placeBinanceOrder } from "./binance.js";
import Redis from "ioredis";

const redis = new Redis("redis://redis:6379");

const MODE = process.env.TRADE_MODE || "paper";

export async function executeTrade(trade) {
  const { userId, symbol, side, quantity, price } = trade;

  try {
    let result;

    if (MODE === "binance") {
      result = await placeBinanceOrder({
        symbol,
        side,
        quantity,
        apiKey: process.env.BINANCE_API_KEY,
        apiSecret: process.env.BINANCE_API_SECRET
      });
    } else {
      // Paper trade fallback
      result = {
        orderId: "paper-" + Date.now(),
        status: "FILLED",
        executedQty: quantity
      };
    }

    await redis.publish(
      "trades",
      JSON.stringify({
        type: "TRADE_FILLED",
        userId,
        symbol,
        payload: {
          orderId: result.orderId,
          side,
          quantity,
          status: "FILLED"
        }
      })
    );
  } catch (err) {
    await redis.publish(
      "trades",
      JSON.stringify({
        type: "TRADE_REJECTED",
        userId,
        symbol,
        payload: {
          reason: err.message
        }
      })
    );
  }
}
