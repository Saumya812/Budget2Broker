"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug, Lightbulb, MessageSquare, Mail, ChevronDown,
  ChevronUp, Send, CheckCircle, AlertCircle, Zap,
  HelpCircle, ArrowRight,
} from "lucide-react";

type FormType = "bug" | "feature" | "feedback" | null;

const FAQS = [
  {
    q: "Why is my stock data not loading?",
    a: "Stock data requires a valid Alpha Vantage API key set in your .env.local file as ALPHA_VANTAGE_KEY. The free tier allows 25 requests per day. If you have hit the limit, data will resume at midnight.",
  },
  {
    q: "Why is the AI mentor not responding?",
    a: "The AI mentor requires an Anthropic API key set as ANTHROPIC_API_KEY in your .env.local file. This is a paid API — visit console.anthropic.com to get your key and add credits.",
  },
  {
    q: "My budget data disappeared. What happened?",
    a: "Budget data is stored in your browser's localStorage. Clearing your browser cache or using a different browser will result in data loss. We recommend exporting your data regularly.",
  },
  {
    q: "How do I reset my simulated portfolio?",
    a: "Open your browser DevTools (F12), go to Application > Local Storage, find the 'portfolio' key and delete it. Your portfolio will reset to the default $10,000 cash.",
  },
  {
    q: "The calendar is not showing my transactions.",
    a: "Transactions only appear on the calendar if they were added after the date tracking feature was implemented. Older transactions may not have a date attached.",
  },
  {
    q: "Is my financial data secure?",
    a: "All your data is stored locally in your browser — nothing is sent to external servers (except AI queries which go to Anthropic). Your financial information never leaves your device.",
  },
];

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "20%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "5%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

