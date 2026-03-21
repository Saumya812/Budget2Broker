"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, TrendingUp, TrendingDown, Wallet, BookOpen,
  Bot, BarChart2, Home, DollarSign, Zap, Activity,
  ChevronUp, ChevronDown, Eye, EyeOff,
} from "lucide-react";

/* ── Grid bg ── */
function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{
        position: "absolute", top: "10%", right: "10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)",
      }} />
    </div>
  );
}

/* ── Magnetic card ── */
function MagCard({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hov, setHov] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width - 0.5) * 12;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -12;
    setTilt({ x, y });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setTilt({ x: 0, y: 0 }); }}
      onClick={onClick}
      style={{
        ...style,
        transform: hov ? `perspective(600px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(-4px)` : "perspective(600px) rotateX(0) rotateY(0)",
        transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s, border-color 0.3s",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </div>
  );
}

/* ── Glowing stat card ── */
function StatCard({ label, value, icon: Icon, color, up, delay }: {
  label: string; value: string; icon: React.ElementType;
  color: string; up?: boolean; delay: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--surface2)" : "var(--surface)",
        border: `1px solid ${hov ? color + "50" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 8px 32px ${color}15` : "none",
      }}
    >
      {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", fontFamily: "var(--mono)" }}>{label}</span>
        <div style={{
          width: 34, height: 34,
          background: color + "15",
          border: `1px solid ${color}25`,
          borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: hov ? `0 0 16px ${color}40` : "none",
          transition: "box-shadow 0.25s",
        }}>
          <Icon size={15} color={color} strokeWidth={2} />
        </div>
      </div>
      <p style={{
        fontFamily: "var(--mono)",
        fontSize: 24, fontWeight: 700,
        color: up === undefined ? "var(--text)" : up ? "var(--em)" : "var(--red)",
        lineHeight: 1,
        textShadow: hov && up !== undefined ? `0 0 20px ${up ? "rgba(0,255,136,0.5)" : "rgba(255,68,68,0.5)"}` : "none",
        transition: "text-shadow 0.25s",
      }}>{value}</p>
      {up !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 6 }}>
          {up ? <ChevronUp size={12} color="var(--em)" /> : <ChevronDown size={12} color="var(--red)" />}
          <span style={{ fontSize: 11, color: up ? "var(--em)" : "var(--red)", fontFamily: "var(--mono)" }}>
            {up ? "positive" : "negative"}
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ── Investment card ── */
function InvCard({ title, Icon, href, tag, color, desc, delay }: {
  title: string; Icon: React.ElementType; href: string;
  tag: string; color: string; desc: string; delay: number;
}) {
  const [hov, setHov] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link href={href} style={{ textDecoration: "none" }}>
        <div
          ref={ref}
          onMouseMove={e => {
            const r = ref.current?.getBoundingClientRect();
            if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
          }}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            background: "var(--surface)",
            border: `1px solid ${hov ? color + "50" : "var(--border)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "22px 20px",
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
            transform: hov ? "translateY(-5px)" : "none",
            boxShadow: hov ? `0 16px 48px ${color}20` : "none",
            position: "relative", overflow: "hidden",
          }}
        >
          {hov && <div style={{ position: "absolute", pointerEvents: "none", width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`, left: pos.x - 80, top: pos.y - 80 }} />}
          {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />}

          <div style={{
            width: 42, height: 42,
            background: color + "15",
            border: `1px solid ${color}${hov ? "50" : "20"}`,
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14,
            boxShadow: hov ? `0 0 24px ${color}50` : "none",
            transition: "all 0.25s",
          }}>
            <Icon size={18} color={color} strokeWidth={1.5} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{title}</p>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 8px",
              background: color + "20", color, borderRadius: 100,
              border: `1px solid ${color}30`,
              fontFamily: "var(--mono)", letterSpacing: "0.5px",
            }}>{tag}</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.6, marginBottom: 14 }}>{desc}</p>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            color, fontSize: 12, fontWeight: 600,
            opacity: hov ? 1 : 0.4,
            transition: "opacity 0.2s",
            fontFamily: "var(--mono)",
          }}>
            EXPLORE <ArrowRight size={11} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Live dot ── */
function LiveDot() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "var(--em)", display: "inline-block",
        boxShadow: "0 0 8px var(--em)",
        animation: "pulse-em 2s infinite",
      }} />
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", fontWeight: 700, letterSpacing: "1px" }}>LIVE</span>
    </span>
  );
}

/* ── Main ── */
type Expense = { name: string; amount: number; type: "income" | "expense"; category: string };

