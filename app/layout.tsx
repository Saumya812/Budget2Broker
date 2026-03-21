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
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>

        {/* AI Mentor Floating Widget */}
        <MentorWidget />
      </body>
    </html>
  );
}

