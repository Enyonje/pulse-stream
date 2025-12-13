
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function PriceChart({ data }) {
  return (
    <LineChart width={700} height={300} data={data}>
      <XAxis dataKey="time" />
      <YAxis domain={["auto", "auto"]} />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="price"
        dot={false}
      />
    </LineChart>
  );
}
