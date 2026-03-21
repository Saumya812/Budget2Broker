"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Shield, Zap, BookOpen, BarChart2, Bot, ChevronRight } from "lucide-react";

/* ── Particle canvas ── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let mouse = { x: W / 2, y: H / 2 };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const onMouse = (e: MouseEvent) => { mouse = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.vx += (dx / dist) * 0.04;
          p.vy += (dy / dist) * 0.04;
        }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,136,${p.alpha})`;
        ctx.fill();
      });

      // Connect nearby particles
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0,
      pointerEvents: "none",
    }} />
  );
}

/* ── Grid background ── */
function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
      }} />
      <div style={{
        position: "absolute", top: "15%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 900, height: 900, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,255,136,0.07) 0%, transparent 65%)",
      }} />
      <div style={{
        position: "absolute", top: "70%", left: "80%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,160,255,0.04) 0%, transparent 65%)",
      }} />
      {/* Scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(0,255,136,0.2), transparent)",
        animation: "scan 10s linear infinite", top: 0,
      }} />
    </div>
  );
}

/* ── Ticker ── */
const TICKERS = [
  { s: "AAPL", v: "+1.24%", up: true },  { s: "TSLA", v: "-0.87%", up: false },
  { s: "NVDA", v: "+3.41%", up: true },  { s: "MSFT", v: "+0.62%", up: true },
  { s: "AMZN", v: "-0.14%", up: false }, { s: "GOOGL", v: "+2.03%", up: true },
  { s: "BTC",  v: "+4.17%", up: true },  { s: "ETH",   v: "-1.22%", up: false },
  { s: "SPY",  v: "+0.88%", up: true },  { s: "META",  v: "+1.55%", up: true },
];

function TickerBar() {
  const items = [...TICKERS, ...TICKERS, ...TICKERS];
  return (
    <div style={{
      background: "var(--bg2)", borderBottom: "1px solid var(--border)",
      overflow: "hidden", height: 36, display: "flex", alignItems: "center",
      position: "relative", zIndex: 10,
    }}>
      <div style={{ display: "flex", animation: "tickerScroll 35s linear infinite", whiteSpace: "nowrap" }}>
        {items.map((t, i) => (
          <span key={i} style={{
            padding: "0 20px", fontSize: 11,
            fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "0.5px",
            color: t.up ? "var(--em)" : "var(--red)",
            borderRight: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ color: "var(--text2)" }}>{t.s}</span>
            {t.v}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }
      `}</style>
    </div>
  );
}

/* ── Animated counter ── */
function Counter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let cur = 0;
      const step = target / 60;
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        setVal(Math.round(cur));
        if (cur >= target) clearInterval(t);
      }, 16);
      obs.disconnect();
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ── Magnetic button ── */
function MagneticBtn({ children, href, className, style }: {
  children: React.ReactNode; href: string; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.04)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0,0) scale(1)";
  }, []);
  return (
    <Link ref={ref} href={href} className={className} style={{ ...style, transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1), background 0.2s, box-shadow 0.2s" }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </Link>
  );
}

/* ── Glowing feature card ── */
const features = [
  { icon: BarChart2, label: "Live Stock Tracker",  desc: "Real-time prices, AI chart explanations, $10K simulated portfolio.", color: "#00FF88", href: "/dashboard/learn/stock" },
  { icon: Shield,    label: "Smart Budgeting",     desc: "Track every dollar. Visual breakdowns. Zero jargon.", color: "#00CFFF", href: "/dashboard/budget" },
  { icon: Bot,       label: "AI Mentor 24/7",      desc: "Your personal financial advisor reads your budget and gives real advice.", color: "#A855F7", href: "/dashboard/AIMentor" },
  { icon: BookOpen,  label: "14 Free Lessons",     desc: "Stocks, bonds, ETFs, real estate. Learn with quizzes.", color: "#FF6B35", href: "/Educational_Modules" },
  { icon: TrendingUp,label: "Invest Simulator",    desc: "Practice with real market data before risking a single real dollar.", color: "#00FF88", href: "/dashboard/learn/stock" },
  { icon: Zap,       label: "AI Chart Explain",    desc: "Click any chart. Claude explains it in plain English instantly.", color: "#FFD600", href: "/dashboard/learn/stock" },
];

function FeatureCard({ f, i }: { f: typeof features[0]; i: number }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <Link href={f.href} style={{ textDecoration: "none" }}>
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "var(--surface2)" : "var(--surface)",
          border: `1px solid ${hovered ? f.color + "40" : "var(--border)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "28px 24px",
          cursor: "pointer",
          transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
          position: "relative",
          overflow: "hidden",
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          boxShadow: hovered ? `0 12px 40px ${f.color}20, 0 0 0 1px ${f.color}20` : "none",
          animationDelay: `${i * 0.08}s`,
        }}
      >
        {/* Mouse follow glow */}
        {hovered && (
          <div style={{
            position: "absolute", pointerEvents: "none",
            width: 200, height: 200, borderRadius: "50%",
            background: `radial-gradient(circle, ${f.color}15 0%, transparent 70%)`,
            left: pos.x - 100, top: pos.y - 100,
            transition: "left 0.05s, top 0.05s",
          }} />
        )}
        {/* Top border glow */}
        {hovered && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
          }} />
        )}

        <div style={{
          width: 46, height: 46,
          background: hovered ? f.color + "20" : f.color + "10",
          border: `1px solid ${f.color}${hovered ? "50" : "20"}`,
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
          boxShadow: hovered ? `0 0 20px ${f.color}40, 0 0 40px ${f.color}20` : "none",
          transition: "all 0.25s",
        }}>
          <f.icon size={20} color={f.color} strokeWidth={1.5} />
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 8, transition: "color 0.2s" }}>
          {f.label}
        </h3>
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{f.desc}</p>

        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          marginTop: 16,
          color: f.color,
          fontSize: 12, fontWeight: 600,
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-8px)",
          transition: "all 0.2s",
        }}>
          Open <ChevronRight size={12} />
        </div>
      </div>
    </Link>
  );
}

