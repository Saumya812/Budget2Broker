"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Star, StarOff, TrendingUp, TrendingDown,
  RefreshCw, Sparkles, ShoppingCart, X, BookOpen,
  ChevronUp, ChevronDown, Activity, Zap, DollarSign,
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
function saveWatchlist(w: WatchlistItem[]) { localStorage.setItem("watchlist", JSON.stringify(w)); }
function loadPortfolio(): Portfolio {
  try {
    const p = JSON.parse(localStorage.getItem("portfolio") ?? "null");
    return p ?? { cash: STARTING_CASH, holdings: [] };
  } catch { return { cash: STARTING_CASH, holdings: [] }; }
}
function savePortfolio(p: Portfolio) { localStorage.setItem("portfolio", JSON.stringify(p)); }

/* ── Grid background ── */
function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "15%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,207,255,0.04) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

/* ── Custom tooltip ── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, padding: "8px 14px", fontFamily: "var(--mono)", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
      <p style={{ color: "var(--text3)", marginBottom: 2, fontSize: 10 }}>{label}</p>
      <p style={{ color: "var(--em)", fontWeight: 700 }}>${fmt(payload[0].value)}</p>
    </div>
  );
}

/* ── AI Explain Modal ── */
function AIExplainModal({ symbol, points, quote, onClose }: {
  symbol: string;
  points: { time: string; close: number }[];
  quote: { price: number; change: number; changePct: string } | null;
  onClose: () => void;
}) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const first = points[0]?.close ?? 0;
      const last  = points[points.length - 1]?.close ?? 0;
      const trend = last > first ? "upward" : last < first ? "downward" : "flat";
      const swing = Math.abs(((last - first) / (first || 1)) * 100).toFixed(2);
      const maxP  = Math.max(...points.map(p => p.close));
      const minP  = Math.min(...points.map(p => p.close));

      const prompt = `You are FinMentor AI. Explain the following stock chart data to a beginner investor in simple, friendly language. Keep it under 150 words. Use plain text, no markdown.\n\nStock: ${symbol}\nCurrent price: $${quote?.price ?? last}\nToday's change: ${quote?.changePct ?? "N/A"}\nChart trend: ${trend} over the shown period\nPrice swing: ${swing}%\nHighest price shown: $${fmt(maxP)}\nLowest price shown: $${fmt(minP)}\n\nExplain what this chart tells us, whether this looks positive or concerning, and one simple takeaway for a beginner.`;

      try {
        const res  = await fetch("/api/finbot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: prompt }], budgetContext: "User is viewing a stock chart." }) });
        const data = await res.json();
        setExplanation(data.content?.[0]?.text ?? "Could not generate explanation.");
      } catch {
        setExplanation("Could not reach AI mentor. Please check your API setup.");
      } finally { setLoading(false); }
    })();
  }, [symbol, points, quote]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 20, padding: 28, maxWidth: 460, width: "100%", boxShadow: "0 0 60px rgba(0,255,136,0.15)", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(0,255,136,0.3)" }}>
              <Sparkles size={17} color="var(--em)" />
            </div>
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px" }}>// AI CHART ANALYSIS</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{symbol}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
          ><X size={13} /></button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[80, 65, 90, 55].map((w, i) => (
              <div key={i} style={{ height: 12, background: "var(--surface2)", borderRadius: 4, width: `${w}%`, animation: "pulse-em 1.5s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.8 }}>{explanation}</p>
        )}
        <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 16, letterSpacing: "0.5px" }}>POWERED BY CLAUDE · NOT FINANCIAL ADVICE</p>
      </motion.div>
    </motion.div>
  );
}