const investments = [
  { title: "Stocks",       Icon: TrendingUp,  href: "/dashboard/learn/stock",        tag: "LIVE",    color: "#00FF88", desc: "Real-time prices + AI chart explanations." },
  { title: "Bonds",        Icon: DollarSign,  href: "/dashboard/learn/bonds",        tag: "STABLE",  color: "#00CFFF", desc: "Low-risk fixed income investments." },
  { title: "ETFs",         Icon: BarChart2,   href: "/dashboard/learn/mutual-funds", tag: "DIVERSE", color: "#A855F7", desc: "Instant diversification in one trade." },
  { title: "Real Estate",  Icon: Home,        href: "/dashboard/learn/real-estate",  tag: "TANGIBLE",color: "#FF6B35", desc: "REITs and property investment basics." },
];

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    try {
      const raw = localStorage.getItem("budgetData");
      if (raw) setExpenses(JSON.parse(raw));
    } catch {}
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalIncome  = expenses.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const remaining    = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;
  const spendPct     = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;

  const mask = (v: string) => hideBalance ? "••••••" : v;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <LiveDot />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", letterSpacing: "1px" }}>
                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Welcome back<span style={{ color: "var(--em)" }}>.</span>
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 6 }}>Your financial command center</p>
          </div>
          <button
            onClick={() => setHideBalance(h => !h)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "8px 14px",
              color: "var(--text2)", fontSize: 12, fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit",
            }}
          >
            {hideBalance ? <Eye size={14} /> : <EyeOff size={14} />}
            {hideBalance ? "Show" : "Hide"} balance
          </button>
        </motion.div>

        {/* ── Summary cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
          <StatCard label="Income"      value={mask(`$${totalIncome.toFixed(2)}`)}   icon={TrendingUp}   color="#00FF88" up={totalIncome > 0 ? true : undefined}  delay={0.1} />
          <StatCard label="Expenses"    value={mask(`$${totalExpense.toFixed(2)}`)}  icon={TrendingDown} color="#FF4444" up={totalExpense > 0 ? false : undefined} delay={0.15} />
          <StatCard label="Remaining"   value={mask(`$${remaining.toFixed(2)}`)}     icon={Wallet}       color={remaining >= 0 ? "#00FF88" : "#FF4444"} up={remaining >= 0 ? true : false} delay={0.2} />
          <StatCard label="Savings Rate" value={mask(`${savingsRate}%`)}             icon={Zap}          color="#A855F7" delay={0.25} />
        </div>

        {/* ── Spending bar ── */}
        {totalIncome > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "18px 20px",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={13} color="var(--text3)" />
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)", fontFamily: "var(--mono)", letterSpacing: "0.5px" }}>BUDGET UTILIZATION</span>
              </div>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700,
                color: spendPct > 80 ? "var(--red)" : "var(--em)",
                textShadow: spendPct > 80 ? "0 0 12px rgba(255,68,68,0.5)" : "0 0 12px rgba(0,255,136,0.4)",
              }}>{spendPct}%</span>
            </div>
            <div style={{ height: 6, background: "var(--bg3)", borderRadius: 100, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${spendPct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                style={{
                  height: "100%", borderRadius: 100,
                  background: spendPct > 80
                    ? "linear-gradient(90deg, #FF8800, #FF4444)"
                    : "linear-gradient(90deg, #00FF88, #00CC6A)",
                  boxShadow: spendPct > 80 ? "0 0 8px rgba(255,68,68,0.6)" : "0 0 8px rgba(0,255,136,0.6)",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>$0</span>
              <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>${totalIncome.toFixed(0)}</span>
            </div>
          </motion.div>
        )}

        {/* ── Quick actions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }} className="fm-grid-3">
          {[
            { href: "/dashboard/budget",    Icon: Wallet,   label: "Budget Tracker",  sub: "Track income & expenses",  primary: true },
            { href: "/Educational_Modules", Icon: BookOpen, label: "Learn",           sub: "14 free lessons",          primary: false },
            { href: "/dashboard/AImentor",  Icon: Bot,      label: "AI Mentor",       sub: "Ask anything",             primary: false },
          ].map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.08 }}
            >
              <MagCard style={{
                background: a.primary ? "var(--em3)" : "var(--surface)",
                border: `1px solid ${a.primary ? "var(--em2)" : "var(--border)"}`,
                borderRadius: "var(--radius-lg)",
                padding: "20px",
                boxShadow: a.primary ? "var(--em-glow-sm)" : "none",
              }}>
                <Link href={a.href} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: a.primary ? "rgba(0,255,136,0.15)" : "var(--surface2)",
                    border: `1px solid ${a.primary ? "var(--em2)" : "var(--border2)"}`,
                    borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <a.Icon size={17} color={a.primary ? "var(--em)" : "var(--text2)"} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: a.primary ? "var(--em)" : "var(--text)", marginBottom: 2 }}>{a.label}</p>
                    <p style={{ fontSize: 11, color: a.primary ? "var(--text2)" : "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "var(--mono)" }}>{a.sub}</p>
                  </div>
                  <ArrowRight size={13} color={a.primary ? "var(--em)" : "var(--text3)"} />
                </Link>
              </MagCard>
            </motion.div>
          ))}
        </div>

        {/* ── Investments ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 4 }}>// MARKETS</p>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Explore Investments</h2>
            </div>
            <Link href="/dashboard/learn" style={{
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, color: "var(--em)", fontWeight: 600,
              fontFamily: "var(--mono)", textDecoration: "none",
              border: "1px solid var(--border2)",
              padding: "6px 12px", borderRadius: "var(--radius)",
              transition: "all 0.2s",
            }}>
              VIEW ALL <ArrowRight size={11} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {investments.map((inv, i) => (
              <InvCard key={i} {...inv} delay={0.65 + i * 0.08} />
            ))}
          </div>
        </motion.div>

        {/* ── AI tip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{ marginTop: 24 }}
        >
          <MagCard style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "20px 24px",
            display: "flex", alignItems: "flex-start", gap: 16,
            boxShadow: "0 0 40px rgba(168,85,247,0.05)",
          }}>
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.25)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={17} color="#A855F7" />
            </div>
            <div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", fontWeight: 700, letterSpacing: "1.5px", marginBottom: 6 }}>// AI INSIGHT</p>
              <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
                {totalIncome === 0
                  ? "Add your income and expenses to get personalized AI insights about your spending habits."
                  : savingsRate >= 20
                  ? `You're saving ${savingsRate}% of your income — excellent discipline. Consider investing your surplus in index funds for long-term growth.`
                  : `You're spending ${spendPct}% of your income. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`
                }
              </p>
            </div>
          </MagCard>
        </motion.div>

      </div>

      <style>{`
        @keyframes pulse-em { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 640px) { .fm-grid-3 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}