"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, TrendingUp, Activity } from "lucide-react";

const links = [
  { href: "/dashboard",           label: "Dashboard" },
  { href: "/dashboard/budget",    label: "Budget" },
  { href: "/dashboard/learn",     label: "Investments" },
  { href: "/Educational_Modules", label: "Learn" },
  { href: "/calendar", label: "Calendar" },
  { href: "/dashboard/AIMentor", label: "Chat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,14,9,0.85)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        {/* Top green line */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)", opacity: 0.4 }} />

        <div style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: "var(--em3)",
              border: "1px solid var(--em2)",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--em-glow-sm)",
            }}>
              <TrendingUp size={16} color="var(--em)" strokeWidth={2} />
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 17, fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}>
              Fin<span style={{ color: "var(--em)" }}>Mentor</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="fm-desktop-nav">
            {links.map(l => {
              const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link key={l.href} href={l.href} style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? "var(--em)" : "var(--text2)",
                  background: active ? "var(--em3)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  letterSpacing: active ? "0.01em" : "0",
                  border: active ? "1px solid var(--border2)" : "1px solid transparent",
                }}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="fm-desktop-nav">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--em)", boxShadow: "var(--em-glow-sm)", animation: "pulse-em 2s infinite", display: "inline-block" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", fontWeight: 700, letterSpacing: "1px" }}>LIVE</span>
            </div>

            <Link href="/dashboard" className="btn-em" style={{ padding: "7px 18px", fontSize: 12, gap: 6 }}>
              <Activity size={13} /> Open App
            </Link>

            <button
              onClick={() => setOpen(!open)}
              style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 4 }}
              className="fm-mobile-btn"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div style={{
            borderTop: "1px solid var(--border)",
            background: "var(--bg2)",
            padding: "8px 24px 20px",
          }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0",
                fontSize: 15, fontWeight: 500,
                color: "var(--text)",
                textDecoration: "none",
                borderBottom: "1px solid var(--border)",
              }}>
                {l.label}
                <span style={{ color: "var(--em)", fontSize: 12 }}>→</span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .fm-desktop-nav { display: none !important; }
          .fm-mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}