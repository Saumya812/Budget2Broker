"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, StarOff, TrendingUp, TrendingDown,
  RefreshCw, Sparkles, ShoppingCart, X, BookOpen,
} from "lucide-react";
import { useStockQuote, useStockChart, useStockSearch } from "./hooks/useStock";
import type { WatchlistItem, Portfolio, ChartPoint } from "./types";

const fmt  = (n: number, d = 2) => n?.toFixed(d) ?? "—";
const fmtK = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(0)}K` : String(n);
const fmtTime = (t: string) => {
  if (!t) return "";
  if (t.includes(" ")) return t.split(" ")[1]?.slice(0, 5) ?? t;
  return t.slice(5);
};

const STARTING_CASH = 10_000;

function loadWatchlist(): WatchlistItem[] {
  try { return JSON.parse(localStorage.getItem("watchlist") ?? "[]"); } catch { return []; }
}
function saveWatchlist(w: WatchlistItem[]) {
  localStorage.setItem("watchlist", JSON.stringify(w));
}
function loadPortfolio(): Portfolio {
  try {
    const p = JSON.parse(localStorage.getItem("portfolio") ?? "null");
    return p ?? { cash: STARTING_CASH, holdings: [] };
  } catch { return { cash: STARTING_CASH, holdings: [] }; }
}
function savePortfolio(p: Portfolio) {
  localStorage.setItem("portfolio", JSON.stringify(p));
}

function AIExplainModal({
  symbol, points, quote, onClose,
}: {
  symbol: string;
  points: { time: string; close: number }[];
  quote:  { price: number; change: number; changePct: string } | null;
  onClose: () => void;
}) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const first  = points[0]?.close ?? 0;
      const last   = points[points.length - 1]?.close ?? 0;
      const trend  = last > first ? "upward" : last < first ? "downward" : "flat";
      const swing  = Math.abs(((last - first) / first) * 100).toFixed(2);
      const maxP   = Math.max(...points.map(p => p.close));
      const minP   = Math.min(...points.map(p => p.close));

      const prompt = `You are FinMentor AI. Explain the following stock chart data to a beginner investor in simple, friendly language. Keep it under 150 words. Use plain text, no markdown.

Stock: ${symbol}
Current price: $${quote?.price ?? last}
Today's change: ${quote?.changePct ?? "N/A"}
Chart trend: ${trend} over the shown period
Price swing: ${swing}%
Highest price shown: $${fmt(maxP)}
Lowest price shown: $${fmt(minP)}
Data points: ${points.length}

Explain what this chart tells us, whether this looks positive or concerning, and one simple takeaway for a beginner.`;

      try {
        const res  = await fetch("/api/finbot", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            budgetContext: "User is viewing a stock chart.",
          }),
        });
        const data = await res.json();
        setExplanation(data.content?.[0]?.text ?? "Could not generate explanation.");
      } catch {
        setExplanation("Could not reach AI mentor. Please check your API setup.");
      } finally {
        setLoading(false);
      }
    })();
  }, [symbol, points, quote]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <Sparkles size={16} className="text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-800">AI Chart Explanation</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">{symbol} · Powered by Claude</p>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${85 - i * 10}%` }} />
            ))}
          </div>
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
        )}
        <p className="text-[10px] text-gray-400 mt-4">Not financial advice · For educational purposes only</p>
      </motion.div>
    </motion.div>
  );
}

