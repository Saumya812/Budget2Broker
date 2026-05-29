"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, BarChart2, Home, ArrowRight } from "lucide-react";

const investments = [
  { title: "Stocks",            icon: TrendingUp, href: "/dashboard/learn/stock",        tag: "Live data",  color: "#00C853", desc: "Buy and sell real stocks with live prices and simulated trading." },
  { title: "Bonds",             icon: DollarSign, href: "/dashboard/learn/bonds",        tag: "Stable",     color: "#0091EA", desc: "Low-risk fixed income investments backed by governments and companies." },
  { title: "Mutual Funds/ETFs", icon: BarChart2,  href: "/dashboard/learn/MutualFunds", tag: "Diversified", color: "#7C4DFF", desc: "Instantly diversified portfolios with one simple investment." },
  { title: "Real Estate",       icon: Home,       href: "/dashboard/learn/RealEstate",  tag: "Tangible",   color: "#FF6D00", desc: "Invest in property and REITs to build long-term wealth." },
];

export default function InvestmentsPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "1.5px", color: "var(--green)", textTransform: "uppercase", marginBottom: 8 }}>
            Investments
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Explore Asset Classes
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 15, marginBottom: 40 }}>
            Choose an investment type to explore live data, learn the basics, and practice with simulated trading.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {investments.map((inv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}
            >
              <Link href={inv.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "28px 24px",
                  boxShadow: "var(--shadow)",
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                  <div style={{
                    width: 48, height: 48,
                    background: inv.color + "18",
                    borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16,
                  }}>
                    <inv.icon size={22} color={inv.color} strokeWidth={2} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{inv.title}</h3>
                    <span className="tag" style={{ fontSize: 10 }}>{inv.tag}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 20 }}>{inv.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontWeight: 600, fontSize: 13 }}>
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}