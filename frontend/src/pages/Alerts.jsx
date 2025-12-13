import { useState } from "react";
import { apiFetch } from "../api";
import AlertsList from "../components/AlertsList";

export default function Alerts() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [threshold, setThreshold] = useState(1);
  const [quantity, setQuantity] = useState(0.01);
  const [loading, setLoading] = useState(false);

  async function createAlert(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await apiFetch("/alerts", {
        method: "POST",
        body: JSON.stringify({
          symbol,
          condition: "DROP_PERCENT",
          threshold,
          action: "BUY",
          quantity,
        }),
      });

      alert("Alert created");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  const ws = connectWS(["BTCUSDT"], (event) => {
    if (event.type === "ALERT_TRIGGERED") {
      setAlerts((prev) => [event.payload, ...prev]);
    }
  });

  return () => ws.close();
}, []);


  return (
    <div>
      <h2>Create Alert</h2>

      <form onSubmit={createAlert}>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol"
        />

        <input
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="Drop %"
        />

        <input
          type="number"
          step="0.001"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />

        <button disabled={loading}>
          {loading ? "Creating..." : "Create Alert"}
        </button>
      </form>

      <AlertsList />
    </div>
  );
}
