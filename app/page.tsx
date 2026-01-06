import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <section className="text-center mt-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold mb-6"
      >
        Learn Money. Understand Investing.
        <span className="text-indigo-600"> With AI.</span>
      </motion.h1>

      <p className="text-gray-600 max-w-2xl mx-auto mb-8">
        A personalized AI mentor that helps students and beginners understand
        stocks, index funds, and financial decisions using real-time data.
      </p>

      <Link
        href="/dashboard"
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium"
      >
        Get Started
      </Link>
    </section>
  );
}
