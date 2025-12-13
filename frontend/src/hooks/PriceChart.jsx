import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { usePriceUpdates } from "./hooks/usePriceUpdates";

export default function PriceChart() {
  const prices = usePriceUpdates();

  return (
    <div>
      <h2>📈 Live Price Chart</h2>
      <LineChart width={600} height={300} data={prices}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" />
        <YAxis domain={["auto", "auto"]} />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
      </LineChart>
    </div>
  );
}