/* ── Trade Modal ── */
function TradeModal({ symbol, price, portfolio, onClose, onTrade }: {
  symbol: string; price: number; portfolio: Portfolio;
  onClose: () => void; onTrade: (type: "buy" | "sell", shares: number) => void;
}) {
  const [type, setType]     = useState<"buy" | "sell">("buy");
  const [shares, setShares] = useState("1");
  const n       = parseFloat(shares) || 0;
  const total   = n * price;
  const holding = portfolio.holdings.find(h => h.symbol === symbol);
  const canBuy  = total <= portfolio.cash && n > 0;
  const canSell = !!holding && n > 0 && n <= holding.shares;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: `1px solid ${type === "buy" ? "rgba(0,255,136,0.3)" : "rgba(255,68,68,0.3)"}`, borderRadius: 20, padding: 24, maxWidth: 380, width: "100%", boxShadow: type === "buy" ? "0 0 40px rgba(0,255,136,0.1)" : "0 0 40px rgba(255,68,68,0.1)", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${type === "buy" ? "var(--em)" : "var(--red)"}, transparent)` }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "2px", marginBottom: 2 }}>// SIMULATED TRADE</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{symbol}</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
        </div>

        {/* Buy/Sell toggle */}
        <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 10, padding: 3, marginBottom: 18, border: "1px solid var(--border)" }}>
          {(["buy", "sell"] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "0.5px", background: type === t ? (t === "buy" ? "var(--em)" : "var(--red)") : "transparent", color: type === t ? "#000" : "var(--text3)", transition: "all 0.2s", boxShadow: type === t ? (t === "buy" ? "0 0 12px rgba(0,255,136,0.4)" : "0 0 12px rgba(255,68,68,0.4)") : "none" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
          {[
            { label: "PRICE PER SHARE", value: `$${fmt(price)}` },
            { label: "AVAILABLE CASH",  value: `$${fmt(portfolio.cash)}` },
            ...(holding ? [{ label: "SHARES OWNED", value: `${holding.shares}` }] : []),
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.5px" }}>{s.label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{s.value}</span>
            </div>
          ))}

          <div>
            <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "0.5px" }}>SHARES</label>
            <input type="number" min="0" value={shares} onChange={e => setShares(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 14, color: "var(--text)", fontFamily: "var(--mono)", outline: "none", fontWeight: 700 }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.5px" }}>TOTAL</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: type === "buy" ? "var(--em)" : "var(--red)", textShadow: type === "buy" ? "0 0 12px rgba(0,255,136,0.4)" : "0 0 12px rgba(255,68,68,0.4)" }}>${fmt(total)}</span>
          </div>
        </div>

        <button
          onClick={() => { if ((type === "buy" && canBuy) || (type === "sell" && canSell)) { onTrade(type, n); onClose(); } }}
          disabled={type === "buy" ? !canBuy : !canSell}
          style={{ width: "100%", padding: "12px", background: type === "buy" ? "var(--em)" : "var(--red)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: (type === "buy" ? canBuy : canSell) ? "pointer" : "not-allowed", fontFamily: "'Space Grotesk', sans-serif", opacity: (type === "buy" ? canBuy : canSell) ? 1 : 0.4, transition: "all 0.2s", boxShadow: (type === "buy" ? canBuy : canSell) ? (type === "buy" ? "0 0 20px rgba(0,255,136,0.4)" : "0 0 20px rgba(255,68,68,0.4)") : "none" }}
        >
          {type === "buy" ? `Buy ${n} share${n !== 1 ? "s" : ""}` : `Sell ${n} share${n !== 1 ? "s" : ""}`}
        </button>
        <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", textAlign: "center", marginTop: 10, letterSpacing: "0.5px" }}>SIMULATED ONLY · NO REAL MONEY</p>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function StockPage() {
  const [symbol, setSymbol]           = useState("AAPL");
  const [selectedDays, setSelectedDays] = useState<"7" | "90">("90");
  const [watchlist, setWatchlist]     = useState<WatchlistItem[]>([]);
  const [portfolio, setPortfolio]     = useState<Portfolio>({ cash: STARTING_CASH, holdings: [] });
  const [showExplain, setShowExplain] = useState(false);
  const [showTrade, setShowTrade]     = useState(false);
  const [toast, setToast]             = useState<string | null>(null);
  const [searchQ, setSearchQ]         = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
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
    setWatchlist(next); saveWatchlist(next);
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
          ? prev.holdings.map(h => h.symbol === symbol ? { ...h, shares: h.shares + shares, avgPrice: (h.avgPrice * h.shares + cost) / (h.shares + shares) } : h)
          : [...prev.holdings, { symbol, shares, avgPrice: quote.price, boughtAt: new Date().toISOString() }];
        next = { cash: prev.cash - cost, holdings };
      } else {
        const holdings = prev.holdings.map(h => h.symbol === symbol ? { ...h, shares: h.shares - shares } : h).filter(h => h.shares > 0);
        next = { cash: prev.cash + cost, holdings };
      }
      savePortfolio(next); return next;
    });
    showToast(`${type === "buy" ? "Bought" : "Sold"} ${shares} share${shares !== 1 ? "s" : ""} of ${symbol}`);
  };

  const isUp         = (quote?.change ?? 0) >= 0;
  const chartData    = points.slice(selectedDays === "7" ? -7 : -90).map((p: ChartPoint) => ({ ...p, time: fmtTime(p.time) }));
  const portValue    = portfolio.holdings.reduce((sum, h) => sum + h.shares * (h.symbol === symbol ? (quote?.price ?? h.avgPrice) : h.avgPrice), 0);
  const totalValue   = portfolio.cash + portValue;
  const totalGain    = totalValue - STARTING_CASH;

  /* Sparkline for mini chart in watchlist */
  const avgPrice = chartData.length > 0 ? chartData.reduce((s, p) => s + p.close, 0) / chartData.length : 0;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 6 }}>// STOCK TRACKER</p>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Live <span style={{ color: "var(--em)" }}>Markets</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--em)", display: "inline-block", boxShadow: "0 0 8px var(--em)", animation: "pulse-em 2s infinite" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)", fontWeight: 700, letterSpacing: "1px" }}>LIVE</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>· Real-time prices · AI insights · Simulated trading</span>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", width: 300 }} ref={searchRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: `1px solid ${searchFocused ? "var(--em)" : "var(--border2)"}`, borderRadius: 10, padding: "10px 14px", boxShadow: searchFocused ? "0 0 0 3px var(--em3)" : "none", transition: "all 0.2s" }}>
              <Search size={14} color="var(--text3)" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search stocks... (e.g. Tesla, AAPL)"
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", flex: 1 }}
              />
              {sLoad && <RefreshCw size={13} color="var(--text3)" style={{ animation: "spin 1s linear infinite" }} />}
            </div>
            {results.length > 0 && searchFocused && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 50, overflow: "hidden" }}>
                {results.map(r => (
                  <button key={r.symbol} onClick={() => { setSymbol(r.symbol); setSearchQ(""); clearResults(); }}
                    style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "background 0.15s", fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--em)" }}>{r.symbol}</span>
                    <span style={{ fontSize: 11, color: "var(--text3)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Quote card ── */}
        <motion.div key={symbol} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface)", border: `1px solid ${isUp ? "rgba(0,255,136,0.2)" : "rgba(255,68,68,0.2)"}`, borderRadius: "var(--radius-lg)", padding: "22px 24px", marginBottom: 16, position: "relative", overflow: "hidden", boxShadow: isUp ? "0 0 40px rgba(0,255,136,0.05)" : "0 0 40px rgba(255,68,68,0.05)" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${isUp ? "var(--em)" : "var(--red)"}, transparent)` }} />

          {qLoad ? (
            <div style={{ display: "flex", gap: 20 }}>
              {[140, 200, 100].map((w, i) => <div key={i} style={{ height: 20, width: w, background: "var(--surface2)", borderRadius: 4, animation: "pulse-em 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />)}
            </div>
          ) : quote ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <h2 style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>{quote.symbol}</h2>
                  <button onClick={toggleWatch} style={{ background: "none", border: "none", cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.2)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {isWatched ? <Star size={20} fill="#FFD600" color="#FFD600" style={{ filter: "drop-shadow(0 0 8px #FFD600)" }} /> : <StarOff size={20} color="var(--text3)" />}
                  </button>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px" }}>As of {quote.latestDay}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 44, fontWeight: 700, color: "var(--text)", lineHeight: 1, textShadow: isUp ? "0 0 30px rgba(0,255,136,0.2)" : "0 0 30px rgba(255,68,68,0.2)" }}>${fmt(quote.price)}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {isUp ? <ChevronUp size={18} color="var(--em)" /> : <ChevronDown size={18} color="var(--red)" />}
                    <span style={{ fontFamily: "var(--mono)", fontSize: 15, fontWeight: 700, color: isUp ? "var(--em)" : "var(--red)", textShadow: isUp ? "0 0 12px rgba(0,255,136,0.5)" : "0 0 12px rgba(255,68,68,0.5)" }}>
                      {isUp ? "+" : ""}{fmt(quote.change)} ({quote.changePct})
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { label: "HIGH",       value: `$${fmt(quote.high)}`,     color: "var(--em)" },
                  { label: "LOW",        value: `$${fmt(quote.low)}`,      color: "var(--red)" },
                  { label: "PREV CLOSE", value: `$${fmt(quote.prevClose)}`, color: "var(--text2)" },
                  { label: "VOLUME",     value: fmtK(quote.volume),        color: "var(--text2)" },
                ].map(s => (
                  <div key={s.label} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 16px", minWidth: 90, textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "1px", marginBottom: 4 }}>{s.label}</p>
                    <p style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</p>
                  </div>
                ))}

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => setShowTrade(true)} disabled={!quote}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: "var(--em)", color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--mono)", letterSpacing: "0.5px", boxShadow: "0 0 16px rgba(0,255,136,0.4)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(0,255,136,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 16px rgba(0,255,136,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <ShoppingCart size={13} /> TRADE
                  </button>
                  <button onClick={refetchQ}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "transparent", color: "var(--text3)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--em)"; e.currentTarget.style.color = "var(--em)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
                  >
                    <RefreshCw size={11} className={qLoad ? "animate-spin" : ""} /> REFRESH
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--red)" }}>Could not load quote. Check your API key or try again.</p>
          )}
        </motion.div>

        {/* ── Chart ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 16, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${isUp ? "var(--em)" : "var(--red)"}, transparent)` }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={14} color="var(--text3)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)", fontWeight: 600 }}>PRICE CHART</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>· {symbol}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Range toggle */}
              <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 8, padding: 3, border: "1px solid var(--border)", gap: 3 }}>
                {(["7", "90"] as const).map(d => (
                  <button key={d} onClick={() => setSelectedDays(d)}
                    style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)", background: selectedDays === d ? (isUp ? "var(--em)" : "var(--red)") : "transparent", color: selectedDays === d ? "#000" : "var(--text3)", transition: "all 0.2s", boxShadow: selectedDays === d ? (isUp ? "0 0 8px rgba(0,255,136,0.4)" : "0 0 8px rgba(255,68,68,0.4)") : "none" }}
                  >{d === "7" ? "7D" : "90D"}</button>
                ))}
              </div>
              {/* AI Explain */}
              <button onClick={() => setShowExplain(true)} disabled={points.length === 0}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, cursor: "pointer", color: "var(--em)", fontSize: 11, fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: "0.5px", transition: "all 0.2s", boxShadow: "0 0 12px rgba(0,255,136,0.1)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,255,136,0.15)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(0,255,136,0.25)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,255,136,0.08)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(0,255,136,0.1)"; }}
              >
                <Sparkles size={12} /> AI EXPLAIN
              </button>
            </div>
          </div>

          {cLoad ? (
            <div style={{ height: 280, background: "var(--bg3)", borderRadius: 10, animation: "pulse-em 1.5s ease-in-out infinite" }} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={isUp ? "#00FF88" : "#FF4444"} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={isUp ? "#00FF88" : "#FF4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: "var(--mono)", fill: "var(--text3)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fontFamily: "var(--mono)", fill: "var(--text3)" }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} width={65} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={avgPrice} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="close" stroke={isUp ? "#00FF88" : "#FF4444"} strokeWidth={2}
                  fill="url(#priceGrad)" dot={false} activeDot={{ r: 5, fill: isUp ? "#00FF88" : "#FF4444", stroke: "var(--bg)", strokeWidth: 2, filter: `drop-shadow(0 0 6px ${isUp ? "#00FF88" : "#FF4444"})` }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)" }}>NO CHART DATA AVAILABLE</p>
            </div>
          )}
        </motion.div>

        {/* ── Bottom grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="fm-stock-grid">

          {/* Portfolio */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px", overflow: "hidden", position: "relative" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <DollarSign size={13} color="var(--em)" />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "1px" }}>PORTFOLIO</span>
              </div>
              <button onClick={() => setShowTrade(true)} disabled={!quote}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", background: "var(--em3)", border: "1px solid var(--em2)", borderRadius: 6, cursor: "pointer", color: "var(--em)", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "0.5px", transition: "all 0.15s" }}
              ><ShoppingCart size={10} /> TRADE {symbol}</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "CASH",    value: `$${fmt(portfolio.cash)}`,  color: "var(--em)" },
                { label: "HOLDINGS", value: `$${fmt(portValue)}`,       color: "#00CFFF" },
                { label: "TOTAL",   value: `$${fmt(totalValue)}`,       color: "var(--text)" },
                { label: "P&L",     value: `${totalGain >= 0 ? "+" : ""}$${fmt(totalGain)}`, color: totalGain >= 0 ? "var(--em)" : "var(--red)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</p>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: s.color, textShadow: s.color !== "var(--text)" ? `0 0 10px ${s.color}50` : "none" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {portfolio.holdings.length === 0 ? (
              <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>NO HOLDINGS · START TRADING</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
                {portfolio.holdings.map(h => {
                  const cur  = h.symbol === symbol ? (quote?.price ?? h.avgPrice) : h.avgPrice;
                  const gain = (cur - h.avgPrice) * h.shares;
                  return (
                    <div key={h.symbol} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7 }}>
                      <div>
                        <button onClick={() => setSymbol(h.symbol)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--em)", padding: 0 }}>{h.symbol}</button>
                        <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 1 }}>{h.shares} @ ${fmt(h.avgPrice)}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--text)" }}>${fmt(cur * h.shares)}</p>
                        <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: gain >= 0 ? "var(--em)" : "var(--red)" }}>{gain >= 0 ? "+" : ""}${fmt(gain)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Watchlist */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px", overflow: "hidden", position: "relative" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #FFD600, transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Star size={13} color="#FFD600" />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FFD600", letterSpacing: "1px" }}>WATCHLIST</span>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{watchlist.length} STOCKS</span>
            </div>

            {watchlist.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Star size={28} color="var(--border2)" style={{ display: "block", margin: "0 auto 8px" }} />
                <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>NO STOCKS SAVED</p>
                <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>Click ★ on any stock to save it</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {watchlist.map(w => (
                  <div key={w.symbol} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 7, transition: "border-color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,214,0,0.3)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div>
                      <button onClick={() => setSymbol(w.symbol)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--em)", padding: 0 }}>{w.symbol}</button>
                      <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 1 }}>{new Date(w.addedAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => { const next = watchlist.filter(x => x.symbol !== w.symbol); setWatchlist(next); saveWatchlist(next); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", transition: "color 0.15s", padding: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}
                    ><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Learn more */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #A855F7, transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
              <BookOpen size={13} color="#A855F7" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", letterSpacing: "1px" }}>LEARN</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {[
                { label: "What is a Stock?",        href: "/Educational_Modules", color: "#00FF88" },
                { label: "Risk vs. Reward",          href: "/Educational_Modules", color: "#00CFFF" },
                { label: "How to Read Charts",       href: "/Educational_Modules", color: "#A855F7" },
                { label: "Dollar-Cost Averaging",    href: "/Educational_Modules", color: "#FF6B35" },
                { label: "Index Funds for Beginners", href: "/Educational_Modules", color: "#FFD600" },
              ].map((item, i) => (
                <a key={i} href={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none", transition: "all 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = item.color + "40"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg3)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text2)" }}>{item.label}</span>
                  </div>
                  <Zap size={11} color={item.color} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showExplain && <AIExplainModal symbol={symbol} points={points} quote={quote} onClose={() => setShowExplain(false)} />}
        {showTrade && quote && <TradeModal symbol={symbol} price={quote.price} portfolio={portfolio} onClose={() => setShowTrade(false)} onTrade={handleTrade} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", background: "var(--surface2)", border: "1px solid var(--border2)", color: "var(--text)", fontSize: 13, fontFamily: "var(--mono)", padding: "10px 20px", borderRadius: 100, zIndex: 300, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", whiteSpace: "nowrap", letterSpacing: "0.3px" }}
          >{toast}</motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-em { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @media (max-width: 900px) { .fm-stock-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .fm-stock-grid { grid-template-columns: 1fr !important; } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  );
}