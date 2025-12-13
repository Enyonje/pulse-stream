import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useMultiPriceUpdates } from "./hooks/useMultiPriceUpdates";

export default function MultiPriceChart() {
  const prices = useMultiPriceUpdates();

  return (
    <div>
      <h2>📊 Multi-Symbol Live Chart</h2>
      <LineChart width={700} height={400} data={prices}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="BTC" stroke="#f39c12" dot={false} />
        <Line type="monotone" dataKey="ETH" stroke="#2ecc71" dot={false} />
        <Line type="monotone" dataKey="SOL" stroke="#3498db" dot={false} />
      </LineChart>
    </div>
  );
}