import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "FinMentor AI",
  description: "AI-powered financial mentor for students and beginners",
};

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
      </body>
    </html>
  );
}
