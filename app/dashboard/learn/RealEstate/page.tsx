"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, TrendingUp, DollarSign, ArrowRight, BarChart2, Shield, Zap, BookOpen, Building } from "lucide-react";
import Link from "next/link";

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,214,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,214,0,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,0,0.05) 0%, transparent 70%)" }} />
    </div>
  );
}

const STRATEGIES = [
  { name: "Buy & Hold Rental", icon: Home,     color: "#FFD600", roi: "6-10%/yr",  capital: "$20K+",  risk: "Medium", desc: "Buy a property, rent it out, and collect monthly income while it appreciates in value over time." },
  { name: "House Hacking",     icon: Building, color: "#00FF88", roi: "0% housing cost", capital: "$10K+", risk: "Low", desc: "Buy a multi-unit property, live in one unit, and let tenants pay your mortgage. Best starter strategy." },
  { name: "REITs",             icon: BarChart2, color: "#00CFFF", roi: "4-8%/yr",  capital: "$10+",   risk: "Low-Med", desc: "Buy real estate like stocks. REITs are required to pay 90% of income as dividends. No landlord headaches." },
  { name: "Fix & Flip",        icon: Zap,      color: "#FF6B35", roi: "15-30%/deal", capital: "$50K+", risk: "High", desc: "Buy undervalued properties, renovate them, and sell for profit. High reward but requires expertise and capital." },
];

const REITS = [
  { ticker: "O",    name: "Realty Income",      yield: "5.8%", sector: "Retail",       color: "#00FF88" },
  { ticker: "SPG",  name: "Simon Property",     yield: "5.2%", sector: "Malls",        color: "#00CFFF" },
  { ticker: "PLD",  name: "Prologis",           yield: "2.8%", sector: "Warehouses",   color: "#A855F7" },
  { ticker: "AMT",  name: "American Tower",     yield: "3.1%", sector: "Cell Towers",  color: "#FF6B35" },
  { ticker: "VNQ",  name: "Vanguard REIT ETF",  yield: "4.2%", sector: "Diversified",  color: "#FFD600" },
];

const STATS = [
  { label: "US Real Estate Market", value: "$43T",   sub: "Total value" },
  { label: "Avg Annual Appreciation", value: "3.8%", sub: "Last 30 years" },
  { label: "REIT Dividend Yield",   value: "4.2%",   sub: "Average" },
  { label: "Leverage Available",    value: "5x",     sub: "With 20% down" },
];

