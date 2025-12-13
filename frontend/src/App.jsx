import React, { useEffect, useState } from "react";
import { connectWS } from "./api";
import "./index.css";
import React from "react";
import { usePriceUpdates } from "./hooks/usePriceUpdates";
import MultiPriceChart from "./MultiPriceChart";


export default function App() {
  return (
    <div>
      <h1>Pulse Stream Dashboard</h1>
      <MultiPriceChart />
    </div>
  );
}


export default function App() {
  const prices = usePriceUpdates();

  return (
    <div>
      <h1>📈 Live Price Updates</h1>
      <ul>
        {prices.map((p, i) => (
          <li key={i}>
            {p.symbol}: ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>Pulse Stream Dashboard</h1>
      <PriceChart />
    </div>
  );
}


export default function App() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    connectWS((msg) => {
      if (msg.type === "ALERT_TRIGGERED") {
        setAlerts((prev) => [msg, ...prev]);
      }
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Pulse Stream Dashboard</h1>
      <p>Frontend is now wired up to React + Vite!</p>

      <h2 className="text-xl font-semibold mt-6">Live Alerts</h2>
      {alerts.length === 0 ? (
        <p>No alerts yet...</p>
      ) : (
        alerts.map((a, i) => (
          <div key={i} className="mt-2 p-2 border rounded bg-red-50">
            🚨 {a.symbol} @ {a.price} → {a.action}
          </div>
        ))
      )}
    </div>
  );
}