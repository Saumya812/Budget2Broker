"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockQuote, ChartPoint, ChartRange } from "../types";

// Shared cache so quote and chart use ONE api call per symbol
const dataCache: Record<string, { quote: StockQuote; points: ChartPoint[]; ts: number }> = {};
const CACHE_MS = 60_000; // 1 minute

async function fetchDailyData(symbol: string) {
  const cached = dataCache[symbol];
  if (cached && Date.now() - cached.ts < CACHE_MS) return cached;

  const res  = await fetch(`/api/stocks?action=quote&symbol=${symbol}`, { cache: "no-store" });
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  const result = {
    quote:  data as StockQuote,
    points: (data.points ?? []) as ChartPoint[],
    ts:     Date.now(),
  };
  dataCache[symbol] = result;
  return result;
}

export function useStockQuote(symbol: string) {
  const [quote,   setQuote]   = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const { quote } = await fetchDailyData(symbol);
      setQuote(quote);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch quote");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { quote, loading, error, refetch: fetch_ };
}

export function useStockChart(symbol: string, _range: ChartRange) {
  const [points,  setPoints]  = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setPoints([]);
    try {
      const { points } = await fetchDailyData(symbol);
      if (points.length === 0) throw new Error("No chart data returned");
      setPoints(points);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch chart");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { points, loading, error, refetch: fetch_ };
}

export function useStockSearch() {
  const [results, setResults] = useState<{ symbol: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/stocks?action=search&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.matches ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search, clearResults: () => setResults([]) };
}