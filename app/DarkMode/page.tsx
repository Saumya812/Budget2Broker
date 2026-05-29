"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor, Check, Palette, Eye } from "lucide-react";

type Theme = "dark" | "light" | "system";

const ACCENTS = [
  { color: "#00FF88", label: "Emerald",  light: "#00A855" },
  { color: "#00CFFF", label: "Cyan",     light: "#0099CC" },
  { color: "#A855F7", label: "Purple",   light: "#7C3AED" },
  { color: "#FF6B35", label: "Orange",   light: "#E04E10" },
  { color: "#FFD600", label: "Gold",     light: "#B8860B" },
  { color: "#FF4488", label: "Pink",     light: "#CC1155" },
];

function applyTheme(theme: Theme, accentDark: string, accentLight: string) {
  const root       = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark     = theme === "dark" || (theme === "system" && prefersDark);

  root.setAttribute("data-theme", isDark ? "dark" : "light");

  /* Apply accent for the correct mode */
  const accent = isDark ? accentDark : accentLight;
  root.style.setProperty("--em",  accent);
  root.style.setProperty("--em2", accent + "AA");
  root.style.setProperty("--em3", accent + "20");
  root.style.setProperty("--em-glow-sm", `0 0 10px ${accent}66`);
}

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(var(--em3) 1px, transparent 1px), linear-gradient(90deg, var(--em3) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, var(--em3) 0%, transparent 70%)" }} />
    </div>
  );
}

export default function DarkModePage() {
  const [theme, setTheme]   = useState<Theme>("dark");
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    const savedTheme  = localStorage.getItem("fm-theme") as Theme | null;
    const savedAccentColor = localStorage.getItem("fm-accent");
    if (savedTheme) setTheme(savedTheme);
    if (savedAccentColor) {
      const found = ACCENTS.find(a => a.color === savedAccentColor || a.light === savedAccentColor);
      if (found) setAccent(found);
    }
  }, []);

  const handleThemeChange = (t: Theme) => {
    setTheme(t);
    applyTheme(t, accent.color, accent.light);
    localStorage.setItem("fm-theme", t);
  };

  const handleAccentChange = (a: typeof ACCENTS[0]) => {
    setAccent(a);
    applyTheme(theme, a.color, a.light);
    localStorage.setItem("fm-accent", a.color);
  };

  const handleSave = () => {
    localStorage.setItem("fm-theme", theme);
    localStorage.setItem("fm-accent", accent.color);
    applyTheme(theme, accent.color, accent.light);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const THEMES: { id: Theme; icon: React.ElementType; label: string; desc: string }[] = [
    { id: "dark",   icon: Moon,    label: "Dark Mode",  desc: "Easy on the eyes. The FinMentor default." },
    { id: "light",  icon: Sun,     label: "Light Mode", desc: "Clean and bright for daytime use." },
    { id: "system", icon: Monitor, label: "System",     desc: "Follows your device theme setting." },
  ];

  /* Current accent for preview */
  const isDark     = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const previewColor = isDark ? accent.color : accent.light;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative", transition: "background 0.3s" }}>
      <GridBg />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 6 }}>// SETTINGS</p>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
            Appearance <span style={{ color: "var(--em)" }}>& Theme</span>
          </h1>
          <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>Customize how FinMentor looks and feels.</p>
        </motion.div>

        {/* Theme selector */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "22px", marginBottom: 16, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Eye size={14} color="var(--em)" />
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px" }}>THEME MODE</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {THEMES.map((t, i) => (
              <motion.button key={t.id}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                onClick={() => handleThemeChange(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 12,
                  border: `1px solid ${theme === t.id ? "var(--em)" : "var(--border2)"}`,
                  background: theme === t.id ? "var(--em3)" : "var(--bg3)",
                  cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: theme === t.id ? "var(--em-glow-sm)" : "none",
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 10, background: theme === t.id ? "var(--em)" : "var(--surface2)", border: `1px solid ${theme === t.id ? "var(--em)" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  <t.icon size={18} color={theme === t.id ? "#000" : "var(--text3)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: theme === t.id ? "var(--em)" : "var(--text)", marginBottom: 2 }}>{t.label}</p>
                  <p style={{ fontSize: 12, color: "var(--text3)" }}>{t.desc}</p>
                </div>
                {theme === t.id && (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--em)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--em-glow-sm)" }}>
                    <Check size={12} color="#000" strokeWidth={3} />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Accent color */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "22px", marginBottom: 16, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${previewColor}, transparent)` }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Palette size={14} color={previewColor} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: previewColor, letterSpacing: "2px" }}>ACCENT COLOR</span>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {ACCENTS.map((a, i) => {
              const displayColor = isDark ? a.color : a.light;
              const isSelected   = accent.color === a.color;
              return (
                <motion.button key={a.color}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.05 }}
                  onClick={() => handleAccentChange(a)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: displayColor,
                    border: isSelected ? `3px solid var(--text)` : "3px solid transparent",
                    boxShadow: isSelected ? `0 0 20px ${displayColor}80` : `0 0 8px ${displayColor}40`,
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                  }}>
                    {isSelected && <Check size={18} color="#000" strokeWidth={3} />}
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: isSelected ? previewColor : "var(--text3)", letterSpacing: "0.5px", transition: "color 0.2s" }}>{a.label.toUpperCase()}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Live preview */}
          <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--bg3)", border: `1px solid ${previewColor}25`, borderRadius: 10 }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "1px", marginBottom: 10 }}>PREVIEW</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <button style={{ padding: "8px 18px", background: previewColor, color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "default", fontFamily: "'Space Grotesk', sans-serif", boxShadow: `0 0 16px ${previewColor}40` }}>Primary</button>
              <button style={{ padding: "8px 18px", background: "transparent", color: previewColor, border: `1px solid ${previewColor}50`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "default", fontFamily: "'Space Grotesk', sans-serif" }}>Ghost</button>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: previewColor, fontWeight: 700 }}>{accent.label}</span>
            </div>
          </div>
        </motion.div>

        {/* Save */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <button onClick={handleSave}
            style={{
              width: "100%", padding: "14px",
              background: saved ? "var(--em)" : "var(--em3)",
              border: "1px solid var(--em2)", borderRadius: 12,
              color: saved ? "#000" : "var(--em)",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
              boxShadow: saved ? "var(--em-glow-sm)" : "none",
            }}
          >
            {saved ? <><Check size={16} strokeWidth={3} /> Saved!</> : "Save Preferences"}
          </button>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", textAlign: "center", marginTop: 10, letterSpacing: "0.5px" }}>
            PREFERENCES SAVED TO YOUR BROWSER
          </p>
        </motion.div>
      </div>
    </div>
  );
}