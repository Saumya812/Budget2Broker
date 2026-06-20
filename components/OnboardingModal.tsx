"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, TrendingUp, Bot, ArrowRight, X } from "lucide-react";

const STEPS = [
  {
    icon: Wallet,
    color: "#00FF88",
    title: "Add your income",
    desc: "Tell us how much you earn so we can build an accurate picture of your finances.",
  },
  {
    icon: TrendingUp,
    color: "#00CFFF",
    title: "Track your expenses",
    desc: "Log what you spend by category — rent, food, subscriptions, and more.",
  },
  {
    icon: Bot,
    color: "#A855F7",
    title: "Get AI insights",
    desc: "Your personal AI mentor analyzes your data and gives you a tailored financial plan.",
  },
];

function dismissKey(userId: string) {
  return `onboarding-dismissed-${userId}`;
}

export default function OnboardingModal({ userId }: { userId: string }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(dismissKey(userId))) {
      setVisible(true);
    }
  }, [userId]);

  const dismiss = () => {
    localStorage.setItem(dismissKey(userId), "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <motion.div
            key="onboarding-card"
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(0,255,136,0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "36px 32px",
              maxWidth: 520,
              width: "100%",
              position: "relative",
              boxShadow: "0 0 80px rgba(0,255,136,0.08), 0 32px 64px rgba(0,0,0,0.5)",
            }}
          >
            {/* top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.6), transparent)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0" }} />

            {/* close */}
            <button
              onClick={dismiss}
              style={{
                position: "absolute", top: 16, right: 16,
                background: "none", border: "none",
                color: "var(--text3)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 4, borderRadius: 6,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text3)")}
            >
              <X size={16} />
            </button>

            {/* header */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 10 }}>// WELCOME TO BUDGET2BROKER</p>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 8 }}>
                Your financial journey<br />starts here<span style={{ color: "var(--em)" }}>.</span>
              </h2>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
                Set up your profile in 3 simple steps and get a personalized AI financial plan in under 2 minutes.
              </p>
            </div>

            {/* steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    background: "var(--bg3)",
                    border: `1px solid ${step.color}18`,
                    borderRadius: "var(--radius)",
                    padding: "14px 16px",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, flexShrink: 0,
                    background: step.color + "12",
                    border: `1px solid ${step.color}30`,
                    borderRadius: 9,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <step.icon size={16} color={step.color} strokeWidth={1.75} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: step.color, fontWeight: 700, letterSpacing: "1px" }}>STEP {i + 1}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{step.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { dismiss(); router.push("/dashboard/budget"); }}
                style={{
                  flex: 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "var(--em)",
                  color: "#000",
                  border: "none",
                  borderRadius: "var(--radius)",
                  padding: "12px 20px",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "var(--em-glow-sm)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "var(--em-glow)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "var(--em-glow-sm)")}
              >
                Add your first income <ArrowRight size={15} />
              </button>
              <button
                onClick={dismiss}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "12px 16px",
                  color: "var(--text3)", fontSize: 13, fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text3)"; }}
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
