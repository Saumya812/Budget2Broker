"use client";

import { useState, useEffect } from "react";
import { useAuthFetch } from "@/lib/use-auth-fetch";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, TrendingUp, Shield, Zap, CheckCircle2,
  ChevronRight, RefreshCw, AlertTriangle, PieChart,
  Clock, Target, Lightbulb, ArrowRight,
} from "lucide-react";

/* ── Types ── */
interface Allocation {
  symbol:      string;
  name:        string;
  type:        string;
  percentage:  number;
  monthlyAmount: number;
  reason:      string;
  color:       string;
}

interface Plan {
  summary:           string;
  monthlyInvestment: number;
  riskProfile:       string;
  timeHorizon:       string;
  allocations:       Allocation[];
  projections:       { oneYear: number; threeYear: number; fiveYear: number };
  tips:              string[];
}


function getRiskColor(risk: string) {
  if (risk === "Conservative") return "#00CFFF";
  if (risk === "Aggressive")   return "#FF6B35";
  return "#00FF88";
}

function getRiskIcon(risk: string) {
  if (risk === "Conservative") return Shield;
  if (risk === "Aggressive")   return Zap;
  return TrendingUp;
}

/* ── Donut Chart ── */
function DonutChart({ allocations }: { allocations: Allocation[] }) {
  const size   = 160;
  const cx     = size / 2;
  const cy     = size / 2;
  const r      = 58;
  const stroke = 22;
  const circ   = 2 * Math.PI * r;
  let offset   = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {allocations.map((a, i) => {
          const dash   = (a.percentage / 100) * circ;
          const gap    = circ - dash;
          const seg    = (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              style={{ filter: `drop-shadow(0 0 6px ${a.color}60)` }}
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      {/* Center label */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <PieChart size={16} color="var(--em)" />
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 2, letterSpacing: "0.5px" }}>ALLOC</span>
      </div>
    </div>
  );
}

/* ── Projection Bar ── */
function ProjectionBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth((value / max) * 100), 300); }, [value, max]);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.5px" }}>{label}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color, fontWeight: 700 }}>${value.toLocaleString()}</span>
      </div>
      <div style={{ height: 5, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 999, transition: "width 1.2s cubic-bezier(0.23,1,0.32,1)", boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function InvestmentPlan() {
  const authFetch = useAuthFetch();
  const [plan,     setPlan]     = useState<Plan | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [approved, setApproved] = useState(false);
  const [step,     setStep]     = useState<"idle"|"generating"|"ready"|"approved">("idle");

  const generate = async () => {
    setLoading(true);
    setError("");
    setStep("generating");
    setPlan(null);
    setApproved(false);

    try {
      const budgetJson = await authFetch("/api/budget").then(r => r.json());
      const budgetData = budgetJson.expenses ?? [];
      const res  = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetData }),
      });
      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();
      setPlan(data.plan);
      setStep("ready");
    } catch (e) {
      setError("Could not generate your plan. Please try again.");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const approve = () => {
    setApproved(true);
    setStep("approved");
    // 🔮 Future: call /api/execute-plan here with Alpaca
  };

  const riskColor = plan ? getRiskColor(plan.riskProfile) : "var(--em)";
  const RiskIcon  = plan ? getRiskIcon(plan.riskProfile) : TrendingUp;
  const maxProjection = plan ? plan.projections.fiveYear * 1.1 : 1;

  return (
    <div style={{ padding: "24px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={15} color="var(--em)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
              AI Investment Planner
            </h2>
          </div>
          <p style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
            Personalized plan based on your budget data
          </p>
        </div>
        {plan && (
          <button onClick={generate}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--border2)", borderRadius: 8, padding: "7px 12px", cursor: "pointer", color: "var(--text3)", fontSize: 11, fontFamily: "var(--mono)", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--em)"; e.currentTarget.style.color = "var(--em)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
          >
            <RefreshCw size={11} /> REGENERATE
          </button>
        )}
      </div>

      {/* ── Idle State ── */}
      {step === "idle" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "48px 32px", textAlign: "center" }}
        >
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 40px rgba(0,255,136,0.1)" }}>
            <TrendingUp size={30} color="var(--em)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.02em" }}>
            Get your personalized plan
          </h3>
          <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, maxWidth: 380, margin: "0 auto 32px" }}>
            Claude AI will analyze your budget data and build a custom investment strategy — allocations, projections, and all.
          </p>
          <button onClick={generate}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--em)", color: "#000", border: "none", borderRadius: 10, padding: "13px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", boxShadow: "0 0 24px rgba(0,255,136,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,255,136,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(0,255,136,0.4)"; }}
          >
            <Sparkles size={15} /> Generate My Plan <ArrowRight size={15} />
          </button>
        </motion.div>
      )}

      {/* ── Loading State ── */}
      {step === "generating" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "64px 32px", textAlign: "center" }}
        >
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--em)", animation: "bounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s`, boxShadow: "0 0 8px rgba(0,255,136,0.6)" }} />
            ))}
          </div>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)", letterSpacing: "2px" }}>ANALYZING YOUR BUDGET...</p>
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>Claude is building your personalized plan</p>
        </motion.div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
          <AlertTriangle size={14} color="#FF4444" />
          <span style={{ fontSize: 12, color: "#FF4444" }}>{error}</span>
        </div>
      )}

      {/* ── Approved State ── */}
      <AnimatePresence>
        {step === "approved" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 16, padding: "32px", textAlign: "center", marginBottom: 24 }}
          >
            <CheckCircle2 size={40} color="var(--em)" style={{ margin: "0 auto 12px", display: "block", filter: "drop-shadow(0 0 12px rgba(0,255,136,0.6))" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Plan Approved! 🎉</h3>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>
              Your investment plan is locked in. Auto-execution with real brokers is <span style={{ color: "var(--em)", fontWeight: 600 }}>coming soon</span> — for now, you can follow this plan manually or use a paper trading account to practice.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Plan Card ── */}
      <AnimatePresence>
        {plan && step !== "idle" && step !== "generating" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* Summary row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {/* Monthly Investment */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "1px", marginBottom: 6 }}>MONTHLY INVEST</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: "var(--em)" }}>
                  ${plan.monthlyInvestment.toLocaleString()}
                </p>
              </div>
              {/* Risk Profile */}
              <div style={{ background: "var(--surface)", border: `1px solid ${riskColor}30`, borderRadius: 12, padding: "16px" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "1px", marginBottom: 6 }}>RISK PROFILE</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <RiskIcon size={14} color={riskColor} />
                  <p style={{ fontSize: 13, fontWeight: 700, color: riskColor }}>{plan.riskProfile}</p>
                </div>
              </div>
              {/* Time Horizon */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px" }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "1px", marginBottom: 6 }}>HORIZON</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={12} color="var(--text2)" />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)" }}>{plan.timeHorizon}</p>
                </div>
              </div>
            </div>

            {/* Summary text */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8 }}>{plan.summary}</p>
            </div>

            {/* Allocations + Donut */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px", marginBottom: 16 }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "1.5px", marginBottom: 16 }}>// ALLOCATIONS</p>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <DonutChart allocations={plan.allocations} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.allocations.map((a, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0, boxShadow: `0 0 6px ${a.color}80` }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{a.symbol}</span>
                            <span style={{ fontSize: 10, color: "var(--text3)" }}>{a.name.slice(0, 20)}{a.name.length > 20 ? "…" : ""}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: a.color, fontWeight: 700 }}>{a.percentage}%</span>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>${a.monthlyAmount}/mo</span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: 3, background: "var(--border)", borderRadius: 999, marginTop: 4 }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${a.percentage}%` }} transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: "easeOut" }}
                            style={{ height: "100%", background: a.color, borderRadius: 999, boxShadow: `0 0 6px ${a.color}60` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px", marginBottom: 16 }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "1.5px", marginBottom: 14 }}>// WHY EACH PICK</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.allocations.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 20, borderRadius: 5, background: a.color + "20", border: `1px solid ${a.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: a.color, fontWeight: 700 }}>{a.symbol.slice(0,4)}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{a.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projections */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                <Target size={13} color="var(--em)" />
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "1.5px" }}>// PROJECTED GROWTH</p>
              </div>
              <ProjectionBar label="1 YEAR"  value={plan.projections.oneYear}   max={maxProjection} color="#00CFFF" />
              <ProjectionBar label="3 YEARS" value={plan.projections.threeYear} max={maxProjection} color="#A855F7" />
              <ProjectionBar label="5 YEARS" value={plan.projections.fiveYear}  max={maxProjection} color="var(--em)" />
              <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginTop: 10, letterSpacing: "0.5px" }}>* Projections are estimates based on historical averages. Not financial advice.</p>
            </div>

            {/* Tips */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <Lightbulb size={13} color="#FFD600" />
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FFD600", letterSpacing: "1.5px" }}>// SMART TIPS</p>
              </div>
              {plan.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <ChevronRight size={12} color="#FFD600" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7 }}>{tip}</p>
                </div>
              ))}
            </div>

            {/* Approve button */}
            {step === "ready" && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={approve}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "var(--em)", color: "#000", border: "none", borderRadius: 12, padding: "16px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", boxShadow: "0 0 32px rgba(0,255,136,0.4)", transition: "all 0.2s" }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 40px rgba(0,255,136,0.6)" }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle2 size={18} /> Approve & Lock In This Plan
              </motion.button>
            )}

            {step === "approved" && (
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 12, padding: "16px", fontSize: 14, fontWeight: 600, color: "var(--em)", fontFamily: "'Space Grotesk', sans-serif" }}>
                <CheckCircle2 size={16} /> Plan Approved
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
}