"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Bot, Send, User,
  Sparkles, RefreshCw, TrendingUp, PiggyBank,
  BarChart2, Zap,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; id: number };

const QUICK = [
  { icon: TrendingUp, label: "Analyze spending",   text: "Can you analyze my spending habits?",                color: "#00FF88" },
  { icon: PiggyBank,  label: "Savings plan",        text: "Create a personalized savings plan for me.",        color: "#00CFFF" },
  { icon: BarChart2,  label: "Invest $500",          text: "I want to start investing with $500. What first?", color: "#A855F7" },
  { icon: Zap,        label: "Cut expenses",         text: "Top 3 ways to reduce my monthly expenses?",        color: "#FFD600" },
];

function getBudgetContext(): string {
  try {
    const raw = localStorage.getItem("budgetData");
    if (!raw) return "No budget data yet.";
    const expenses: { name: string; amount: number; type: "income" | "expense"; category: string }[] = JSON.parse(raw);
    if (!expenses.length) return "No budget entries yet.";
    const totalIncome  = expenses.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    return `Income: $${totalIncome.toFixed(2)}, Expenses: $${totalExpense.toFixed(2)}, Remaining: $${(totalIncome - totalExpense).toFixed(2)}`;
  } catch { return "Could not read budget data."; }
}

export default function MentorWidget() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [pulse, setPulse]       = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  /* Pulse the button after 3 seconds to draw attention */
  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      setPulse(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const userMsg: Message = { role: "user", content, id: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/finbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, budgetContext: getBudgetContext() }),
      });
      if (!res.ok) throw new Error();
      const data  = await res.json();
      const reply = data.content?.[0]?.text ?? "Sorry, I could not get a response.";
      setMessages(prev => [...prev, { role: "assistant", content: reply, id: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Could not reach AI mentor. Check your API key.", id: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const isEmpty = messages.length === 0;

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              width: 340, height: 500,
              background: "var(--surface)",
              border: "1px solid var(--em2)",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(0,255,136,0.1)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Top accent */}
            <div style={{ height: 2, background: "linear-gradient(90deg, transparent, var(--em), transparent)", flexShrink: 0 }} />

            {/* Header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--em3)", border: "1px solid var(--em2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(0,255,136,0.3)" }}>
                  <Bot size={15} color="var(--em)" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Budget2Broker AI</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--em)", display: "inline-block", boxShadow: "0 0 6px var(--em)", animation: "pulse-em 2s infinite" }} />
                      <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--em)", fontWeight: 700, letterSpacing: "1px" }}>ONLINE</span>
                    </div>
                  </div>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)" }}>Budget-aware · Powered by Claude</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])}
                    style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
                  ><RefreshCw size={11} /></button>
                )}
                <button onClick={() => setOpen(false)}
                  style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
                ><X size={11} /></button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }} className="fm-widget-scroll">
              {isEmpty ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--em3)", border: "1px solid var(--em2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10, boxShadow: "0 0 20px rgba(0,255,136,0.15)" }}>
                    <Sparkles size={22} color="var(--em)" />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4, textAlign: "center" }}>How can I help you?</p>
                  <p style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", lineHeight: 1.6, marginBottom: 14 }}>Ask me anything about budgeting, investing, or saving money.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, width: "100%" }}>
                    {QUICK.map((q, i) => (
                      <button key={i} onClick={() => sendMessage(q.text)}
                        style={{ padding: "8px 10px", background: "var(--bg3)", border: `1px solid var(--border)`, borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = q.color + "50"; e.currentTarget.style.background = "var(--surface2)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}
                      >
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: q.color + "15", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 5 }}>
                          <q.icon size={11} color={q.color} />
                        </div>
                        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{q.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {messages.map(msg => {
                    const isUser = msg.role === "user";
                    return (
                      <div key={msg.id} style={{ display: "flex", gap: 7, flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: isUser ? "rgba(0,207,255,0.1)" : "var(--em3)", border: `1px solid ${isUser ? "rgba(0,207,255,0.25)" : "var(--em2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          {isUser ? <User size={11} color="#00CFFF" /> : <Bot size={11} color="var(--em)" />}
                        </div>
                        <div style={{
                          maxWidth: "78%", padding: "9px 12px", fontSize: 12, lineHeight: 1.7,
                          color: "var(--text)", whiteSpace: "pre-wrap", wordBreak: "break-word",
                          background: isUser ? "rgba(0,207,255,0.1)" : "var(--bg3)",
                          border: `1px solid ${isUser ? "rgba(0,207,255,0.2)" : "var(--border)"}`,
                          borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                  {loading && (
                    <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--em3)", border: "1px solid var(--em2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Bot size={11} color="var(--em)" />
                      </div>
                      <div style={{ padding: "10px 14px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "12px 12px 12px 4px", display: "flex", gap: 4, alignItems: "center" }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--em)", animation: "bounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s`, boxShadow: "0 0 4px rgba(0,255,136,0.6)" }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {/* Quick prompts when chatting */}
            {!isEmpty && (
              <div style={{ padding: "6px 12px 0", display: "flex", gap: 5, overflowX: "auto", flexShrink: 0 }} className="fm-widget-scroll">
                {QUICK.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q.text)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 100, cursor: "pointer", whiteSpace: "nowrap", fontSize: 10, color: "var(--text3)", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s", flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = q.color + "60"; e.currentTarget.style.color = q.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text3)"; }}
                  >
                    <q.icon size={9} color={q.color} />
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--bg3)", border: "1px solid var(--border2)", borderRadius: 12, padding: "6px 8px 6px 12px", transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--em)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border2)")}
              >
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                  placeholder="Ask about finances..."
                  disabled={loading}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif" }}
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  style={{ width: 28, height: 28, borderRadius: 8, background: input.trim() && !loading ? "var(--em)" : "var(--border)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "not-allowed", transition: "all 0.2s", flexShrink: 0, boxShadow: input.trim() && !loading ? "0 0 10px rgba(0,255,136,0.4)" : "none" }}
                >
                  {loading
                    ? <RefreshCw size={11} color="var(--text3)" style={{ animation: "spin 1s linear infinite" }} />
                    : <Send size={11} color={input.trim() ? "#000" : "var(--text3)"} />
                  }
                </button>
              </div>
              <p style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--text3)", textAlign: "center", marginTop: 5, letterSpacing: "0.5px" }}>NOT FINANCIAL ADVICE · POWERED BY CLAUDE</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 54, height: 54, borderRadius: "50%",
          background: open ? "var(--surface)" : "var(--em)",
          border: open ? "1px solid var(--em2)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: open
            ? "0 0 20px rgba(0,255,136,0.2)"
            : pulse
            ? "0 0 0 0 rgba(0,255,136,0.4)"
            : "0 0 20px rgba(0,255,136,0.4)",
          animation: pulse && !open ? "widget-pulse 2s ease-in-out 3" : "none",
          transition: "background 0.2s, border 0.2s",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} color="var(--em)" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90,  opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle size={22} color="#000" /></motion.div>
          }
        </AnimatePresence>

        {/* Unread dot when closed and has messages */}
        {!open && messages.length > 0 && (
          <div style={{ position: "absolute", top: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: "#FF4444", border: "2px solid var(--bg)", boxShadow: "0 0 6px rgba(255,68,68,0.6)" }} />
        )}
      </motion.button>

      <style>{`
        @keyframes pulse-em  { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce    { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
        @keyframes spin      { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes widget-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(0,255,136,0.6); }
          70%  { box-shadow: 0 0 0 16px rgba(0,255,136,0); }
          100% { box-shadow: 0 0 0 0   rgba(0,255,136,0); }
        }
        .fm-widget-scroll::-webkit-scrollbar { width: 2px; height: 2px; }
        .fm-widget-scroll::-webkit-scrollbar-track { background: transparent; }
        .fm-widget-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  );
}