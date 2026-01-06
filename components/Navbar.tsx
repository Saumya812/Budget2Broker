"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          FinMentor AI
        </Link>
        <div className="flex gap-6 text-sm font-medium">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/learn/stocks">Stocks</Link>
          <Link href="/learn/index-funds">Index Funds</Link>
          <Link href="/mentor">AI Mentor</Link>
        </div>
      </div>
    </nav>
  );
}
