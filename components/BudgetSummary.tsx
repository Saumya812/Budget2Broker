"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAuthFetch } from "@/lib/use-auth-fetch";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Plus, Trash2, TrendingUp, TrendingDown,
  Wallet, Zap, Activity, ChevronUp, ChevronDown,
  Sparkles, Filter, Clock,
} from "lucide-react";

type Expense = {
  id: string; name: string; category: string;
  amount: number; type: "income" | "expense";
  date: string; time: string; created_at: string;
};

const CATEGORIES = ["Food", "Transport", "Entertainment", "Education", "Shopping", "Health", "Rent", "Utilities", "Others"];
const COLORS     = ["#00FF88","#00CFFF","#A855F7","#FF6B35","#FFD600","#FF4488","#FF8800","#00BCD4","#E040FB"];

function getAITip(income: number, expense: number, savings: number): string {
  if (expense === 0 && income === 0) return "Add your first transaction to get personalized AI insights about your spending habits.";
  if (expense > income) return `You are ${((expense / income - 1) * 100).toFixed(0)}% over budget. Identify your top spending category and cut it by 20%.`;
  if (expense > income * 0.9) return "You are using 90%+ of your income. One emergency could push you negative. Build a buffer first.";
  if (savings >= 20) return `Excellent! You are saving ${savings}% of income. Consider putting your surplus into a low-cost index fund for compounding growth.`;
  if (savings > 0) return `You are saving ${savings}% of income. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`;
  return "Track for 30 days to unlock deeper AI spending insights and personalized investment readiness score.";
}

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { fill: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, padding: "10px 14px", fontFamily: "var(--mono)", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
      <p style={{ color: payload[0].payload.fill, fontWeight: 700, marginBottom: 2 }}>{payload[0].name}</p>
      <p style={{ color: "var(--text)" }}>${Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
}

function GlowInput({ value, onChange, placeholder, type = "text", onKeyDown }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string; onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {focused && <div style={{ position: "absolute", inset: -1, borderRadius: 9, border: "1px solid var(--em)", boxShadow: "0 0 0 3px var(--em3)", pointerEvents: "none", zIndex: 1 }} />}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onKeyDown={onKeyDown} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, sub, delay }: {
  label: string; value: string; icon: React.ElementType; color: string; sub?: string; delay: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--surface2)" : "var(--surface)",
        border: `1px solid ${hov ? color + "50" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)", padding: "18px 20px",
        position: "relative", overflow: "hidden", transition: "all 0.25s",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? `0 8px 32px ${color}15` : "none",
      }}
    >
      {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "var(--mono)" }}>{label}</span>
        <div style={{ width: 30, height: 30, background: color + "15", border: `1px solid ${color}25`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: hov ? `0 0 14px ${color}50` : "none", transition: "box-shadow 0.25s" }}>
          <Icon size={13} color={color} strokeWidth={2} />
        </div>
      </div>
      <p style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color, lineHeight: 1, textShadow: hov ? `0 0 20px ${color}60` : "none", transition: "text-shadow 0.25s" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontFamily: "var(--mono)" }}>{sub}</p>}
    </motion.div>
  );
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx?: number; cy?: number; midAngle?: number; innerRadius?: number;
  outerRadius?: number; percent?: number; name?: string; index?: number;
}) => {
  if (!percent || percent < 0.05 || !cx || !cy || !midAngle || !innerRadius || !outerRadius) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fontFamily="Space Mono, monospace">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function BudgetSummary() {
  const { isLoaded, userId } = useAuth();
  const authFetch = useAuthFetch();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [name, setName]         = useState("");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount]     = useState("");
  const [type, setType]         = useState<"income" | "expense">("expense");
  const [filter, setFilter]     = useState<"all" | "income" | "expense">("all");
  const [sortBy, setSortBy]     = useState<"date" | "amount">("date");
  const [addOpen, setAddOpen]   = useState(false);
  const listRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    authFetch("/api/budget")
      .then(r => r.json())
      .then(data => {
        if (!data.expenses) return;
        setExpenses(data.expenses.map((e: {
          id: string; name: string; category: string;
          amount: number; type: "income" | "expense"; created_at: string;
        }) => {
          const d = new Date(e.created_at);
          return {
            ...e,
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          };
        }));
      })
      .catch(() => {});
  }, [isLoaded, userId, authFetch]);

  const addExpense = async () => {
    if (!name.trim() || !amount) return;
    const res  = await authFetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), amount, type, category }),
    });
    const data = await res.json();
    if (!data.expense) return;
    const d = new Date(data.expense.created_at);
    setExpenses(p => [{
      ...data.expense,
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }, ...p]);
    setName(""); setAmount("");
    setAddOpen(false);
    setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const deleteExpense = async (id: string) => {
    await authFetch(`/api/budget/${id}`, { method: "DELETE" });
    setExpenses(p => p.filter(e => e.id !== id));
  };

  const totalIncome  = expenses.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const remaining    = totalIncome - totalExpense;
  const savingsRate  = totalIncome > 0 ? Math.round((remaining / totalIncome) * 100) : 0;
  const spendPct     = totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0;

  const chartData = Object.entries(
    expenses.filter(e => e.type === "expense").reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const filtered = (filter === "all" ? expenses : expenses.filter(e => e.type === filter))
    .slice()
    .sort((a, b) => sortBy === "amount" ? b.amount - a.amount : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}
        >
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 6 }}>// BUDGET TRACKER</p>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Financial <span style={{ color: "var(--em)" }}>Overview</span>
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>{expenses.length} transactions tracked</p>
          </div>
          <button onClick={() => setAddOpen(o => !o)} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: addOpen ? "var(--em)" : "var(--em3)",
            border: "1px solid var(--em2)", borderRadius: "var(--radius)",
            padding: "10px 20px", color: addOpen ? "#000" : "var(--em)",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s",
            boxShadow: "var(--em-glow-sm)",
          }}>
            <Plus size={15} strokeWidth={2.5} />
            {addOpen ? "Cancel" : "Add Transaction"}
          </button>
        </motion.div>

        {/* Add panel */}
        <AnimatePresence>
          {addOpen && (
            <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: "auto", marginBottom: 20 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} style={{ overflow: "hidden" }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--em2)", borderRadius: "var(--radius-lg)", padding: "24px", boxShadow: "var(--em-glow-sm)", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 16 }}>// NEW TRANSACTION</p>

                {/* Type toggle */}
                <div style={{ display: "flex", background: "var(--bg3)", borderRadius: 8, padding: 3, width: "fit-content", marginBottom: 16, border: "1px solid var(--border)" }}>
                  {(["expense", "income"] as const).map(t => (
                    <button key={t} onClick={() => setType(t)} style={{
                      padding: "7px 20px", borderRadius: 6, border: "none", cursor: "pointer",
                      fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: "0.5px",
                      background: type === t ? (t === "income" ? "var(--em)" : "#FF4444") : "transparent",
                      color: type === t ? (t === "income" ? "#000" : "#fff") : "var(--text3)",
                      transition: "all 0.2s",
                      boxShadow: type === t ? (t === "income" ? "0 0 12px rgba(0,255,136,0.4)" : "0 0 12px rgba(255,68,68,0.4)") : "none",
                    }}>{t.toUpperCase()}</button>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, alignItems: "end" }} className="fm-add-grid">
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>NAME</label>
                    <GlowInput value={name} onChange={setName} placeholder="e.g. Monthly rent" onKeyDown={e => e.key === "Enter" && addExpense()} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>CATEGORY</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer" }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>AMOUNT ($)</label>
                    <GlowInput value={amount} onChange={setAmount} placeholder="0.00" type="number" onKeyDown={e => e.key === "Enter" && addExpense()} />
                  </div>
                  <button onClick={addExpense} disabled={!name.trim() || !amount} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", background: "var(--em)", color: "#000",
                    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    cursor: "pointer", opacity: (!name.trim() || !amount) ? 0.4 : 1,
                    transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif",
                    whiteSpace: "nowrap", boxShadow: "0 0 16px rgba(0,255,136,0.3)", marginTop: 22,
                  }}>
                    <Plus size={15} /> Add
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }} className="fm-stats-grid">
          <StatCard label="Total Income"   value={`$${totalIncome.toFixed(2)}`}  icon={TrendingUp}   color="#00FF88" sub={`${expenses.filter(e => e.type === "income").length} entries`}  delay={0.1} />
          <StatCard label="Total Expenses" value={`$${totalExpense.toFixed(2)}`} icon={TrendingDown} color="#FF4444" sub={`${expenses.filter(e => e.type === "expense").length} entries`} delay={0.15} />
          <StatCard label="Remaining"      value={`$${remaining.toFixed(2)}`}    icon={Wallet}       color={remaining >= 0 ? "#00FF88" : "#FF4444"} sub={remaining >= 0 ? "in the green" : "over budget"} delay={0.2} />
          <StatCard label="Savings Rate"   value={`${savingsRate}%`}             icon={Zap}          color="#A855F7" sub="of income saved" delay={0.25} />
        </div>

        {/* Spending bar */}
        {totalIncome > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 20 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={12} color="var(--text3)" />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "1px" }}>BUDGET UTILIZATION</span>
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: spendPct > 80 ? "#FF4444" : "var(--em)", textShadow: `0 0 10px ${spendPct > 80 ? "rgba(255,68,68,0.5)" : "rgba(0,255,136,0.4)"}` }}>{spendPct}%</span>
            </div>
            <div style={{ height: 5, background: "var(--bg3)", borderRadius: 100, overflow: "hidden" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${spendPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                style={{ height: "100%", borderRadius: 100, background: spendPct > 80 ? "linear-gradient(90deg, #FF8800, #FF4444)" : "linear-gradient(90deg, #00FF88, #00CC6A)", boxShadow: `0 0 8px ${spendPct > 80 ? "rgba(255,68,68,0.6)" : "rgba(0,255,136,0.6)"}` }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>$0</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>${totalIncome.toFixed(0)}</span>
            </div>
          </motion.div>
        )}

        {/* ── Main 3-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px 280px", gap: 16, alignItems: "start" }} className="fm-budget-main">

          {/* ── Transaction list ── */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}
          >
            {/* Filters */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <div style={{ display: "flex", gap: 0 }}>
                {(["all", "income", "expense"] as const).map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: "5px 14px", background: "none", border: "none",
                    fontSize: 11, fontWeight: filter === f ? 700 : 400,
                    color: filter === f ? "var(--em)" : "var(--text3)",
                    cursor: "pointer", fontFamily: "var(--mono)",
                    borderBottom: filter === f ? "2px solid var(--em)" : "2px solid transparent",
                    transition: "all 0.15s", letterSpacing: "0.5px", textTransform: "uppercase",
                  }}>{f}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setSortBy(s => s === "date" ? "amount" : "date")}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "1px solid var(--border2)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "var(--text3)", fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "0.5px", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--em)"; e.currentTarget.style.color = "var(--em)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
                >
                  <Filter size={10} /> {sortBy.toUpperCase()}
                </button>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{filtered.length}</span>
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, padding: "8px 20px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
              {["Transaction", "Date & Time", "Amount", ""].map((h, i) => (
                <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div ref={listRef} style={{ maxHeight: 460, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", letterSpacing: "1px" }}>NO TRANSACTIONS YET</p>
                  <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 8 }}>Click "Add Transaction" to get started</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filtered.map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "center", padding: "12px 20px", borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
                      onMouseEnter={el => (el.currentTarget.style.background = "var(--surface2)")}
                      onMouseLeave={el => (el.currentTarget.style.background = "transparent")}
                    >
                      {/* Name + category */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: e.type === "income" ? "rgba(0,255,136,0.1)" : "rgba(255,68,68,0.1)", border: `1px solid ${e.type === "income" ? "rgba(0,255,136,0.25)" : "rgba(255,68,68,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {e.type === "income" ? <ChevronUp size={13} color="var(--em)" /> : <ChevronDown size={13} color="var(--red)" />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</p>
                          <span style={{ fontSize: 10, fontFamily: "var(--mono)", padding: "1px 7px", borderRadius: 100, background: "var(--bg3)", color: "var(--text3)", border: "1px solid var(--border)" }}>{e.category}</span>
                        </div>
                      </div>

                      {/* Date + time */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)", whiteSpace: "nowrap" }}>{e.date || "—"}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", marginTop: 2 }}>
                          <Clock size={8} color="var(--text3)" />
                          <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", whiteSpace: "nowrap" }}>{e.time || "—"}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <p style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: e.type === "income" ? "var(--em)" : "var(--red)", whiteSpace: "nowrap", textShadow: `0 0 10px ${e.type === "income" ? "rgba(0,255,136,0.3)" : "rgba(255,68,68,0.3)"}` }}>
                        {e.type === "income" ? "+" : "-"}${e.amount.toFixed(2)}
                      </p>

                      {/* Delete */}
                      <button onClick={() => deleteExpense(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4, transition: "color 0.15s", display: "flex", alignItems: "center" }}
                        onMouseEnter={el => (el.currentTarget.style.color = "var(--red)")}
                        onMouseLeave={el => (el.currentTarget.style.color = "var(--text3)")}
                      ><Trash2 size={13} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* ── Chart ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", overflow: "hidden", position: "relative" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent)" }} />
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 4 }}>// SPENDING BREAKDOWN</p>
            <p style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--em)", marginBottom: 14, textShadow: "0 0 16px rgba(0,255,136,0.4)" }}>
              ${totalExpense.toFixed(2)}
            </p>

            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      dataKey="value" data={chartData}
                      cx="50%" cy="50%"
                      outerRadius={105} innerRadius={55}
                      paddingAngle={2} strokeWidth={0}
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]}
                          style={{ filter: `drop-shadow(0 0 8px ${COLORS[i % COLORS.length]}70)`, cursor: "pointer" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Category breakdown list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {chartData.map((d, i) => {
                    const pct = totalExpense > 0 ? ((d.value / totalExpense) * 100).toFixed(1) : "0";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}80`, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--text2)", flex: 1 }}>{d.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 60, height: 3, background: "var(--border2)", borderRadius: 100, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 100, boxShadow: `0 0 4px ${COLORS[i % COLORS.length]}` }} />
                          </div>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: COLORS[i % COLORS.length], fontWeight: 700, minWidth: 32, textAlign: "right" }}>{pct}%</span>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", minWidth: 52, textAlign: "right" }}>${d.value.toFixed(0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px dashed var(--border2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity size={20} color="var(--text3)" />
                </div>
                <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", letterSpacing: "1px" }}>NO EXPENSE DATA</p>
              </div>
            )}
          </motion.div>

          {/* ── AI insight ── */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              boxShadow: "0 0 20px rgba(168,85,247,0.06)",
              position: "relative", overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(168,85,247,0.6), transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={15} color="#A855F7" />
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", fontWeight: 700, letterSpacing: "1.5px" }}>AI INSIGHT</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, marginBottom: 20 }}>
              {getAITip(totalIncome, totalExpense, savingsRate)}
            </p>

            {/* Quick stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              {[
                { label: "Top category", value: chartData[0]?.name ?? "—" },
                { label: "Avg transaction", value: expenses.length > 0 ? `$${(totalExpense / Math.max(expenses.filter(e => e.type === "expense").length, 1)).toFixed(0)}` : "—" },
                { label: "Savings this month", value: `$${remaining.toFixed(0)}` },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.5px" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-em { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @media (max-width: 1100px) { .fm-budget-main { grid-template-columns: 1fr 340px !important; } .fm-budget-main > *:last-child { grid-column: 1 / -1; } }
        @media (max-width: 768px)  { .fm-budget-main { grid-template-columns: 1fr !important; } .fm-stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px)  { .fm-add-grid { grid-template-columns: 1fr !important; } .fm-stats-grid { grid-template-columns: 1fr !important; } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  );
}