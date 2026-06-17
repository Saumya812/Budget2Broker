"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchDaily } from "@/app/dashboard/learn/stock/lib/stockApi";

interface ChartPoint { time: string; close: number; }

export default function ChartCard({ symbol = "AAPL" }: { symbol?: string }) {
  const [data, setData]       = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchDaily(symbol)
      .then(res => {
        const points = (res.points ?? []).slice(-30).map((p: ChartPoint) => ({
          time:  p.time.slice(5),   // show MM-DD only
          close: p.close,
        }));
        setData(points);
      })
      .catch(() => setError("Could not load chart data."))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-center h-[300px]">
      <p className="text-gray-400 text-sm">Loading chart...</p>
    </div>
  );

  if (error) return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-center h-[300px]">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="font-semibold mb-1">{symbol} — Price Trend</h2>
      <p className="text-xs text-gray-400 mb-4">Last 30 trading days</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} width={60} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={(v: number | undefined) => [`$${(v ?? 0).toFixed(2)}`, "Price"]} />
          <Line type="monotone" dataKey="close" stroke="#4F46E5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}