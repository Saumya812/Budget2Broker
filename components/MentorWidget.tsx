"use client";
import { useState } from "react";
import { MessageCircle, X, Bot } from "lucide-react";
import Link from "next/link";

export default function MentorWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--em)", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 0 20px rgba(0,255,136,0.4)",
          transition: "all 0.2s",
        }}>
          <MessageCircle size={22} color="#000" />
        </button>
      ) : (
        <div style={{
          width: 280, background: "var(--surface)",
          border: "1px solid var(--em2)", borderRadius: 16,
          boxShadow: "0 0 40px rgba(0,255,136,0.15)",
          overflow: "hidden",
        }}>
          <div style={{ background: "var(--bg3)", padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bot size={16} color="var(--em)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)", fontWeight: 700 }}>FINMENTOR AI</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: "20px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, marginBottom: 16 }}>
              Your AI financial mentor is ready. Get personalized advice based on your budget.
            </p>
            <Link href="/dashboard/AIMentor" onClick={() => setOpen(false)} style={{
              display: "block", padding: "10px",
              background: "var(--em)", color: "#000",
              borderRadius: 8, fontSize: 13, fontWeight: 700,
              textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Open AI Mentor →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}