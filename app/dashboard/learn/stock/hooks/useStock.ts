"use client";

import { useState, useEffect, useCallback } from "react";
import type { StockQuote, ChartPoint, ChartRange } from "../types";

export function useStockQuote(symbol: string) {
  const [quote, setQuote]     = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/stocks?action=quote&symbol=${symbol}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuote(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch quote");
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { quote, loading, error, refetch: fetch_ };
}

export function useStockChart(symbol: string, range: ChartRange) {
  const [points, setPoints]   = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/stocks?action=${range}&symbol=${symbol}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPoints(data.points ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch chart");
    } finally {
      setLoading(false);
    }
  }, [symbol, range]);

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