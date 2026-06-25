"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthFetch } from "@/lib/use-auth-fetch";
import { motion } from "framer-motion";
import { User, Shield, DollarSign, Bell, ChevronRight, CheckCircle2, Zap, TrendingUp, Activity } from "lucide-react";

type Profile = {
  display_name:        string | null;
  risk_preference:     "conservative" | "moderate" | "aggressive" | null;
  monthly_income_goal: number | null;
  currency:            string | null;
};

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative", desc: "Steady & safe. Prioritize capital preservation.", color: "#00CFFF", icon: Shield },
  { value: "moderate",     label: "Moderate",     desc: "Balanced growth with manageable risk.",        color: "#A855F7", icon: Activity },
  { value: "aggressive",   label: "Aggressive",   desc: "Maximum growth. High risk, high reward.",      color: "#FF6B35", icon: TrendingUp },
];

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const authFetch = useAuthFetch();

  const [profile, setProfile] = useState<Profile>({ display_name: null, risk_preference: null, monthly_income_goal: null, currency: "USD" });
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    authFetch("/api/profile")
      .then(r => r.json())
      .then(d => { if (d.profile) setProfile(p => ({ ...p, ...d.profile })); });
  }, [isLoaded, user, authFetch]);

  const save = async () => {
    setSaving(true);
    try {
      const res  = await authFetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
      const data = await res.json();
      if (data.profile) { setProfile(p => ({ ...p, ...data.profile })); setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } finally { setSaving(false); }
  };

  if (!isLoaded) return null;

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 6 }}>// USER PROFILE</p>
          <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
            Your <span style={{ color: "var(--em)" }}>Profile</span>
          </h1>
        </motion.div>

        {/* Avatar card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 16, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="avatar" style={{ width: 72, height: 72, borderRadius: "50%", border: "2px solid var(--em2)", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--em3)", border: "2px solid var(--em2)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(0,255,136,0.2)" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: "var(--em)" }}>{initials}</span>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{profile.display_name || user?.fullName || "Anonymous"}</h2>
              <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>{user?.primaryEmailAddress?.emailAddress}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {memberSince && (
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 100, padding: "3px 10px" }}>
                    Member since {memberSince}
                  </span>
                )}
                {profile.risk_preference && (
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: RISK_OPTIONS.find(r => r.value === profile.risk_preference)?.color ?? "var(--em)", background: "var(--bg3)", border: `1px solid ${RISK_OPTIONS.find(r => r.value === profile.risk_preference)?.color ?? "var(--border)"}30`, borderRadius: 100, padding: "3px 10px" }}>
                    {profile.risk_preference} investor
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.15)", borderRadius: 10 }}>
              <Zap size={13} color="var(--em)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)", fontWeight: 700 }}>ACTIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Settings form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}
        >
          {/* Section: Personal */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={13} color="var(--em)" />
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)", letterSpacing: "1px", fontWeight: 700 }}>PERSONAL INFO</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="profile-form-grid">
              <div>
                <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>DISPLAY NAME</label>
                <input value={profile.display_name ?? ""} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))} placeholder={user?.fullName ?? "Your name"} style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>CURRENCY</label>
                <select value={profile.currency ?? "USD"} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))} style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", display: "block", marginBottom: 6, letterSpacing: "1px" }}>MONTHLY INCOME GOAL ($)</label>
                <input type="number" value={profile.monthly_income_goal ?? ""} onChange={e => setProfile(p => ({ ...p, monthly_income_goal: e.target.value ? parseFloat(e.target.value) : null }))} placeholder="e.g. 5000" style={{ width: "100%", padding: "10px 14px", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--text)", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
              </div>
            </div>
          </div>

          {/* Section: Risk preference */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={13} color="#A855F7" />
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#A855F7", letterSpacing: "1px", fontWeight: 700 }}>RISK PROFILE</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="risk-grid">
              {RISK_OPTIONS.map(opt => {
                const selected = profile.risk_preference === opt.value;
                return (
                  <button key={opt.value} onClick={() => setProfile(p => ({ ...p, risk_preference: opt.value as Profile["risk_preference"] }))}
                    style={{ padding: "16px", background: selected ? `${opt.color}10` : "var(--surface2)", border: `1px solid ${selected ? opt.color : "var(--border2)"}`, borderRadius: 12, textAlign: "left", cursor: "pointer", transition: "all 0.2s", boxShadow: selected ? `0 0 16px ${opt.color}20` : "none", position: "relative" }}
                  >
                    {selected && <div style={{ position: "absolute", top: 10, right: 10 }}><CheckCircle2 size={14} color={opt.color} /></div>}
                    <opt.icon size={20} color={selected ? opt.color : "var(--text3)"} style={{ marginBottom: 10 }} />
                    <p style={{ fontSize: 13, fontWeight: 700, color: selected ? opt.color : "var(--text)", marginBottom: 4 }}>{opt.label}</p>
                    <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", lineHeight: 1.4 }}>{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Account links */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(0,207,255,0.08)", border: "1px solid rgba(0,207,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={13} color="#00CFFF" />
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#00CFFF", letterSpacing: "1px", fontWeight: 700 }}>ACCOUNT</span>
            </div>
            {[
              { label: "Email address",      value: user?.primaryEmailAddress?.emailAddress ?? "—" },
              { label: "Account ID",         value: user?.id ? user.id.slice(0, 20) + "..." : "—" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>{row.label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>{row.value}</span>
              </div>
            ))}
            <a href="/dashboard/AIMentor" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", textDecoration: "none" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>AI Mentor</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)" }}>Open chat</span>
                <ChevronRight size={12} color="var(--em)" />
              </div>
            </a>
          </div>
        </motion.div>

        {/* Save button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
          {saved && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 8 }}>
              <CheckCircle2 size={13} color="var(--em)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)" }}>Saved!</span>
            </div>
          )}
          <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 28px", background: "var(--em)", color: "#000", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk', sans-serif", opacity: saving ? 0.7 : 1, boxShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
            <DollarSign size={15} />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 600px) { .profile-form-grid { grid-template-columns: 1fr !important; } .risk-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
