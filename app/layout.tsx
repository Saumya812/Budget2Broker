import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MentorWidget from "@/components/MentorWidget";

export const metadata: Metadata = {
  title: "Budget2Broker — Your AI Financial Mentor",
  description: "Go from budgeting to investing with AI-powered guidance, real-time stock data, and personalized investment plans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">

      <html lang="en">
        <body style={{ margin: 0, padding: 0, background: "var(--bg)", color: "var(--text)" }}>
          <Navbar />
          <main style={{ minHeight: "100vh" }}>
            {children}
          </main>
          <MentorWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}