/* ── Floating stat card ── */
function StatCard({ label, target, prefix, suffix, delay }: { label: string; target: number; prefix?: string; suffix?: string; delay: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, padding: "20px 24px", textAlign: "center",
        cursor: "default",
        transition: "all 0.3s",
        background: hov ? "rgba(0,255,136,0.05)" : "transparent",
        animation: `fadeUp 0.6s ease ${delay}s both`,
      }}
    >
      <p style={{
        fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700,
        color: "var(--em)", lineHeight: 1, marginBottom: 6,
        textShadow: hov ? "0 0 30px rgba(0,255,136,0.8)" : "0 0 20px rgba(0,255,136,0.3)",
        transition: "text-shadow 0.3s",
      }}>
        <Counter target={target} prefix={prefix} suffix={suffix} />
      </p>
      <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

/* ── Glitch text effect ── */
function GlitchText({ text }: { text: string }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span style={{
      color: "var(--em)",
      textShadow: glitch
        ? "2px 0 #ff0044, -2px 0 #00ffff, 0 0 40px rgba(0,255,136,0.6)"
        : "0 0 40px rgba(0,255,136,0.4)",
      transition: "text-shadow 0.1s",
      display: "inline-block",
      transform: glitch ? `translate(${Math.random() * 4 - 2}px, 0)` : "translate(0,0)",
    }}>
      {text}
    </span>
  );
}

