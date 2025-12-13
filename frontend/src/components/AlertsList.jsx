import { useEffect, useState } from "react";
import { apiFetch, connectWS } from "../api";

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();

    const ws = connectWS((msg) => {
      if (msg.type === "ALERT_TRIGGERED") {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === msg.data.id ? { ...a, triggered: true } : a
          )
        );
      }
    });

    return () => ws.close();
  }, []);

  async function loadAlerts() {
    setAlerts(await apiFetch("/alerts"));
  }

  return (
    <div>
      <h3>Alerts</h3>
      {alerts.map((a) => (
        <div key={a.id}>
          {a.symbol} — {a.threshold}%
          {a.triggered && " 🚨"}
        </div>
      ))}
    </div>
  );
}