function TradeModal({
  symbol, price, portfolio, onClose, onTrade,
}: {
  symbol:    string;
  price:     number;
  portfolio: Portfolio;
  onClose:   () => void;
  onTrade:   (type: "buy" | "sell", shares: number) => void;
}) {
  const [type, setType]     = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState("1");
  const n       = parseFloat(shares) || 0;
  const total   = n * price;
  const holding = portfolio.holdings.find(h => h.symbol === symbol);
  const canBuy  = total <= portfolio.cash && n > 0;
  const canSell = !!holding && n > 0 && n <= holding.shares;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-800">Simulated Trade · {symbol}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
          {(["buy", "sell"] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t
                  ? t === "buy" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  : "text-gray-500"
              }`}
            >
              {t === "buy" ? "Buy" : "Sell"}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Price per share</span>
            <span className="font-medium text-gray-800">${fmt(price)}</span>
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Shares</label>
            <input
              type="number"
              min="0"
              value={shares}
              onChange={e => setShares(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex justify-between text-sm font-medium border-t pt-3">
            <span>Total</span>
            <span>${fmt(total)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Available cash</span>
            <span>${fmt(portfolio.cash)}</span>
          </div>
          {holding && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Shares owned</span>
              <span>{holding.shares}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => { if ((type === "buy" && canBuy) || (type === "sell" && canSell)) { onTrade(type, n); onClose(); } }}
          disabled={type === "buy" ? !canBuy : !canSell}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            type === "buy" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {type === "buy" ? `Buy ${n} share${n !== 1 ? "s" : ""}` : `Sell ${n} share${n !== 1 ? "s" : ""}`}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2">Simulated only · No real money involved</p>
      </motion.div>
    </motion.div>
  );
}

export default function StockPage() {
  const [symbol, setSymbol]           = useState("AAPL");
  const [selectedDays, setSelectedDays] = useState<"7" | "90">("90");
  const [watchlist, setWatchlist]     = useState<WatchlistItem[]>([]);
  const [portfolio, setPortfolio]     = useState<Portfolio>({ cash: STARTING_CASH, holdings: [] });
  const [showExplain, setShowExplain] = useState(false);
  const [showTrade, setShowTrade]     = useState(false);
  const [toast, setToast]             = useState<string | null>(null);
  const [searchQ, setSearchQ]         = useState("");
  const searchRef                     = useRef<HTMLDivElement>(null);

  const { quote,  loading: qLoad, refetch: refetchQ } = useStockQuote(symbol);
  const { points, loading: cLoad }                    = useStockChart(symbol, "daily");
  const { results, loading: sLoad, search, clearResults } = useStockSearch();

  useEffect(() => {
    setWatchlist(loadWatchlist());
    setPortfolio(loadPortfolio());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (searchQ) search(searchQ); else clearResults(); }, 400);
    return () => clearTimeout(t);
  }, [searchQ, search, clearResults]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const isWatched   = watchlist.some(w => w.symbol === symbol);
  const toggleWatch = () => {
    const next = isWatched
      ? watchlist.filter(w => w.symbol !== symbol)
      : [...watchlist, { symbol, addedAt: new Date().toISOString(), lastPrice: quote?.price }];
    setWatchlist(next);
    saveWatchlist(next);
    showToast(isWatched ? `Removed ${symbol} from watchlist` : `Added ${symbol} to watchlist`);
  };

  const handleTrade = (type: "buy" | "sell", shares: number) => {
    if (!quote) return;
    const cost = shares * quote.price;
    setPortfolio(prev => {
      let next: Portfolio;
      if (type === "buy") {
        const existing = prev.holdings.find(h => h.symbol === symbol);
        const holdings = existing
          ? prev.holdings.map(h => h.symbol === symbol
              ? { ...h, shares: h.shares + shares, avgPrice: (h.avgPrice * h.shares + cost) / (h.shares + shares) }
              : h)
          : [...prev.holdings, { symbol, shares, avgPrice: quote.price, boughtAt: new Date().toISOString() }];
        next = { cash: prev.cash - cost, holdings };
      } else {
        const holdings = prev.holdings
          .map(h => h.symbol === symbol ? { ...h, shares: h.shares - shares } : h)
          .filter(h => h.shares > 0);
        next = { cash: prev.cash + cost, holdings };
      }
      savePortfolio(next);
      return next;
    });
    showToast(`${type === "buy" ? "Bought" : "Sold"} ${shares} share${shares !== 1 ? "s" : ""} of ${symbol}`);
  };

  const isUp           = (quote?.change ?? 0) >= 0;
  const holding        = portfolio.holdings.find(h => h.symbol === symbol);
  const chartData      = points
    .slice(selectedDays === "7" ? -7 : -90)
    .map((p: ChartPoint) => ({ ...p, time: fmtTime(p.time) }));
  const portfolioValue = portfolio.holdings.reduce((sum, h) => {
    const price = h.symbol === symbol ? (quote?.price ?? h.avgPrice) : h.avgPrice;
    return sum + h.shares * price;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📈 Stock Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">Live prices · AI insights · Simulated trading</p>
          </div>
          <div className="relative w-full md:w-80" ref={searchRef}>
            <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 gap-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-300">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search stocks... (e.g. Apple, TSLA)"
                className="flex-1 py-2.5 text-sm bg-transparent outline-none text-gray-800 placeholder-gray-400"
              />
              {sLoad && <RefreshCw size={14} className="text-gray-400 animate-spin" />}
            </div>
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
                {results.map((r) => (
                  <button
                    key={r.symbol}
                    onClick={() => { setSymbol(r.symbol); setSearchQ(""); clearResults(); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <span className="font-semibold text-sm text-gray-800">{r.symbol}</span>
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quote card */}
        <motion.div
          key={symbol}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          {qLoad ? (
            <div className="space-y-3">
              <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
              <div className="h-12 w-56 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : quote ? (
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{quote.symbol}</h2>
                  <button onClick={toggleWatch} className="text-gray-400 hover:text-yellow-500 transition-colors">
                    {isWatched ? <Star size={20} className="fill-yellow-400 text-yellow-400" /> : <StarOff size={20} />}
                  </button>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-bold text-gray-900">${fmt(quote.price)}</span>
                  <div className={`flex items-center gap-1 pb-1 ${isUp ? "text-green-600" : "text-red-500"}`}>
                    {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    <span className="font-semibold">{isUp ? "+" : ""}{fmt(quote.change)} ({quote.changePct})</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">As of {quote.latestDay}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "High",       value: `$${fmt(quote.high)}` },
                  { label: "Low",        value: `$${fmt(quote.low)}` },
                  { label: "Prev Close", value: `$${fmt(quote.prevClose)}` },
                  { label: "Volume",     value: fmtK(quote.volume) },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="font-semibold text-gray-800 text-sm mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-red-500 text-sm">Could not load quote. Check your API key or try again.</p>
          )}
        </motion.div>

        {/* Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-semibold text-gray-800">Price Chart</h3>
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                {(["7", "90"] as const).map(days => (
                  <button
                    key={days}
                    onClick={() => setSelectedDays(days)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      selectedDays === days ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {days === "7" ? "7D" : "90D"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowExplain(true)}
                disabled={points.length === 0}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
              >
                <Sparkles size={13} />
                AI Explain
              </button>
              <button onClick={refetchQ} className="text-gray-400 hover:text-gray-600 transition-colors">
                <RefreshCw size={16} className={qLoad ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {cLoad ? (
            <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={isUp ? "#6366F1" : "#EF4444"} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={isUp ? "#6366F1" : "#EF4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={60} />
                <Tooltip
                  formatter={(v) => [`$${fmt(v as number)}`, "Price"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isUp ? "#6366F1" : "#EF4444"}
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              No chart data available
            </div>
          )}
        </div>

        {/* Portfolio + Watchlist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">💼 Simulated Portfolio</h3>
              <button
                onClick={() => setShowTrade(true)}
                disabled={!quote}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
              >
                <ShoppingCart size={13} />
                Trade {symbol}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Cash</p>
                <p className="font-bold text-green-700">${fmt(portfolio.cash)}</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Holdings value</p>
                <p className="font-bold text-indigo-700">${fmt(portfolioValue)}</p>
              </div>
            </div>
            {portfolio.holdings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No holdings yet. Try buying some shares!</p>
            ) : (
              <div className="space-y-2">
                {portfolio.holdings.map(h => {
                  const currentPrice = h.symbol === symbol ? (quote?.price ?? h.avgPrice) : h.avgPrice;
                  const gain = (currentPrice - h.avgPrice) * h.shares;
                  return (
                    <div key={h.symbol} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <button onClick={() => setSymbol(h.symbol)} className="font-semibold text-sm text-indigo-600 hover:underline">
                          {h.symbol}
                        </button>
                        <p className="text-xs text-gray-400">{h.shares} shares · avg ${fmt(h.avgPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">${fmt(currentPrice * h.shares)}</p>
                        <p className={`text-xs ${gain >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {gain >= 0 ? "+" : ""}${fmt(gain)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">⭐ Watchlist</h3>
              <span className="text-xs text-gray-400">{watchlist.length} stocks</span>
            </div>
            {watchlist.length === 0 ? (
              <div className="text-center py-6">
                <Star size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No stocks saved yet.</p>
                <p className="text-gray-400 text-xs mt-1">Click the ★ on any stock to add it.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {watchlist.map(w => (
                  <div key={w.symbol} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <button onClick={() => setSymbol(w.symbol)} className="font-semibold text-sm text-indigo-600 hover:underline">
                      {w.symbol}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Added {new Date(w.addedAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => { const next = watchlist.filter(x => x.symbol !== w.symbol); setWatchlist(next); saveWatchlist(next); }}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Learn more */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">New to stocks?</h3>
            <p className="text-sm text-gray-600">Check out our beginner guide to understand how stocks work before investing.</p>
          </div>
          <a
            href="/Educational_M"
            className="flex items-center gap-2 bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-50 transition-colors shrink-0 ml-4"
          >
            <BookOpen size={15} />
            Learn
          </a>
        </div>
      </div>

      <AnimatePresence>
        {showExplain && (
          <AIExplainModal symbol={symbol} points={points} quote={quote} onClose={() => setShowExplain(false)} />
        )}
        {showTrade && quote && (
          <TradeModal symbol={symbol} price={quote.price} portfolio={portfolio} onClose={() => setShowTrade(false)} onTrade={handleTrade} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}