/* ── Main ── */
export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <ParticleField />
      <TickerBar />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", zIndex: 1,
        maxWidth: 1200, margin: "0 auto",
        padding: "100px 24px 80px",
        textAlign: "center",
      }}>
        {/* Badge */}
        <div style={{ marginBottom: 28, animation: "fadeUp 0.5s ease both" }}>
          <span className="tag-em">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--em)", display: "inline-block", animation: "pulse-em 2s infinite" }} />
            LIVE MARKET DATA · AI-POWERED · FREE FOREVER
          </span>
        </div>

        {/* Headline with glitch */}
        <h1 style={{
          fontSize: "clamp(52px, 8vw, 96px)",
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          marginBottom: 24,
          animation: "fadeUp 0.6s ease 0.1s both",
        }}>
          Your money,<br />
          <GlitchText text="amplified." />
        </h1>

        <p style={{
          fontSize: 18,
          color: "var(--text2)",
          maxWidth: 540,
          margin: "0 auto 48px",
          lineHeight: 1.8,
          fontWeight: 400,
          animation: "fadeUp 0.6s ease 0.2s both",
        }}>
          The only finance platform built for beginners that treats you like
          a serious investor. Live stocks, AI budgeting, guided lessons — zero cost.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap",
          marginBottom: 80,
          animation: "fadeUp 0.6s ease 0.3s both",
        }}>
          <MagneticBtn href="/dashboard" className="btn-em" style={{ fontSize: 15, padding: "15px 36px" }}>
            Start free <ArrowRight size={16} />
          </MagneticBtn>
          <MagneticBtn href="/Educational_Modules" className="btn-ghost" style={{ fontSize: 15, padding: "15px 36px" }}>
            Browse lessons
          </MagneticBtn>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "inline-grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          animation: "fadeUp 0.6s ease 0.4s both",
          boxShadow: "0 0 60px rgba(0,255,136,0.06), inset 0 1px 0 rgba(0,255,136,0.1)",
          width: "min(600px, 100%)",
        }}>
          <StatCard label="Avg savings/mo"  target={320} prefix="$" suffix="+" delay={0.5} />
          <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
          <StatCard label="Free lessons"    target={14}  delay={0.55} />
          <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
          <StatCard label="Asset classes"   target={4}   delay={0.6} />
          <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch" }} />
          <StatCard label="AI uptime"       target={100} suffix="%" delay={0.65} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "2px", color: "var(--em)", marginBottom: 16, textTransform: "uppercase" }}>
            // CAPABILITIES
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>
            Everything you need.<br />
            <span style={{ color: "var(--text3)", fontWeight: 400, fontSize: "0.8em" }}>Nothing you don't.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
          {features.map((f, i) => <FeatureCard key={i} f={f} i={i} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "2px", color: "var(--em)", marginBottom: 16, textTransform: "uppercase" }}>
            // PROTOCOL
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, color: "var(--text)" }}>
            Four steps to financial clarity
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { n: "01", title: "Track budget",     desc: "Add income and expenses. See your real spending patterns.", color: "#00FF88" },
            { n: "02", title: "Learn basics",      desc: "Bite-sized lessons on stocks, bonds, ETFs, real estate.", color: "#00CFFF" },
            { n: "03", title: "Practice investing",desc: "Trade real stocks with $10K virtual cash. Zero risk.", color: "#A855F7" },
            { n: "04", title: "Ask AI mentor",     desc: "Personalized advice based on your actual budget.", color: "#FF6B35" },
          ].map((s, i) => {
            const [hov, setHov] = useState(false);
            return (
              <div key={i}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${hov ? s.color + "40" : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "28px 24px",
                  cursor: "default",
                  transition: "all 0.25s",
                  transform: hov ? "translateY(-4px)" : "none",
                  boxShadow: hov ? `0 8px 32px ${s.color}15` : "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {hov && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />}
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 48, fontWeight: 700,
                  color: s.color, opacity: hov ? 0.2 : 0.08,
                  lineHeight: 1, marginBottom: -8,
                  transition: "opacity 0.2s",
                }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--em2)",
          borderRadius: "var(--radius-xl)",
          padding: "72px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(0,255,136,0.08), 0 0 0 1px rgba(0,255,136,0.1)",
        }}>
          {/* Animated background glow */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600, height: 300, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,255,136,0.06) 0%, transparent 70%)",
            animation: "pulse-em 4s ease-in-out infinite",
          }} />
          {/* Corner brackets */}
          {[
            { top: 0, left: 0, borderTop: true, borderLeft: true },
            { top: 0, right: 0, borderTop: true, borderRight: true },
            { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
            { bottom: 0, right: 0, borderBottom: true, borderRight: true },
          ].map((c, i) => (
            <div key={i} style={{
              position: "absolute",
              top: c.top ?? "auto", bottom: c.bottom ?? "auto",
              left: c.left ?? "auto", right: c.right ?? "auto",
              width: 48, height: 48,
              borderTop: c.borderTop ? "2px solid var(--em)" : "none",
              borderBottom: c.borderBottom ? "2px solid var(--em)" : "none",
              borderLeft: c.borderLeft ? "2px solid var(--em)" : "none",
              borderRight: c.borderRight ? "2px solid var(--em)" : "none",
              borderRadius: i === 0 ? "var(--radius-xl) 0 0 0" : i === 1 ? "0 var(--radius-xl) 0 0" : i === 2 ? "0 0 0 var(--radius-xl)" : "0 0 var(--radius-xl) 0",
            }} />
          ))}

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <span className="tag-em">ZERO COST · FOREVER FREE · NO CREDIT CARD</span>
            </div>
            <h2 style={{
              fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700,
              color: "var(--text)", marginBottom: 16, lineHeight: 1.05,
            }}>
              Your financial future<br />
              <GlitchText text="starts now." />
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 16, marginBottom: 40 }}>
              No jargon. No gatekeeping. No excuses.
            </p>
            <MagneticBtn href="/dashboard" className="btn-em" style={{ fontSize: 16, padding: "16px 48px" }}>
              Launch FinMentor <ArrowRight size={18} />
            </MagneticBtn>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scan { 0% { top: -1px; } 100% { top: 100vh; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-em { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}