export default function RealEstatePage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [calc, setCalc] = useState({ price: "200000", down: "20", rent: "1800", expenses: "400" });

  const price    = parseFloat(calc.price) || 0;
  const down     = (parseFloat(calc.down) / 100) * price;
  const loan     = price - down;
  const monthly  = parseFloat(calc.rent) - parseFloat(calc.expenses) - (loan * 0.065 / 12);
  const cashReturn = down > 0 ? ((monthly * 12) / down * 100) : 0;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Link href="/dashboard/learn" style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", textDecoration: "none", letterSpacing: "1px" }}>INVESTMENTS</Link>
            <span style={{ color: "var(--text3)" }}>/</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FFD600", letterSpacing: "1px" }}>REAL ESTATE</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>
            Real Estate <span style={{ color: "#FFD600" }}>Investing</span>
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 600, lineHeight: 1.7 }}>
            Build wealth through property. Real estate offers rental income, appreciation, leverage, and tax advantages — all in one investment.
          </p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }} className="fm-stats-4">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 16px", textAlign: "center", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,214,0,0.4), transparent)" }} />
              <p style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: "#FFD600", marginBottom: 4, textShadow: "0 0 20px rgba(255,214,0,0.4)" }}>{s.value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Strategies */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FFD600", letterSpacing: "2px", marginBottom: 16 }}>// INVESTMENT STRATEGIES</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="fm-grid-2">
            {STRATEGIES.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                style={{ background: "var(--surface)", border: `1px solid ${hovered === i ? s.color + "40" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "22px", position: "relative", overflow: "hidden", transition: "all 0.25s", transform: hovered === i ? "translateY(-3px)" : "none", boxShadow: hovered === i ? `0 12px 40px ${s.color}15` : "none" }}
              >
                {hovered === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + "15", border: `1px solid ${s.color}25`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hovered === i ? `0 0 16px ${s.color}40` : "none", transition: "box-shadow 0.25s" }}>
                    <s.icon size={18} color={s.color} strokeWidth={1.5} />
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: s.color, background: s.color + "15", border: `1px solid ${s.color}25`, borderRadius: 100, padding: "2px 8px" }}>{s.roi}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 8px" }}>MIN {s.capital}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{s.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, marginBottom: 10 }}>{s.desc}</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>RISK: {s.risk}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main grid: REIT table + Calculator */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="fm-grid-2">

          {/* Popular REITs */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", position: "relative" }}
          >
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #FFD600, transparent)" }} />
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FFD600", letterSpacing: "2px" }}>// POPULAR REITS</p>
            </div>
            <div style={{ padding: "8px 0" }}>
              {REITS.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: i < REITS.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: r.color, minWidth: 44, textShadow: `0 0 10px ${r.color}50` }}>{r.ticker}</span>
                    <div>
                      <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{r.name}</p>
                      <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{r.sector}</p>
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--em)", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 6, padding: "3px 10px" }}>{r.yield}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rental calculator */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ background: "var(--surface)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: "var(--radius-lg)", overflow: "hidden", position: "relative", boxShadow: "0 0 30px rgba(255,214,0,0.05)" }}
          >
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #FFD600, transparent)" }} />
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FFD600", letterSpacing: "2px" }}>// RENTAL PROPERTY CALCULATOR</p>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "PROPERTY PRICE ($)", key: "price", placeholder: "200000" },
                  { label: "DOWN PAYMENT (%)",   key: "down",  placeholder: "20" },
                  { label: "MONTHLY RENT ($)",   key: "rent",  placeholder: "1800" },
                  { label: "MONTHLY EXPENSES ($)", key: "expenses", placeholder: "400" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", display: "block", marginBottom: 5, letterSpacing: "1px" }}>{f.label}</label>
                    <input type="number" value={calc[f.key as keyof typeof calc]}
                      onChange={e => setCalc(c => ({ ...c, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ width: "100%", padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 7, fontSize: 13, color: "var(--text)", fontFamily: "var(--mono)", outline: "none", transition: "border-color 0.2s" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "#FFD600")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
                    />
                  </div>
                ))}
              </div>

              <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Down Payment",       value: `$${down.toLocaleString()}` },
                  { label: "Monthly Cash Flow",  value: `$${monthly.toFixed(0)}`, color: monthly >= 0 ? "var(--em)" : "var(--red)" },
                  { label: "Cash-on-Cash Return", value: `${cashReturn.toFixed(1)}%`, color: cashReturn >= 8 ? "var(--em)" : cashReturn >= 4 ? "#FFD600" : "var(--red)" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.5px" }}>{r.label}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: r.color ?? "var(--text)", textShadow: r.color ? `0 0 10px ${r.color}50` : "none" }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 8, textAlign: "center", letterSpacing: "0.5px" }}>ASSUMES 6.5% MORTGAGE RATE · ESTIMATE ONLY</p>
            </div>
          </motion.div>
        </div>

        {/* Key insight */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          style={{ background: "rgba(255,214,0,0.05)", border: "1px solid rgba(255,214,0,0.2)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 14 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,214,0,0.1)", border: "1px solid rgba(255,214,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={16} color="#FFD600" />
          </div>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FFD600", letterSpacing: "1.5px", marginBottom: 6 }}>// KEY INSIGHT</p>
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
              For beginners, <span style={{ color: "#FFD600", fontWeight: 600 }}>REITs are the best entry point</span> — you get real estate exposure with the liquidity of stocks and no landlord responsibilities. Once you have more capital, house hacking is the fastest path to owning your first rental property.
            </p>
          </div>
        </motion.div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/Educational_Modules" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#FFD600", color: "#000", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 20px rgba(255,214,0,0.3)", transition: "all 0.2s" }}>
            <BookOpen size={15} /> Learn About Real Estate <ArrowRight size={14} />
          </Link>
          <Link href="/dashboard/learn" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "transparent", color: "var(--text2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            ← Back to Investments
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .fm-stats-4 { grid-template-columns: repeat(2,1fr) !important; } .fm-grid-2 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}