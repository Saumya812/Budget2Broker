"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "var(--bg)",
      padding: "24px",
    }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 8 }}>// GET STARTED</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Join <span style={{ color: "var(--em)" }}>Budget2Broker</span>
        </h1>
      </div>
      <SignUp />
    </div>
  );
}
