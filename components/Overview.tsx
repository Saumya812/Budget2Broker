"use client";

import { motion } from "framer-motion";
import { Brain, Wallet, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Money Mentor",
    description:
      "Ask questions, understand your spending habits, and get guidance tailored just for you — no finance jargon.",
  },
  {
    icon: Wallet,
    title: "Smart Budget Tracking",
    description:
      "Track income and expenses effortlessly with clean visuals and gentle alerts when you're overspending.",
  },
  {
    icon: TrendingUp,
    title: "Investment Readiness",
    description:
      "Learn the basics of investing, understand your risk comfort, and build confidence before you start.",
  },
];

export default function Overview() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-indigo-50">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">
          Your Personal Guide to Smarter Money
        </h2>
        <p className="text-gray-600 text-lg">
          Budget2Broker helps you understand your money, build better habits,
          and feel confident about financial decisions — one step at a time.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition"
          >
            <feature.icon className="h-10 w-10 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <h3 className="text-3xl font-semibold mb-10">
          How Budget2Broker Works
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            "Add your income & expenses",
            "Budget2Broker analyzes your habits",
            "Get insights & clear next steps",
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold mb-4">
                {i + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>

        {/* Trust Line */}
        <p className="text-sm text-gray-500 mt-12">
          Built for students & beginners • Privacy-first • No confusing jargon
        </p>
      </motion.div>
    </section>
  );
}
