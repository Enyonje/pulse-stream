import { useEffect, useState } from "react";
import { apiFetch, connectWS } from "../api";

export default function Trades() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    apiFetch("/trades").then(setTrades);

    const ws = connectWS((msg) => {
      if (msg.type === "TRADE_EXECUTED") {
        setTrades((prev) => [msg.data, ...prev]);
      }
    });

    useEffect(() => {
  const ws = connectWS(["BTCUSDT"], (event) => {
    if (event.type.startsWith("TRADE_")) {
      setTrades((prev) => {
        const existing = prev.find(
          (t) => t.tradeId === event.payload.tradeId
        );

        if (existing) {
          return prev.map((t) =>
            t.tradeId === event.payload.tradeId
              ? { ...t, ...event.payload }
              : t
          );
        }

        return [event.payload, ...prev];
      });
    }
  });

  return () => ws.close();
}, []);


    return () => ws.close();
  }, []);

  return (
    <div>
      <h2>Trades</h2>
      {trades.map((t) => (
        <div key={t.trade_id}>
          {t.symbol} {t.side} @ {t.price}
        </div>
      ))}
    </div>
  );
}
