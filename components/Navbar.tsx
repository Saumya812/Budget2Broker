"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { TrendingUp, Menu, X, Zap } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

const LINKS = [
  { href: "/dashboard",           label: "Dashboard" },
  { href: "/dashboard/budget",    label: "Budget" },
  { href: "/dashboard/goals",     label: "Goals" },
  { href: "/dashboard/learn",     label: "Investments" },
  { href: "/Educational_Modules", label: "Learn" },
  { href: "/dashboard/AIMentor",  label: "Chat" },
  { href: "/dashboard/profile",   label: "Profile" },
  { href: "/DarkMode",            label: "Theme" },
];

export default function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const [btnPos, setBtnPos]       = useState({ x: 0, y: 0 });
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Apply saved theme on mount */
  useEffect(() => {
    const savedTheme  = localStorage.getItem("fm-theme") ?? "dark";
    const savedAccent = localStorage.getItem("fm-accent");
    document.documentElement.setAttribute("data-theme", savedTheme === "light" ? "light" : "dark");
    if (savedAccent) {
      document.documentElement.style.setProperty("--em",  savedAccent);
      document.documentElement.style.setProperty("--em3", savedAccent + "20");
      document.documentElement.style.setProperty("--em2", savedAccent + "30");
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setBtnPos({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3 });
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "var(--nav-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--nav-border)" : "1px solid transparent",
        transition: "all 0.3s",
      }}>
        {/* Green top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--em), transparent)", opacity: scrolled ? 1 : 0, transition: "opacity 0.3s" }} />

        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--em3)", border: "1px solid var(--em2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--em-glow-sm)" }}>
              <TrendingUp size={18} color="var(--em)" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--nav-text)", letterSpacing: "-0.02em" }}>
              Budget<span style={{ color: "var(--em)" }}>2Broker</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="fm-nav-links">
            {LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link key={l.href} href={l.href} style={{
                  padding: "6px 14px", borderRadius: 8,
                  fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? "var(--em)" : "var(--nav-text2)",
                  background: active ? "var(--em3)" : "transparent",
                  border: active ? "1px solid var(--em2)" : "1px solid transparent",
                  textDecoration: "none", transition: "all 0.15s",
                  letterSpacing: active ? "0.01em" : "normal",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--nav-text)"; e.currentTarget.style.background = "var(--bg3)"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--nav-text2)"; e.currentTarget.style.background = "transparent"; } }}
                >{l.label}</Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Live dot */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }} className="fm-nav-live">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--em)", boxShadow: "0 0 8px var(--em)", animation: "pulse-em 2s infinite" }} />
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", fontWeight: 700, letterSpacing: "1px" }}>LIVE</span>
            </div>

            {/* Open App button — only when signed out */}
            <Show when="signed-out">
              <Link href="/sign-in" ref={btnRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setBtnPos({ x: 0, y: 0 })}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px",
                  background: "var(--em)", color: "#000",
                  borderRadius: 9, fontSize: 13, fontWeight: 700,
                  textDecoration: "none",
                  transform: `translate(${btnPos.x}px, ${btnPos.y}px)`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "var(--em-glow-sm)",
                }}
                className="fm-nav-cta"
              >
                <Zap size={13} strokeWidth={2.5} /> Sign In
              </Link>
            </Show>

            {/* User avatar + dropdown — only when signed in */}
            <Show when="signed-in">
              <Link href="/dashboard"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px",
                  background: "var(--em3)", color: "var(--em)",
                  borderRadius: 9, fontSize: 13, fontWeight: 700,
                  textDecoration: "none", border: "1px solid var(--em2)",
                }}
                className="fm-nav-cta"
              >
                <Zap size={13} strokeWidth={2.5} /> Dashboard
              </Link>
              <UserButton />
            </Show>

            {/* Mobile hamburger */}
            <button onClick={() => setMobile(o => !o)}
              style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 7, width: 36, height: 36, cursor: "pointer", color: "var(--nav-text2)", display: "none", alignItems: "center", justifyContent: "center" }}
              className="fm-nav-hamburger"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: "var(--nav-bg)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--nav-border)", padding: "12px 24px 20px" }}>
            {LINKS.map(l => {
              const active = pathname === l.href;
              return (
                <Link key={l.href} href={l.href} onClick={() => setMobile(false)}
                  style={{ display: "block", padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: active ? 600 : 400, color: active ? "var(--em)" : "var(--nav-text)", background: active ? "var(--em3)" : "transparent", textDecoration: "none", marginBottom: 4, transition: "all 0.15s" }}
                >{l.label}</Link>
              );
            })}
            <Link href="/dashboard" onClick={() => setMobile(false)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px", background: "var(--em)", color: "#000", borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: "none", marginTop: 8 }}
            >
              <Zap size={14} /> Open App
            </Link>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div style={{ height: 64 }} />

      <style>{`
        @media (max-width: 900px) { .fm-nav-links { display: none !important; } .fm-nav-live { display: none !important; } .fm-nav-cta { display: none !important; } .fm-nav-hamburger { display: flex !important; } }
        @keyframes pulse-em { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  );
}