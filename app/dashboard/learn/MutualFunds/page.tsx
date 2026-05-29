"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, DollarSign, ArrowRight, Shield, Zap, BookOpen } from "lucide-react";
import Link from "next/link";

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(168,85,247,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "20%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 70%)" }} />
    </div>
  );
}

const FUND_TYPES = [
  { name: "S&P 500 Index Fund", ticker: "VOO", expense: "0.03%", return5y: "+82%", color: "#00FF88", desc: "Tracks the 500 largest US companies. The single best investment for most beginners.", risk: "Medium" },
  { name: "Total Market ETF",   ticker: "VTI", expense: "0.03%", return5y: "+78%", color: "#00CFFF", desc: "Invests in the entire US stock market — over 4,000 companies in one fund.", risk: "Medium" },
  { name: "Bond Index Fund",    ticker: "BND", expense: "0.03%", return5y: "+12%", color: "#A855F7", desc: "Provides exposure to US investment-grade bonds. Stabilizes your portfolio.", risk: "Low" },
  { name: "International ETF",  ticker: "VXUS", expense: "0.07%", return5y: "+31%", color: "#FF6B35", desc: "Invests in stocks outside the US. Great for global diversification.", risk: "Medium-High" },
];

const COMPARISON = [
  { feature: "Trade during market hours", mutualFund: false, etf: true },
  { feature: "Minimum investment",        mutualFund: true,  etf: false, note: "ETFs = 1 share" },
  { feature: "Lower expense ratios",      mutualFund: false, etf: true },
  { feature: "Tax efficiency",            mutualFund: false, etf: true },
  { feature: "Automatic rebalancing",     mutualFund: true,  etf: false },
  { feature: "Professional management",   mutualFund: true,  etf: false, note: "Active funds only" },
];

export default function MutualFundsPage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Link href="/dashboard/learn" style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", textDecoration: "none", letterSpacing: "1px" }}>INVESTMENTS</Link>
            <span style={{ color: "var(--text3)" }}>/</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", letterSpacing: "1px" }}>MUTUAL FUNDS & ETFS</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>
            Mutual Funds <span style={{ color: "#A855F7" }}>& ETFs</span>
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 600, lineHeight: 1.7 }}>
            Instant diversification with a single purchase. The smartest way for beginners to start investing — low cost, low effort, high impact.
          </p>
        </motion.div>

        {/* Popular ETFs */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", letterSpacing: "2px", marginBottom: 16 }}>// POPULAR FUNDS</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="fm-grid-2">
            {FUND_TYPES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                style={{ background: "var(--surface)", border: `1px solid ${hovered === i ? f.color + "40" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "22px", position: "relative", overflow: "hidden", transition: "all 0.25s", transform: hovered === i ? "translateY(-3px)" : "none", boxShadow: hovered === i ? `0 12px 40px ${f.color}15` : "none" }}
              >
                {hovered === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: f.color, textShadow: hovered === i ? `0 0 20px ${f.color}60` : "none", transition: "text-shadow 0.25s" }}>{f.ticker}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 100, padding: "2px 8px" }}>{f.return5y} 5Y</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 8px" }}>FEE: {f.expense}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{f.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, marginBottom: 10 }}>{f.desc}</p>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>RISK: {f.risk}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ETF vs Mutual Fund comparison */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: "var(--surface)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 24, boxShadow: "0 0 40px rgba(168,85,247,0.05)" }}
        >
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #A855F7, transparent)" }} />
          <div style={{ padding: "20px 24px" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", letterSpacing: "2px", marginBottom: 16 }}>// ETF VS MUTUAL FUND</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "1px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>FEATURE</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", letterSpacing: "1px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>MUTUAL FUND</th>
                    <th style={{ textAlign: "center", padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "1px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>ETF</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} style={{ borderBottom: i < COMPARISON.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", fontSize: 13, color: "var(--text2)" }}>
                        {row.feature}
                        {row.note && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginLeft: 6 }}>({row.note})</span>}
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span style={{ fontSize: 16, color: row.mutualFund ? "var(--em)" : "var(--red)" }}>{row.mutualFund ? "✓" : "✗"}</span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span style={{ fontSize: 16, color: row.etf ? "var(--em)" : "var(--red)" }}>{row.etf ? "✓" : "✗"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Key insight */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 14 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={16} color="#A855F7" />
          </div>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", letterSpacing: "1.5px", marginBottom: 6 }}>// KEY INSIGHT</p>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
              For most beginners, <span style={{ color: "#A855F7", fontWeight: 600 }}>a simple S&P 500 ETF like VOO or SPY</span> is all you need. It gives you ownership in 500 of America's best companies for just 0.03% per year in fees. Warren Buffett recommends it for most investors.
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/Educational_Modules" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#A855F7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 20px rgba(168,85,247,0.3)", transition: "all 0.2s" }}>
            <BookOpen size={15} /> Learn About ETFs <ArrowRight size={14} />
          </Link>
          <Link href="/dashboard/learn/stock" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "var(--em3)", color: "var(--em)", border: "1px solid var(--em2)", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}>
            <TrendingUp size={15} /> Practice Trading
          </Link>
          <Link href="/dashboard/learn" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "transparent", color: "var(--text2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            ← Back to Investments
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .fm-grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}