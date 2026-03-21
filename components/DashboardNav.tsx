"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet, BarChart2, Cpu } from "lucide-react";

const dashboardStats = [
  { title: "Current Balance", value: "$1,240", icon: Wallet },
  { title: "Monthly Spending", value: "$520", icon: BarChart2 },
  { title: "AI Insights", value: "3 Tips Today", icon: Cpu },
];

export default function Dashboard() {
  return (
    <section className="px-6 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
      >
        <h1 className="text-4xl font-extrabold mb-2 md:mb-0">
          🌟 Welcome Back!
        </h1>
        <p className="text-gray-600 max-w-md">
          Here’s a quick snapshot of your finances, AI tips, and learning progress.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            whileHover={{
              scale: 1.08,
              y: -6,
              boxShadow: "0 20px 30px rgba(0,0,0,0.15)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-6 shadow-md flex items-center gap-4 cursor-pointer transition-all duration-300 hover:bg-indigo-50"
          >
            <stat.icon className="h-10 w-10 text-indigo-600" />
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Navigation Tiles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <Link
          href="/dashboard/budget"
          className="bg-gradient-to-tr from-indigo-400 to-indigo-600 text-white px-6 py-8 rounded-2xl text-center font-semibold shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300"
        >
          💰 Budget Tracker
        </Link>

        <Link
          href="/dashboard/learn"
          className="bg-gradient-to-tr from-purple-300 via-purple-200 to-purple-400 text-purple-900 px-6 py-8 rounded-2xl text-center font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
          🌱 Investment
        </Link>

        <Link
          href="/dashboard/ai"
          className="bg-gradient-to-tr from-yellow-200 via-yellow-100 to-yellow-300 text-yellow-900 px-6 py-8 rounded-2xl text-center font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-300"
        >
          🤖 Ask AI Mentor
        </Link>
      </motion.div>

      {/* AI Tip Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-indigo-50 rounded-2xl p-8 shadow-xl text-center relative overflow-hidden"
      >
        {/* Floating decor circles */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-200/50 rounded-full animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-purple-200/50 rounded-full animate-pulse" />

        <h2 className="text-2xl font-bold mb-4">💡 Today's AI Tip</h2>
        <p className="text-gray-700">
          Track your subscriptions this month — you might find $50+ in unused services! 💸
        </p>
      </motion.div>
    </section>
  );
}
