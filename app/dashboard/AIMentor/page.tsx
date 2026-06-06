"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send, Bot, User, Sparkles, TrendingUp, PiggyBank,
  BookOpen, BarChart2, Zap, RefreshCw, Copy, Check,
  Mic, MicOff,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; id: number };

type SpeechResult = ArrayLike<ArrayLike<{ transcript: string }>>;
type FakeRec = {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: SpeechResult }) => void) | null;
  onerror:  (() => void) | null;
  onend:    (() => void) | null;
};

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Analyze my spending",  text: "Can you analyze my current spending habits and tell me where I can improve?", color: "#00FF88" },
  { icon: PiggyBank,  label: "Build a savings plan", text: "Based on my budget data, can you create a personalized savings plan for me?",  color: "#00CFFF" },
  { icon: BarChart2,  label: "Investment strategy",  text: "What investment strategy would you recommend based on my financial situation?", color: "#A855F7" },
  { icon: BookOpen,   label: "Explain index funds",  text: "Explain index funds to me like I am a complete beginner.",                     color: "#FF6B35" },
  { icon: Zap,        label: "Reduce expenses",      text: "What are the top 3 ways I can reduce my monthly expenses right now?",           color: "#FFD600" },
  { icon: TrendingUp, label: "Start investing",      text: "I want to start investing with $500. What should I do first?",                 color: "#FF4488" },
];

