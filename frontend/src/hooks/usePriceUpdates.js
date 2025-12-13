import { useEffect, useState } from "react";

export function usePriceUpdates() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket:", wsUrl);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "PRICE_UPDATE") {
          const point = {
            time: new Date().toLocaleTimeString(),
            symbol: msg.symbol,
            price: parseFloat(msg.price),
          };
          setPrices((prev) => [...prev.slice(-19), point]); // keep last 20 points
        }
      } catch (err) {
        console.error("❌ Failed to parse message:", err);
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket closed");
    };

    return () => ws.close();
  }, []);

  return prices;
}