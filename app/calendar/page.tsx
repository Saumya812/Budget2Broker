"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, X, Bell,
  TrendingUp, TrendingDown, Calendar, Flame,
} from "lucide-react";

type Expense = { id: number; name: string; category: string; amount: number; type: "income" | "expense"; date?: string };
type Reminder = { id: number; title: string; date: string; color: string; repeat: "none" | "weekly" | "monthly" };

const COLORS = ["#00FF88", "#00CFFF", "#A855F7", "#FF6B35", "#FFD600", "#FF4488"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

function loadReminders(): Reminder[] {
  try { return JSON.parse(localStorage.getItem("calReminders") ?? "[]"); } catch { return []; }
}
function saveReminders(r: Reminder[]) { localStorage.setItem("calReminders", JSON.stringify(r)); }
function loadExpenses(): Expense[] {
  try { return JSON.parse(localStorage.getItem("budgetData") ?? "[]"); } catch { return []; }
}

export default function CalendarPage() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<number | null>(today.getDate());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newRepeat, setNewRepeat] = useState<"none" | "weekly" | "monthly">("none");
  const [hovDay, setHovDay] = useState<number | null>(null);

  useEffect(() => {
    setExpenses(loadExpenses());
    setReminders(loadReminders());
  }, []);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  /* Map expenses to dates */
  const expByDay: Record<number, Expense[]> = {};
  expenses.forEach(e => {
    if (!e.date) return;
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      expByDay[day] = [...(expByDay[day] ?? []), e];
    }
  });

  /* Heatmap: daily spend as % of max */
  const dailySpend: Record<number, number> = {};
  Object.entries(expByDay).forEach(([d, es]) => {
    dailySpend[Number(d)] = es.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  });
  const maxSpend = Math.max(...Object.values(dailySpend), 1);

  /* Reminders by day */
  const remByDay: Record<number, Reminder[]> = {};
  reminders.forEach(r => {
    const d = new Date(r.date);
    let matches = false;
    if (r.repeat === "monthly" && d.getDate() <= daysInMonth) matches = true;
    else if (r.repeat === "weekly") {
      for (let day = 1; day <= daysInMonth; day++) {
        if (new Date(year, month, day).getDay() === d.getDay()) {
          remByDay[day] = [...(remByDay[day] ?? []), r];
        }
      }
      return;
    } else if (d.getFullYear() === year && d.getMonth() === month) matches = true;
    if (matches) {
      const day = d.getDate();
      remByDay[day] = [...(remByDay[day] ?? []), r];
    }
  });

  const addReminder = () => {
    if (!newTitle.trim() || !selected) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selected).padStart(2, "0")}`;
    const r: Reminder = { id: Date.now(), title: newTitle.trim(), date: dateStr, color: newColor, repeat: newRepeat };
    const next = [...reminders, r];
    setReminders(next); saveReminders(next);
    setNewTitle(""); setShowAdd(false);
  };

  const deleteReminder = (id: number) => {
    const next = reminders.filter(r => r.id !== id);
    setReminders(next); saveReminders(next);
  };

  const selectedExps = selected ? (expByDay[selected] ?? []) : [];
  const selectedRems = selected ? (remByDay[selected] ?? []) : [];
  const selectedIncome  = selectedExps.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const selectedExpense = selectedExps.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  /* Monthly totals */
  const monthIncome  = Object.values(expByDay).flat().filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const monthExpense = Object.values(expByDay).flat().filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 6 }}>// FINANCIAL CALENDAR</p>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em" }}>
              {MONTHS[month]} <span style={{ color: "var(--em)" }}>{year}</span>
            </h1>
          </div>

          {/* Monthly summary pills */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={13} color="var(--em)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--em)", fontWeight: 700 }}>${monthIncome.toFixed(0)}</span>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>income</span>
            </div>
            <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingDown size={13} color="var(--red)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--red)", fontWeight: 700 }}>${monthExpense.toFixed(0)}</span>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>spent</span>
            </div>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }} className="fm-cal-grid">

          {/* ── Calendar ── */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}
          >
            {/* Nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
              <button onClick={prevMonth} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 30, height: 30, cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--em)"; e.currentTarget.style.color = "var(--em)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--text)", letterSpacing: "0.5px" }}>
                {MONTHS[month].toUpperCase()} {year}
              </span>
              <button onClick={nextMonth} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 30, height: 30, cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--em)"; e.currentTarget.style.color = "var(--em)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; }}>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
              {DAYS.map(d => (
                <div key={d} style={{ padding: "10px 0", textAlign: "center", fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "1px", fontWeight: 600 }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e${i}`} style={{ borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", minHeight: 80 }} />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = isCurrentMonth && day === today.getDate();
                const isSel = day === selected;
                const hasExp = !!expByDay[day]?.length;
                const hasRem = !!remByDay[day]?.length;
                const heat = dailySpend[day] ? dailySpend[day] / maxSpend : 0;
                const hasIncome = expByDay[day]?.some(e => e.type === "income");
                const col = (firstDay + i) % 7;

                return (
                  <div
                    key={day}
                    onClick={() => setSelected(isSel ? null : day)}
                    onMouseEnter={() => setHovDay(day)}
                    onMouseLeave={() => setHovDay(null)}
                    style={{
                      borderRight: col < 6 ? "1px solid var(--border)" : "none",
                      borderBottom: "1px solid var(--border)",
                      minHeight: 80,
                      padding: "8px",
                      cursor: "pointer",
                      background: isSel
                        ? "rgba(0,255,136,0.08)"
                        : hovDay === day
                        ? "var(--surface2)"
                        : heat > 0 ? `rgba(255,${Math.round(68 + (136-68)*(1-heat))},${Math.round(68*(1-heat))},${heat * 0.08})` : "transparent",
                      transition: "background 0.15s",
                      position: "relative",
                    }}
                  >
                    {/* Heatmap glow */}
                    {heat > 0.3 && (
                      <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        background: `rgba(255,68,68,${heat * 0.06})`,
                      }} />
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <span style={{
                        fontFamily: "var(--mono)", fontSize: 13, fontWeight: isToday ? 700 : 500,
                        color: isSel ? "var(--em)" : isToday ? "var(--em)" : "var(--text)",
                        width: 24, height: 24,
                        background: isToday ? "var(--em3)" : "transparent",
                        border: isToday ? "1px solid var(--em2)" : "1px solid transparent",
                        borderRadius: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        textShadow: isToday ? "0 0 12px rgba(0,255,136,0.6)" : "none",
                      }}>{day}</span>

                      {heat > 0 && (
                        <Flame size={10} color={heat > 0.6 ? "#FF4444" : "#FF8800"} style={{ opacity: heat }} />
                      )}
                    </div>

                    {/* Dots */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 4 }}>
                      {hasIncome && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--em)", boxShadow: "0 0 4px rgba(0,255,136,0.6)" }} />}
                      {hasExp && !hasIncome && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--red)", boxShadow: "0 0 4px rgba(255,68,68,0.4)" }} />}
                      {hasRem && remByDay[day].slice(0, 3).map((r, ri) => (
                        <div key={ri} style={{ width: 5, height: 5, borderRadius: "50%", background: r.color, boxShadow: `0 0 4px ${r.color}80` }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg3)" }}>
              {[
                { color: "var(--em)", label: "Income" },
                { color: "var(--red)", label: "Expense" },
                { color: "#FF8800", label: "Reminder" },
                { color: "rgba(255,68,68,0.5)", label: "High spend", isSquare: true },
              ].map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: l.isSquare ? 8 : 6, height: l.isSquare ? 8 : 6, borderRadius: l.isSquare ? 2 : "50%", background: l.color, boxShadow: `0 0 4px ${l.color}80` }} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.5px" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Selected day detail */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}
            >
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px" }}>
                  {selected ? `${MONTHS[month].slice(0,3).toUpperCase()} ${selected}` : "SELECT A DAY"}
                </span>
                {selected && (
                  <button onClick={() => setShowAdd(true)} style={{ background: "var(--em3)", border: "1px solid var(--em2)", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: "var(--em)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={13} />
                  </button>
                )}
              </div>

              <div style={{ padding: "12px 16px", maxHeight: 280, overflowY: "auto" }}>
                {!selected ? (
                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: "24px 0" }}>CLICK A DATE</p>
                ) : selectedExps.length === 0 && selectedRems.length === 0 ? (
                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: "20px 0" }}>NO ACTIVITY</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Day totals */}
                    {(selectedIncome > 0 || selectedExpense > 0) && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        {selectedIncome > 0 && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 6, padding: "3px 8px" }}>+${selectedIncome.toFixed(0)}</span>
                        )}
                        {selectedExpense > 0 && (
                          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 6, padding: "3px 8px" }}>-${selectedExpense.toFixed(0)}</span>
                        )}
                      </div>
                    )}
                    {/* Transactions */}
                    {selectedExps.map(e => (
                      <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--surface2)", borderRadius: 7, border: "1px solid var(--border)" }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{e.name}</p>
                          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{e.category}</p>
                        </div>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: e.type === "income" ? "var(--em)" : "var(--red)" }}>
                          {e.type === "income" ? "+" : "-"}${e.amount.toFixed(0)}
                        </span>
                      </div>
                    ))}
                    {/* Reminders */}
                    {selectedRems.map(r => (
                      <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--surface2)", borderRadius: 7, border: `1px solid ${r.color}30` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <Bell size={11} color={r.color} />
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{r.title}</p>
                            {r.repeat !== "none" && <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", textTransform: "uppercase" }}>{r.repeat}</p>}
                          </div>
                        </div>
                        <button onClick={() => deleteReminder(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 2, transition: "color 0.15s" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                          onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}
                        ><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Add reminder form */}
            <AnimatePresence>
              {showAdd && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--em2)", borderRadius: "var(--radius-lg)", padding: "16px", boxShadow: "var(--em-glow-sm)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px" }}>// ADD REMINDER</span>
                      <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}><X size={14} /></button>
                    </div>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Reminder title..." onKeyDown={e => e.key === "Enter" && addReminder()}
                      style={{ width: "100%", padding: "9px 12px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 7, fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", outline: "none", marginBottom: 10 }}
                    />
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {COLORS.map(c => (
                        <button key={c} onClick={() => setNewColor(c)} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: newColor === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer", boxShadow: newColor === c ? `0 0 8px ${c}` : "none", transition: "all 0.15s" }} />
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                      {(["none", "weekly", "monthly"] as const).map(r => (
                        <button key={r} onClick={() => setNewRepeat(r)} style={{ flex: 1, padding: "5px 0", background: newRepeat === r ? "var(--em3)" : "transparent", border: `1px solid ${newRepeat === r ? "var(--em2)" : "var(--border)"}`, borderRadius: 6, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 9, color: newRepeat === r ? "var(--em)" : "var(--text3)", letterSpacing: "0.5px", transition: "all 0.15s", textTransform: "uppercase" }}>{r}</button>
                      ))}
                    </div>
                    <button onClick={addReminder} disabled={!newTitle.trim()} style={{ width: "100%", padding: "9px", background: "var(--em)", color: "#000", border: "none", borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", opacity: !newTitle.trim() ? 0.4 : 1 }}>
                      Save Reminder
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upcoming reminders */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Bell size={13} color="#FF8800" />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FF8800", letterSpacing: "2px" }}>REMINDERS ({reminders.length})</span>
              </div>
              {reminders.length === 0 ? (
                <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: "12px 0" }}>NO REMINDERS SET</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {reminders.slice(0, 5).map(r => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "var(--surface2)", borderRadius: 7, border: `1px solid ${r.color}20` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
                        <div>
                          <p style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>{r.title}</p>
                          <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)" }}>{r.date} {r.repeat !== "none" && `· ${r.repeat}`}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteReminder(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 2 }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}
                      ><X size={11} /></button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Heatmap legend */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <Flame size={12} color="#FF8800" />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#FF8800", letterSpacing: "2px" }}>SPEND HEATMAP</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)" }}>LOW</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "linear-gradient(90deg, rgba(0,255,136,0.1), rgba(255,136,0,0.3), rgba(255,68,68,0.6))" }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)" }}>HIGH</span>
              </div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginTop: 8 }}>
                Max daily spend: ${maxSpend === 1 ? "0" : maxSpend.toFixed(0)}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .fm-cal-grid { grid-template-columns: 1fr !important; } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  );
}