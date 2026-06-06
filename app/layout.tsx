import "./globals.css";
import Navbar from "@/components/Navbar";
import MentorWidget from "@/components/MentorWidget";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "var(--bg)", color: "var(--text)" }}>
        <Navbar />
        <main style={{ minHeight: "100vh" }}>
            {children}
        </main>
        <MentorWidget />
      </body>
    </html>
  );
}

