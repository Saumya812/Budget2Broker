"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface Props {
  totalIncome:  number;
  totalExpense: number;
  savings:      number;
  goals?:       number;
}

type Factor = { label: string; score: number; max: number; tip: string; ok: boolean };

function calcScore(income: number, expense: number, savings: number, goals: number) {
  const savingsRate = income > 0 ? savings / income : 0;
  const expenseRatio = income > 0 ? expense / income : 1;

  const factors: Factor[] = [
    {
      label: "Savings Rate",
      score: Math.min(30, Math.round(savingsRate * 150)),
      max: 30,
      tip: savingsRate >= 0.2 ? "Great! Saving 20%+ of income." : savingsRate >= 0.1 ? "Try to increase savings to 20%." : "Save at least 10% of income.",
      ok: savingsRate >= 0.1,
    },
    {
      label: "Expense Control",
      score: expenseRatio <= 0.5 ? 25 : expenseRatio <= 0.7 ? 20 : expenseRatio <= 0.9 ? 12 : 5,
      max: 25,
      tip: expenseRatio <= 0.7 ? "Expenses are well controlled." : "Try to keep expenses under 70% of income.",
      ok: expenseRatio <= 0.8,
    },
    {
      label: "Positive Cash Flow",
      score: savings >= 0 ? 25 : 0,
      max: 25,
      tip: savings >= 0 ? "You're spending less than you earn." : "You're spending more than you earn — reduce expenses.",
      ok: savings >= 0,
    },
    {
      label: "Active Goals",
      score: goals > 0 ? 20 : 0,
      max: 20,
      tip: goals > 0 ? `${goals} goal${goals > 1 ? "s" : ""} set — great planning!` : "Set a financial goal to improve your score.",
      ok: goals > 0,
    },
  ];

  const total = factors.reduce((s, f) => s + f.score, 0);
  return { total, factors };
}

function getGrade(score: number) {
  if (score >= 85) return { grade: "A+", label: "Excellent", color: "#00FF88" };
  if (score >= 70) return { grade: "A",  label: "Very Good", color: "#00CFFF" };
  if (score >= 55) return { grade: "B",  label: "Good",      color: "#A855F7" };
  if (score >= 40) return { grade: "C",  label: "Fair",      color: "#FFD600" };
  return                   { grade: "D",  label: "Needs Work", color: "#FF6B35" };
}

export default function FinancialHealthScore({ totalIncome, totalExpense, savings, goals = 0 }: Props) {
  const { total, factors } = useMemo(() => calcScore(totalIncome, totalExpense, savings, goals), [totalIncome, totalExpense, savings, goals]);
  const { grade, label, color } = getGrade(total);

  const radius = 52;
  const circ   = 2 * Math.PI * radius;
  const dash   = (total / 100) * circ;

  return (
    <div style={{
      background: "var(--surface)", border: `1px solid var(--border)`,
      borderRadius: 16, padding: 22, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle, ${color}06 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        {/* Left: label + factors */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <ShieldCheck size={14} color={color} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: color, letterSpacing: "2px", fontWeight: 700 }}>FINANCIAL HEALTH</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {factors.map((f, i) => (
              <motion.div key={f.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {f.ok
                      ? <CheckCircle2 size={10} color="#00FF88" />
                      : <XCircle      size={10} color="#FF6B35" />}
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)" }}>{f.label}</span>
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: f.ok ? "var(--em)" : "var(--text3)" }}>{f.score}/{f.max}</span>
                </div>
                <div style={{ height: 4, background: "var(--bg3)", borderRadius: 100, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(f.score / f.max) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 + 0.3 }}
                    style={{ height: "100%", background: f.ok ? `linear-gradient(90deg, ${color}80, ${color})` : "linear-gradient(90deg, #FF6B3580, #FF6B35)", borderRadius: 100 }}
                  />
                </div>
                <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 3 }}>{f.tip}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: circular gauge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 130 }}>
          <div style={{ position: "relative", width: 130, height: 130 }}>
            <svg width={130} height={130} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={65} cy={65} r={radius} fill="none" stroke="var(--bg3)" strokeWidth={10} />
              <motion.circle
                cx={65} cy={65} r={radius} fill="none"
                stroke={color} strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ - dash }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{grade}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{total}/100</span>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color, letterSpacing: "1px" }}>{label}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginTop: 4 }}>
              {total >= 70 ? <TrendingUp size={10} color="var(--em)" /> : <AlertTriangle size={10} color="#FFD600" />}
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)" }}>
                {total >= 70 ? "On track" : "Room to grow"}
              </span>
            </div>
            {totalIncome === 0 && (
              <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 6, lineHeight: 1.4 }}>
                Add income + expenses<br />to see your score
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            {["D", "C", "B", "A", "A+"].map((g, i) => (
              <div key={g} style={{ width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: grade === g ? color + "25" : "var(--bg3)", border: `1px solid ${grade === g ? color : "var(--border)"}`, transition: "all 0.3s" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 7, fontWeight: 700, color: grade === g ? color : "var(--text3)" }}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Zap size={11} color={color} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)" }}>
            {total < 40
              ? "Start by tracking your income and setting a savings goal."
              : total < 70
              ? "You're building good habits. Focus on increasing your savings rate."
              : "Excellent financial health! Consider investing your surplus."}
          </span>
        </div>
      </div>
    </div>
  );
}