function getBudgetContext(): string {
  try {
    const raw = localStorage.getItem("budgetData");
    if (!raw) return "The user has not added any budget data yet.";
    const expenses: { name: string; amount: number; type: "income" | "expense"; category: string }[] = JSON.parse(raw);
    if (!expenses.length) return "The user has not added any budget entries yet.";
    const totalIncome  = expenses.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    const remaining    = totalIncome - totalExpense;
    const byCategory: Record<string, number> = {};
    expenses.filter(e => e.type === "expense").forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const breakdown = Object.entries(byCategory).map(([cat, amt]) => `  - ${cat}: $${amt.toFixed(2)}`).join("\n");
    return `User budget summary:\n- Total income: $${totalIncome.toFixed(2)}\n- Total expenses: $${totalExpense.toFixed(2)}\n- Remaining: $${remaining.toFixed(2)}\n- Expense breakdown:\n${breakdown || "  (none)"}`;
  } catch { return "Could not read budget data."; }
}

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.015) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 12px rgba(0,255,136,0.2)" }}>
        <Bot size={15} color="var(--em)" />
      </div>
      <div style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", display: "flex", alignItems: "center", gap: 5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--em)", animation: "bounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s`, boxShadow: "0 0 6px rgba(0,255,136,0.6)" }} />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ msg, onCopy }: { msg: Message; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{ display: "flex", alignItems: "flex-start", gap: 10, flexDirection: isUser ? "row-reverse" : "row" }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: isUser ? "rgba(0,207,255,0.1)" : "rgba(0,255,136,0.1)",
        border: `1px solid ${isUser ? "rgba(0,207,255,0.25)" : "rgba(0,255,136,0.25)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: isUser ? "0 0 12px rgba(0,207,255,0.2)" : "0 0 12px rgba(0,255,136,0.2)",
        marginTop: 2,
      }}>
        {isUser ? <User size={14} color="#00CFFF" /> : <Bot size={14} color="var(--em)" />}
      </div>

      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4, alignItems: isUser ? "flex-end" : "flex-start" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: isUser ? "#00CFFF" : "var(--em)", letterSpacing: "1px", opacity: 0.7 }}>
          {isUser ? "YOU" : "Budget2Broker AI"}
        </span>
        <div style={{
          background: isUser ? "linear-gradient(135deg, rgba(0,207,255,0.15), rgba(0,207,255,0.08))" : "var(--surface2)",
          border: `1px solid ${isUser ? "rgba(0,207,255,0.25)" : "var(--border2)"}`,
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: "12px 16px", fontSize: 14, color: "var(--text)",
          lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word",
          boxShadow: isUser ? "0 4px 20px rgba(0,207,255,0.08)" : "none",
        }}>
          {msg.content}
        </div>
        {!isUser && (
          <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: copied ? "var(--em)" : "var(--text3)", fontSize: 10, fontFamily: "var(--mono)", padding: "2px 4px", transition: "color 0.15s" }}>
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? "COPIED" : "COPY"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function AImentorPage() {
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const recRef    = useRef<FakeRec | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

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
      const reply = data.content?.[0]?.text ?? "Sorry, I could not get a response. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply, id: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Could not reach the AI mentor. Please check your API setup.", id: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const toggleVoice = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const w  = window as unknown as { SpeechRecognition?: new () => FakeRec; webkitSpeechRecognition?: new () => FakeRec };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;
    const rec      = new SR();
    rec.continuous     = false;
    rec.interimResults = false;
    rec.onresult = (e: { results: SpeechResult }) => {
      const transcript = (e.results[0] as ArrayLike<{ transcript: string }>)[0].transcript;
      setInput(prev => prev + transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend   = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ background: "var(--bg)", height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <GridBg />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 10, borderBottom: "1px solid var(--border)", background: "rgba(8,14,9,0.9)", backdropFilter: "blur(20px)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,255,136,0.2)" }}>
            <Bot size={20} color="var(--em)" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Budget2Broker AI</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--em)", display: "inline-block", boxShadow: "0 0 8px var(--em)", animation: "pulse-em 2s infinite" }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--em)", fontWeight: 700, letterSpacing: "1px" }}>ONLINE</span>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>Personal financial mentor · Budget-aware</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--border2)", borderRadius: 8, padding: "7px 12px", cursor: "pointer", color: "var(--text3)", fontSize: 11, fontFamily: "var(--mono)", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
            >
              <RefreshCw size={11} /> CLEAR
            </button>
          )}
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px" }}>
            {messages.length} msgs
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }} className="fm-messages">
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px 12px" }}>
          {isEmpty ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 280px)", textAlign: "center" }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 40px rgba(0,255,136,0.1)", animation: "float 3s ease-in-out infinite" }}>
                  <Sparkles size={30} color="var(--em)" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  How can I help you<span style={{ color: "var(--em)" }}>?</span>
                </h2>
                <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 40, maxWidth: 400, lineHeight: 1.7 }}>
                  I am your AI financial mentor. I can see your budget data and give personalized advice on saving, investing, and building wealth.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 680, margin: "0 auto" }} className="fm-prompts-grid">
                  {QUICK_PROMPTS.map((p, i) => (
                    <motion.button key={i}
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      onClick={() => sendMessage(p.text)}
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "50"; e.currentTarget.style.background = "var(--surface2)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${p.color}15`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: p.color + "15", border: `1px solid ${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                        <p.icon size={14} color={p.color} />
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{p.label}</p>
                      <p style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>{p.text.slice(0, 48)}...</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {messages.map(msg => <MessageBubble key={msg.id} msg={msg} onCopy={handleCopy} />)}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Quick prompts bar */}
      {!isEmpty && (
        <div style={{ position: "relative", zIndex: 10, overflowX: "auto", padding: "8px 24px 0", flexShrink: 0 }} className="fm-hide-scrollbar">
          <div style={{ display: "flex", gap: 8, width: "max-content" }}>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p.text)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "'Space Grotesk', sans-serif" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "60"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <p.icon size={11} color={p.color} />
                <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div style={{ position: "relative", zIndex: 10, flexShrink: 0, borderTop: "1px solid var(--border)", background: "rgba(8,14,9,0.95)", backdropFilter: "blur(20px)", padding: "16px 24px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div
            style={{ display: "flex", alignItems: "flex-end", gap: 10, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 16, padding: "10px 10px 10px 16px", transition: "border-color 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--em)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px var(--em3)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
          >
            <textarea
              ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask about budgeting, investing, savings strategies..."
              disabled={loading} rows={1}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "'Space Grotesk', sans-serif", resize: "none", lineHeight: 1.6, maxHeight: 120, overflowY: "auto", padding: "2px 0" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <button onClick={toggleVoice} style={{ width: 34, height: 34, borderRadius: 10, background: listening ? "rgba(255,68,68,0.1)" : "transparent", border: `1px solid ${listening ? "rgba(255,68,68,0.3)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}>
                {listening ? <MicOff size={14} color="var(--red)" /> : <Mic size={14} color="var(--text3)" />}
              </button>
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                style={{ width: 36, height: 36, borderRadius: 10, background: input.trim() && !loading ? "var(--em)" : "var(--border)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "not-allowed", transition: "all 0.2s", boxShadow: input.trim() && !loading ? "0 0 16px rgba(0,255,136,0.4)" : "none" }}
              >
                {loading
                  ? <RefreshCw size={14} color="var(--text3)" style={{ animation: "spin 1s linear infinite" }} />
                  : <Send size={14} color={input.trim() ? "#000" : "var(--text3)"} />
                }
              </button>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "0.5px" }}>SHIFT+ENTER for new line · ENTER to send</p>
            <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "0.5px" }}>Powered by Claude · Not financial advice</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-em { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fm-messages::-webkit-scrollbar { width: 3px; }
        .fm-messages::-webkit-scrollbar-track { background: transparent; }
        .fm-messages::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
        .fm-hide-scrollbar::-webkit-scrollbar { display: none; }
        .fm-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) { .fm-prompts-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}