/* ── FAQ Item ── */
function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        background: "var(--surface)",
        border: `1px solid ${open ? "rgba(0,255,136,0.25)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "border-color 0.2s",
        boxShadow: open ? "0 0 20px rgba(0,255,136,0.06)" : "none",
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "16px 20px",
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          fontFamily: "'Space Grotesk', sans-serif", textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: open ? "var(--em)" : "var(--border2)", boxShadow: open ? "0 0 6px var(--em)" : "none", flexShrink: 0, transition: "all 0.2s" }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: open ? "var(--em)" : "var(--text)", transition: "color 0.2s" }}>{faq.q}</span>
        </div>
        <div style={{ flexShrink: 0, color: open ? "var(--em)" : "var(--text3)", transition: "color 0.2s" }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 16px 36px", borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.8, paddingTop: 12 }}>{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Form ── */
function ReportForm({ type, onClose }: { type: FormType; onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", email: "", priority: "medium" });

  if (!type) return null;

  const config = {
    bug:      { label: "Bug Report",        color: "#FF4444", icon: Bug,         placeholder: "e.g. Stock chart not loading on mobile" },
    feature:  { label: "Feature Request",   color: "#00CFFF", icon: Lightbulb,   placeholder: "e.g. Add crypto prices to the tracker" },
    feedback: { label: "General Feedback",  color: "#A855F7", icon: MessageSquare, placeholder: "e.g. Love the dark theme! Could the..." },
  }[type];

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: `1px solid ${config.color}30`, borderRadius: 20, width: "100%", maxWidth: 500, overflow: "hidden", boxShadow: `0 0 60px ${config.color}15` }}
      >
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }} />

        <div style={{ padding: "24px" }}>
          {!submitted ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: config.color + "15", border: `1px solid ${config.color}30`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 16px ${config.color}30` }}>
                  <config.icon size={18} color={config.color} />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: config.color, letterSpacing: "2px", marginBottom: 2 }}>// {type.toUpperCase()}</p>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{config.label}</h3>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>TITLE *</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={config.placeholder}
                    style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", outline: "none", transition: "border-color 0.2s" }}
                    onFocus={e => (e.currentTarget.style.borderColor = config.color)}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>DESCRIPTION *</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Please describe in detail..."
                    rows={4}
                    style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.2s" }}
                    onFocus={e => (e.currentTarget.style.borderColor = config.color)}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
                  />
                </div>

                <div>
                  <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>EMAIL (OPTIONAL)</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", outline: "none", transition: "border-color 0.2s" }}
                    onFocus={e => (e.currentTarget.style.borderColor = config.color)}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border2)")}
                  />
                </div>

                {type === "bug" && (
                  <div>
                    <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>PRIORITY</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["low", "medium", "high"] as const).map(p => (
                        <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                          style={{
                            flex: 1, padding: "8px", background: form.priority === p ? (p === "high" ? "rgba(255,68,68,0.15)" : p === "medium" ? "rgba(255,214,0,0.15)" : "rgba(0,255,136,0.15)") : "var(--bg3)",
                            border: `1px solid ${form.priority === p ? (p === "high" ? "rgba(255,68,68,0.4)" : p === "medium" ? "rgba(255,214,0,0.4)" : "rgba(0,255,136,0.4)") : "var(--border)"}`,
                            borderRadius: 7, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10,
                            color: form.priority === p ? (p === "high" ? "var(--red)" : p === "medium" ? "#FFD600" : "var(--em)") : "var(--text3)",
                            letterSpacing: "0.5px", transition: "all 0.15s", textTransform: "uppercase",
                          }}
                        >{p}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button onClick={onClose}
                    style={{ flex: 1, padding: "11px", background: "transparent", color: "var(--text3)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text3)"; }}
                  >Cancel</button>
                  <button onClick={handleSubmit} disabled={!form.title.trim() || !form.description.trim()}
                    style={{ flex: 2, padding: "11px", background: config.color, color: type === "bug" ? "#fff" : "#000", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: !form.title.trim() || !form.description.trim() ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk', sans-serif", opacity: !form.title.trim() || !form.description.trim() ? 0.4 : 1, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: form.title.trim() && form.description.trim() ? `0 0 16px ${config.color}40` : "none" }}
                  >
                    <Send size={14} /> Submit
                  </button>
                </div>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{ width: 64, height: 64, borderRadius: "50%", background: config.color + "15", border: `1px solid ${config.color}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: `0 0 32px ${config.color}30` }}
              >
                <CheckCircle size={28} color={config.color} />
              </motion.div>
              <h4 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Submitted!</h4>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 24 }}>
                Thank you for your {type === "bug" ? "bug report" : type === "feature" ? "feature request" : "feedback"}. We will review it shortly.
              </p>
              <button onClick={onClose} style={{ padding: "12px 32px", background: config.color, color: type === "bug" ? "#fff" : "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", boxShadow: `0 0 20px ${config.color}40` }}>
                Close
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function ReportProblemPage() {
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [activeTab, setActiveTab]   = useState<"faq" | "contact">("faq");

  const cards = [
    { type: "bug" as FormType,     icon: Bug,          label: "Bug Report",       desc: "Something is broken or not working as expected.", color: "#FF4444", tag: "TECHNICAL" },
    { type: "feature" as FormType, icon: Lightbulb,    label: "Feature Request",  desc: "Suggest a new feature or improvement to FinMentor.", color: "#00CFFF", tag: "PRODUCT" },
    { type: "feedback" as FormType,icon: MessageSquare, label: "General Feedback", desc: "Share your thoughts, compliments, or concerns.", color: "#A855F7", tag: "GENERAL" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 10 }}>// SUPPORT CENTER</p>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 10 }}>
            How can we <span style={{ color: "var(--em)" }}>help?</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text2)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Search our FAQ, report a bug, request a feature, or get in touch with our team.
          </p>
        </motion.div>

        {/* Report type cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 40 }} className="fm-support-grid">
          {cards.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <button
                onClick={() => setActiveForm(c.type)}
                style={{
                  width: "100%", padding: "22px 20px",
                  background: "var(--surface)", border: `1px solid var(--border)`,
                  borderRadius: "var(--radius-lg)", cursor: "pointer",
                  textAlign: "left", transition: "all 0.25s",
                  fontFamily: "'Space Grotesk', sans-serif",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = c.color + "50";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 12px 40px ${c.color}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${c.color}60, transparent)`, opacity: 0, transition: "opacity 0.2s" }} className="card-top-line" />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: c.color + "15", border: `1px solid ${c.color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <c.icon size={20} color={c.color} strokeWidth={1.5} />
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: c.color, background: c.color + "15", border: `1px solid ${c.color}25`, borderRadius: 100, padding: "2px 8px", letterSpacing: "0.5px" }}>{c.tag}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{c.label}</h3>
                <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 14 }}>{c.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: c.color, fontSize: 12, fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: "0.5px" }}>
                  OPEN FORM <ArrowRight size={12} />
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Tabs: FAQ + Contact */}
        <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 20 }}>
          {[
            { id: "faq" as const,     icon: HelpCircle, label: "FAQ" },
            { id: "contact" as const, icon: Mail,        label: "Contact" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, padding: "14px", background: activeTab === tab.id ? "var(--em3)" : "transparent", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? "var(--em)" : "transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <tab.icon size={14} color={activeTab === tab.id ? "var(--em)" : "var(--text3)"} />
              <span style={{ fontSize: 13, fontWeight: 600, color: activeTab === tab.id ? "var(--em)" : "var(--text3)" }}>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* FAQ */}
          {activeTab === "faq" && (
            <motion.div key="faq" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <HelpCircle size={13} color="var(--em)" />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px" }}>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
              </div>
              <div style={{ marginTop: 20, padding: "16px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertCircle size={16} color="var(--text3)" />
                  <p style={{ fontSize: 13, color: "var(--text2)" }}>Didn't find your answer?</p>
                </div>
                <button onClick={() => setActiveTab("contact")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--em3)", border: "1px solid var(--em2)", borderRadius: 8, cursor: "pointer", color: "var(--em)", fontSize: 12, fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: "0.5px", transition: "all 0.15s" }}
                >
                  CONTACT US <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Contact */}
          {activeTab === "contact" && (
            <motion.div key="contact" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Mail size={13} color="var(--em)" />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px" }}>GET IN TOUCH</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="fm-contact-grid">
                {[
                  { icon: Bug,          label: "Bug Reports",     desc: "Found a technical issue? We want to know.", color: "#FF4444", action: () => setActiveForm("bug") },
                  { icon: Lightbulb,    label: "Feature Requests", desc: "Have an idea? We are always listening.", color: "#00CFFF", action: () => setActiveForm("feature") },
                  { icon: MessageSquare, label: "General Feedback", desc: "Tell us what you love or what to improve.", color: "#A855F7", action: () => setActiveForm("feedback") },
                  { icon: Mail,         label: "Email Support",    desc: "support@finmentor.ai — we reply within 24hrs.", color: "#FF6B35", action: () => {} },
                ].map((c, i) => (
                  <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    onClick={c.action}
                    style={{ padding: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", cursor: "pointer", textAlign: "left", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif", position: "relative", overflow: "hidden" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = c.color + "40"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${c.color}12`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: c.color + "15", border: `1px solid ${c.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                      <c.icon size={17} color={c.color} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{c.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{c.desc}</p>
                  </motion.button>
                ))}
              </div>

              {/* Response time */}
              <div style={{ marginTop: 14, padding: "14px 20px", background: "var(--em3)", border: "1px solid var(--em2)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 0 20px rgba(0,255,136,0.06)" }}>
                <Zap size={15} color="var(--em)" />
                <p style={{ fontSize: 13, color: "var(--text2)" }}>
                  <span style={{ color: "var(--em)", fontWeight: 600 }}>Average response time: 24 hours.</span>{" "}
                  Critical bugs are addressed within 4 hours.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {activeForm && <ReportForm type={activeForm} onClose={() => setActiveForm(null)} />}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .fm-support-grid { grid-template-columns: 1fr !important; }
          .fm-contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}