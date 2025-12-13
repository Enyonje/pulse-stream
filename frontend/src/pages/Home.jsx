import { useEffect, useState } from "react";
import PriceChart from "../components/PriceChart";
import { connectWS } from "../api";

export default function Home() {
  const [data, setData] = useState([]);

  // Load history
  useEffect(() => {
    fetch("http://localhost:3000/prices/BTCUSDT")
      .then((r) => r.json())
      .then(setData);
  }, []);

  // Live updates
  useEffect(() => {
    const ws = connectWS(["BTCUSDT"], (event) => {
      if (event.type === "PRICE_TICK") {
        setData((prev) =>
          [...prev, {
            time: new Date(event.timestamp).toLocaleTimeString(),
            price: event.price
          }].slice(-300)
        );
      }
    });

    return () => ws.close();
  }, []);

  return <PriceChart data={data} />;
}
