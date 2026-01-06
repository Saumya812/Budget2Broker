"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", price: 100 },
  { name: "Feb", price: 120 },
  { name: "Mar", price: 90 },
  { name: "Apr", price: 140 },
];

export default function ChartCard() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="font-semibold mb-4">Price Trend</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
