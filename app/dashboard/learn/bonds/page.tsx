"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, DollarSign, ArrowRight, BarChart2, Lock, Zap, BookOpen } from "lucide-react";
import Link from "next/link";

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,207,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,207,255,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,207,255,0.05) 0%, transparent 70%)" }} />
    </div>
  );
}

const BOND_TYPES = [
  { name: "Government Bonds", yield: "4.2%", risk: "Very Low", term: "1-30 years", color: "#00FF88", desc: "Backed by the US government. The safest investment you can make outside of a savings account.", icon: Shield },
  { name: "Corporate Bonds",  yield: "5.8%", risk: "Medium",   term: "1-20 years", color: "#00CFFF", desc: "Issued by companies to raise capital. Higher yield than government bonds but with more risk.", icon: BarChart2 },
  { name: "Municipal Bonds",  yield: "3.1%", risk: "Low",      term: "1-30 years", color: "#A855F7", desc: "Issued by states and cities. Often tax-free, making them ideal for high-income investors.", icon: Lock },
  { name: "High-Yield Bonds", yield: "7.4%", risk: "High",     term: "1-10 years", color: "#FFD600", desc: "Also called junk bonds. Issued by lower-rated companies offering much higher returns for more risk.", icon: Zap },
];

const STATS = [
  { label: "US Bond Market Size",  value: "$53T",   sub: "Total market cap" },
  { label: "Avg Treasury Yield",   value: "4.2%",   sub: "10-year note" },
  { label: "Default Rate",         value: "0.1%",   sub: "Investment grade" },
  { label: "Recommended Allocation", value: "20-40%", sub: "Of portfolio" },
];

export default function BondsPage() {
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
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#00CFFF", letterSpacing: "1px" }}>BONDS</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 8 }}>
            Bonds & <span style={{ color: "#00CFFF" }}>Fixed Income</span>
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 600, lineHeight: 1.7 }}>
            Stable, predictable returns. Bonds are the foundation of a balanced portfolio — lower risk, steady income, and capital preservation.
          </p>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }} className="fm-stats-4">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 16px", textAlign: "center", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #00CFFF40, transparent)" }} />
              <p style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: "#00CFFF", marginBottom: 4, textShadow: "0 0 20px rgba(0,207,255,0.4)" }}>{s.value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Bond types */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#00CFFF", letterSpacing: "2px", marginBottom: 16 }}>// BOND TYPES</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }} className="fm-grid-2">
            {BOND_TYPES.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                style={{ background: "var(--surface)", border: `1px solid ${hovered === i ? b.color + "40" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "22px", position: "relative", overflow: "hidden", transition: "all 0.25s", transform: hovered === i ? "translateY(-3px)" : "none", boxShadow: hovered === i ? `0 12px 40px ${b.color}15` : "none" }}
              >
                {hovered === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${b.color}, transparent)` }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: b.color + "15", border: `1px solid ${b.color}25`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hovered === i ? `0 0 16px ${b.color}40` : "none", transition: "box-shadow 0.25s" }}>
                    <b.icon size={18} color={b.color} strokeWidth={1.5} />
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: b.color, background: b.color + "15", border: `1px solid ${b.color}25`, borderRadius: 100, padding: "2px 8px" }}>~{b.yield} YIELD</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 8px" }}>{b.risk} RISK</span>
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{b.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, marginBottom: 12 }}>{b.desc}</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>TERM: {b.term}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How bonds work */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: "var(--surface)", border: "1px solid rgba(0,207,255,0.2)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: 24, position: "relative", overflow: "hidden", boxShadow: "0 0 40px rgba(0,207,255,0.05)" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, #00CFFF, transparent)" }} />
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#00CFFF", letterSpacing: "2px", marginBottom: 14 }}>// HOW BONDS WORK</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="fm-grid-3">
            {[
              { step: "01", title: "You lend money", desc: "You buy a bond, giving the issuer (government or company) a loan at a fixed interest rate." },
              { step: "02", title: "You earn interest", desc: "The issuer pays you regular interest (called a coupon) — typically every 6 months." },
              { step: "03", title: "You get repaid", desc: "When the bond matures, you receive your original investment back in full." },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: "#00CFFF", opacity: 0.15, lineHeight: 1, flexShrink: 0 }}>{s.step}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/Educational_Modules" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#00CFFF", color: "#000", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", boxShadow: "0 0 20px rgba(0,207,255,0.3)", transition: "all 0.2s" }}>
            <BookOpen size={15} /> Learn About Bonds <ArrowRight size={14} />
          </Link>
          <Link href="/dashboard/learn" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "transparent", color: "var(--text2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "all 0.2s" }}>
            ← Back to Investments
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .fm-stats-4 { grid-template-columns: repeat(2,1fr) !important; } .fm-grid-2 { grid-template-columns: 1fr !important; } .fm-grid-3 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}