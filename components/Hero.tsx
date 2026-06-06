"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { label: "Avg Monthly Savings", value: "$320+" },
  { label: "Student Friendly", value: "100%" },
  { label: "AI Guided Decisions", value: "24/7" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      {/* Animated Gradient Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-100 via-white to-purple-100"
      />

      {/* Floating Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-indigo-400/30 blur-3xl rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-purple-400/30 blur-3xl rounded-full -z-10 animate-pulse" />

      {/* Main Content */}
      <div className="max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
        >
          Built for students & beginners
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
        >
          Your Money.
          <br />
          <span className="text-indigo-600">Explained. Managed.</span>
          <br />
          Smarter with AI.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 max-w-3xl mx-auto mb-12"
        >
          Budget2Broker combines budgeting, investing education, and an AI mentor
          to help you make confident financial decisions — even if you’re just starting.
        </motion.p>

        {/* Stat Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.03 }}
              className="bg-white/70 backdrop-blur border rounded-xl px-6 py-4 shadow-sm"
            >
              <p className="text-xl font-bold text-indigo-600">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <Link
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-semibold transition shadow-lg"
          >
            Start Your Journey
          </Link>

          <Link
            href="/dashboard/budget"
            className="bg-white/70 backdrop-blur border hover:bg-white px-7 py-3 rounded-xl font-semibold transition"
          >
            Explore Demo
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
