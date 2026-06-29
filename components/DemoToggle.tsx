"use client";

import { useState } from "react";
import { useAuthFetch } from "@/lib/use-auth-fetch";
import { Sparkles, X, Loader2 } from "lucide-react";

interface Props {
  isDemo: boolean;
  onToggle: (nowDemo: boolean) => void;
}

export default function DemoToggle({ isDemo, onToggle }: Props) {
  const authFetch = useAuthFetch();
  const [loading, setLoading] = useState(false);

  const enable = async () => {
    setLoading(true);
    try {
      await authFetch("/api/seed-demo", { method: "POST" });
      onToggle(true);
    } finally { setLoading(false); }
  };

  const disable = async () => {
    setLoading(true);
    try {
      await authFetch("/api/seed-demo", { method: "DELETE" });
      onToggle(false);
    } finally { setLoading(false); }
  };

  if (isDemo) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Demo active pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px",
          background: "rgba(168,85,247,0.12)",
          border: "1px solid rgba(168,85,247,0.4)",
          borderRadius: 100,
          animation: "pulse-demo 2s ease-in-out infinite",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#A855F7", boxShadow: "0 0 6px #A855F7" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#A855F7", fontWeight: 700, letterSpacing: "1px" }}>
            DEMO ON
          </span>
        </div>
        {/* Exit demo button */}
        <button
          onClick={disable}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 12px",
            background: "rgba(168,85,247,0.08)",
            border: "1px solid rgba(168,85,247,0.3)",
            borderRadius: 8, cursor: loading ? "not-allowed" : "pointer",
            color: "#A855F7", fontSize: 11, fontWeight: 700,
            fontFamily: "var(--mono)", transition: "all 0.2s",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "rgba(168,85,247,0.18)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.08)"; }}
        >
          {loading ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <X size={11} />}
          Exit Demo
        </button>
        <style>{`
          @keyframes pulse-demo { 0%,100%{opacity:1} 50%{opacity:0.6} }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        `}</style>
      </div>
    );
  }

  return (
    <button
      onClick={enable}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "10px 16px", borderRadius: "var(--radius)",
        border: "1px solid var(--border2)", background: "var(--surface2)",
        color: "var(--text3)", fontSize: 12, fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s",
        opacity: loading ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "#A855F7"; e.currentTarget.style.color = "#A855F7"; }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
    >
      {loading
        ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
        : <Sparkles size={13} />}
      {loading ? "Loading..." : "Demo Data"}
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
