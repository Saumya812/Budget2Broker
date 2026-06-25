"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAuthFetch } from "@/lib/use-auth-fetch";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, CheckCircle2, X, Calendar, DollarSign, TrendingUp, Zap } from "lucide-react";

type Goal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  color: string;
  created_at: string;
};

const CATEGORIES = [
  { label: "Savings",     value: "savings",     icon: "💰" },
  { label: "Emergency",   value: "emergency",   icon: "🛡️" },
  { label: "Travel",      value: "travel",      icon: "✈️" },
  { label: "Education",   value: "education",   icon: "🎓" },
  { label: "Home",        value: "home",        icon: "🏠" },
  { label: "Investment",  value: "investment",  icon: "📈" },
  { label: "Car",         value: "car",         icon: "🚗" },
  { label: "Other",       value: "other",       icon: "🎯" },
];

const COLORS = ["#00FF88", "#00CFFF", "#A855F7", "#FF6B35", "#FFD600", "#FF4488", "#00BCD4", "#E040FB"];

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "20%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

export default function GoalsPage() {
  const { isLoaded, userId } = useAuth();
  const authFetch = useAuthFetch();
  const [goals, setGoals]       = useState<Goal[]>([]);
  const [showAdd, setShowAdd]   = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  // Form state
  const [title, setTitle]               = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline]         = useState("");
  const [category, setCategory]         = useState("savings");
  const [color, setColor]               = useState("#00FF88");
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    authFetch("/api/goals").then(r => r.json()).then(d => { if (d.goals) setGoals(d.goals); });
  }, [isLoaded, userId, authFetch]);

  const resetForm = () => { setTitle(""); setTargetAmount(""); setCurrentAmount(""); setDeadline(""); setCategory("savings"); setColor("#00FF88"); setEditGoal(null); setShowAdd(false); };

  const saveGoal = async () => {
    if (!title || !targetAmount) return;
    setSaving(true);
    try {
      if (editGoal) {
        const res  = await authFetch(`/api/goals/${editGoal.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, target_amount: parseFloat(targetAmount), current_amount: parseFloat(currentAmount) || 0, deadline: deadline || null, category, color }) });
        const data = await res.json();
        if (data.goal) setGoals(g => g.map(x => x.id === editGoal.id ? data.goal : x));
      } else {
        const res  = await authFetch("/api/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, target_amount: parseFloat(targetAmount), current_amount: parseFloat(currentAmount) || 0, deadline: deadline || null, category, color }) });
        const data = await res.json();
        if (data.goal) setGoals(g => [data.goal, ...g]);
      }
      resetForm();
    } finally { setSaving(false); }
  };

  const deleteGoal = async (id: string) => {
    await authFetch(`/api/goals/${id}`, { method: "DELETE" });
    setGoals(g => g.filter(x => x.id !== id));
  };

  const openEdit = (goal: Goal) => {
    setEditGoal(goal);
    setTitle(goal.title);
    setTargetAmount(String(goal.target_amount));
    setCurrentAmount(String(goal.current_amount));
    setDeadline(goal.deadline ?? "");
    setCategory(goal.category);
    setColor(goal.color);
    setShowAdd(true);
  };

  const totalTarget  = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved   = goals.reduce((s, g) => s + g.current_amount, 0);
  const completed    = goals.filter(g => g.current_amount >= g.target_amount).length;
  const overallPct   = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}
        >
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 6 }}>// FINANCIAL GOALS</p>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Your <span style={{ color: "var(--em)" }}>Goals</span>
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>{goals.length} goals · {completed} completed</p>
          </div>
          <button onClick={() => { resetForm(); setShowAdd(true); }} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--em3)", border: "1px solid var(--em2)", borderRadius: "var(--radius)", padding: "10px 20px", color: "var(--em)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s", boxShadow: "var(--em-glow-sm)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--em)"; e.currentTarget.style.color = "#000"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--em3)"; e.currentTarget.style.color = "var(--em)"; }}
          >
            <Plus size={15} /> Add Goal
          </button>
        </motion.div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }} className="goals-stats">
          {[
            { label: "Total Goals",     value: goals.length,          color: "#00CFFF", icon: Target },
            { label: "Total Target",    value: `$${totalTarget.toLocaleString()}`, color: "#A855F7", icon: DollarSign },
            { label: "Total Saved",     value: `$${totalSaved.toLocaleString()}`,  color: "#00FF88", icon: TrendingUp },
            { label: "Overall Progress", value: `${overallPct}%`,     color: "#FFD600", icon: Zap },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "1px" }}>{s.label.toUpperCase()}</span>
                <s.icon size={13} color={s.color} />
              </div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Add/Edit form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 24 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--em2)", borderRadius: 16, padding: 24, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px" }}>// {editGoal ? "EDIT GOAL" : "NEW GOAL"}</p>
                  <button onClick={resetForm} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}><X size={16} /></button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, marginBottom: 16 }} className="goals-form-grid">
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>GOAL TITLE</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Emergency Fund" style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>TARGET ($)</label>
                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="10000" style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>SAVED SO FAR ($)</label>
                    <input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0" style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>CATEGORY</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {CATEGORIES.map(c => (
                        <button key={c.value} onClick={() => setCategory(c.value)} style={{ padding: "5px 12px", borderRadius: 100, border: `1px solid ${category === c.value ? "var(--em)" : "var(--border2)"}`, background: category === c.value ? "var(--em3)" : "transparent", color: category === c.value ? "var(--em)" : "var(--text3)", fontSize: 11, cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.15s" }}>
                          {c.icon} {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>DEADLINE (OPTIONAL)</label>
                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginTop: 12, marginBottom: 6, letterSpacing: "1px" }}>COLOR</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setColor(c)} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", boxShadow: color === c ? `0 0 12px ${c}` : "none", transition: "all 0.15s" }} />
                      ))}
                    </div>
                  </div>
                </div>

                <button onClick={saveGoal} disabled={!title || !targetAmount || saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 28px", background: "var(--em)", color: "#000", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", opacity: (!title || !targetAmount || saving) ? 0.5 : 1, boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
                  <CheckCircle2 size={15} /> {saving ? "Saving..." : editGoal ? "Update Goal" : "Create Goal"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals grid */}
        {goals.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "64px 32px", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Target size={30} color="var(--em)" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No goals yet</h3>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>Set your first financial goal and start tracking your progress</p>
            <button onClick={() => setShowAdd(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "var(--em)", color: "#000", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
              <Plus size={15} /> Create Your First Goal
            </button>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            <AnimatePresence>
              {goals.map((goal, i) => {
                const pct        = Math.min(100, goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0);
                const done       = pct >= 100;
                const remaining  = Math.max(0, goal.target_amount - goal.current_amount);
                const catIcon    = CATEGORIES.find(c => c.value === goal.category)?.icon ?? "🎯";
                const daysLeft   = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000) : null;

                return (
                  <motion.div key={goal.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                    style={{ background: "var(--surface)", border: `1px solid ${done ? "rgba(0,255,136,0.3)" : "var(--border)"}`, borderRadius: 16, padding: 22, position: "relative", overflow: "hidden", boxShadow: done ? "0 0 24px rgba(0,255,136,0.08)" : "none" }}
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${goal.color}, transparent)` }} />

                    {/* Goal header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${goal.color}15`, border: `1px solid ${goal.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                          {catIcon}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{goal.title}</h3>
                          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 8px" }}>{goal.category}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(goal)} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = goal.color; e.currentTarget.style.color = goal.color; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
                        ><TrendingUp size={12} /></button>
                        <button onClick={() => deleteGoal(goal.id)} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF4444"; e.currentTarget.style.color = "#FF4444"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
                        ><Trash2 size={12} /></button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: goal.color }}>${goal.current_amount.toLocaleString()}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)", alignSelf: "flex-end" }}>of ${goal.target_amount.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 6, background: "var(--bg3)", borderRadius: 100, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut", delay: i * 0.05 + 0.3 }}
                          style={{ height: "100%", background: done ? "linear-gradient(90deg, #00FF88, #00CC6A)" : `linear-gradient(90deg, ${goal.color}80, ${goal.color})`, borderRadius: 100, boxShadow: `0 0 8px ${goal.color}60` }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: goal.color }}>{pct}% complete</span>
                        {!done && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>${remaining.toLocaleString()} to go</span>}
                        {done && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#00FF88", display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={11} /> Achieved!</span>}
                      </div>
                    </div>

                    {/* Deadline */}
                    {daysLeft !== null && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: daysLeft < 30 ? "rgba(255,107,53,0.08)" : "var(--bg3)", border: `1px solid ${daysLeft < 30 ? "rgba(255,107,53,0.3)" : "var(--border)"}`, borderRadius: 8 }}>
                        <Calendar size={11} color={daysLeft < 30 ? "#FF6B35" : "var(--text3)"} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: daysLeft < 30 ? "#FF6B35" : "var(--text3)" }}>
                          {daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? "Due today!" : "Overdue"}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .goals-stats { grid-template-columns: repeat(2,1fr) !important; } .goals-form-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 480px) { .goals-stats { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
