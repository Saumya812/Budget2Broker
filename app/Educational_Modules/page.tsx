"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, CheckCircle, Lock, ChevronRight, ChevronLeft,
  Trophy, BookOpen, TrendingUp, DollarSign, Home, BarChart2, X
} from "lucide-react";

/* ─── Types ─── */
type Lesson = {
  id: string;
  title: string;
  duration: string;
  content: string[];
  quiz: { question: string; options: string[]; answer: number };
};

type Module = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  accent: string;
  lessons: Lesson[];
};

/* ─── Data ─── */
const MODULES: Module[] = [
  {
    id: "budgeting",
    title: "Budgeting Basics",
    description: "Master your money with proven budgeting strategies",
    icon: DollarSign,
    color: "bg-emerald-50",
    accent: "text-emerald-600",
    lessons: [
      {
        id: "b1",
        title: "What is a Budget?",
        duration: "3 min",
        content: [
          "A budget is a plan for how you'll spend and save your money each month. Think of it as a roadmap for your finances.",
          "The most popular rule is the 50/30/20 rule: 50% of your income goes to needs (rent, food, bills), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment.",
          "Tracking your spending is the first step. Most people are surprised to see where their money actually goes versus where they think it goes.",
          "💡 Key Takeaway: A budget isn't about restricting yourself — it's about making intentional choices with your money so you can afford what matters most to you.",
        ],
        quiz: {
          question: "In the 50/30/20 rule, what percentage goes to savings?",
          options: ["10%", "20%", "30%", "50%"],
          answer: 1,
        },
      },
      {
        id: "b2",
        title: "Tracking Your Expenses",
        duration: "4 min",
        content: [
          "The first step to budgeting is knowing where your money goes. Most people underestimate their spending by 20-30%.",
          "Categorize your expenses into fixed (rent, loan payments) and variable (groceries, entertainment). Fixed costs are predictable; variable ones are where you have the most control.",
          "Use the FinMentor budget tracker to log every purchase for one month. You'll quickly spot patterns — like that daily coffee that costs $1,500/year.",
          "💡 Key Takeaway: You can't manage what you don't measure. Even two weeks of tracking will reveal powerful insights about your spending habits.",
        ],
        quiz: {
          question: "Which type of expense gives you the most control over your budget?",
          options: ["Fixed expenses", "Variable expenses", "One-time expenses", "Tax expenses"],
          answer: 1,
        },
      },
      {
        id: "b3",
        title: "Building an Emergency Fund",
        duration: "5 min",
        content: [
          "An emergency fund is money set aside for unexpected expenses — job loss, medical bills, car repairs. Without one, these events force you into debt.",
          "Financial experts recommend saving 3–6 months of living expenses. If your monthly expenses are $2,000, aim for $6,000–$12,000 in your emergency fund.",
          "Keep this money in a high-yield savings account — accessible but not so easy to spend that you'll dip into it for non-emergencies.",
          "💡 Key Takeaway: Start small. Even $500 in an emergency fund dramatically reduces financial stress and protects you from going into debt for small crises.",
        ],
        quiz: {
          question: "How many months of expenses should an emergency fund cover?",
          options: ["1 month", "2 months", "3–6 months", "12 months"],
          answer: 2,
        },
      },
    ],
  },
  {
    id: "stocks",
    title: "Stocks & Investing",
    description: "Learn how the stock market works and how to invest",
    icon: TrendingUp,
    color: "bg-blue-50",
    accent: "text-blue-600",
    lessons: [
      {
        id: "s1",
        title: "What is a Stock?",
        duration: "4 min",
        content: [
          "A stock represents a small ownership stake in a company. When you buy Apple stock, you literally own a tiny piece of Apple Inc.",
          "Companies sell stock to raise money for growth. When the company does well, the stock price rises — and your investment grows. When it does poorly, the price falls.",
          "The stock market is simply a marketplace where buyers and sellers trade these ownership stakes. Prices change every second based on supply and demand.",
          "💡 Key Takeaway: Buying stock means becoming a part-owner of a business. Your goal is to invest in companies you believe will grow over time.",
        ],
        quiz: {
          question: "What does owning a stock mean?",
          options: [
            "You lent money to a company",
            "You own a small piece of the company",
            "You work for the company",
            "You manage the company",
          ],
          answer: 1,
        },
      },
      {
        id: "s2",
        title: "Risk vs. Reward",
        duration: "5 min",
        content: [
          "All investments involve risk — the possibility of losing money. Stocks historically offer higher returns than savings accounts, but with more volatility.",
          "Over the last 100 years, the US stock market has returned about 10% per year on average. But in any single year, it can drop 30% or rise 40%.",
          "Diversification is your best protection against risk. By spreading investments across many companies and industries, one bad investment won't sink your portfolio.",
          "💡 Key Takeaway: Higher potential returns always come with higher risk. The key is matching your investment risk level to your timeline and comfort level.",
        ],
        quiz: {
          question: "What is the best protection against investment risk?",
          options: ["Buying only safe stocks", "Diversification", "Selling when prices drop", "Only investing in bonds"],
          answer: 1,
        },
      },
      {
        id: "s3",
        title: "Index Funds for Beginners",
        duration: "5 min",
        content: [
          "An index fund automatically invests in hundreds or thousands of companies at once. The S&P 500 index fund, for example, holds stock in the 500 largest US companies.",
          "Index funds are perfect for beginners because they're diversified by default, have very low fees, and historically outperform most actively managed funds.",
          "Warren Buffett himself recommends low-cost index funds for most investors. His advice: invest regularly, don't try to time the market, and think long-term.",
          "💡 Key Takeaway: You don't need to pick individual stocks to invest successfully. A simple S&P 500 index fund is one of the best long-term investments available.",
        ],
        quiz: {
          question: "What is an index fund?",
          options: [
            "A fund managed by experts who pick stocks",
            "A fund that automatically invests in many companies at once",
            "A type of savings account",
            "A government bond",
          ],
          answer: 1,
        },
      },
    ],
  },
  {
    id: "bonds",
    title: "Bonds & Fixed Income",
    description: "Understand stable, lower-risk investments",
    icon: BarChart2,
    color: "bg-purple-50",
    accent: "text-purple-600",
    lessons: [
      {
        id: "bo1",
        title: "What is a Bond?",
        duration: "4 min",
        content: [
          "A bond is essentially a loan you make to a government or company. They promise to pay you back with interest over a set period of time.",
          "When the US government needs money, it sells Treasury bonds. When Apple needs money for expansion, it might sell corporate bonds. You're the lender.",
          "Bonds are generally safer than stocks because you know exactly how much you'll earn. However, this also means lower potential returns.",
          "💡 Key Takeaway: Bonds are IOUs. You lend money, earn predictable interest, and get your money back at the end. They're the 'safe' part of most portfolios.",
        ],
        quiz: {
          question: "When you buy a bond, you are:",
          options: [
            "Buying ownership in a company",
            "Lending money to a government or company",
            "Opening a savings account",
            "Buying real estate",
          ],
          answer: 1,
        },
      },
      {
        id: "bo2",
        title: "Types of Bonds",
        duration: "4 min",
        content: [
          "Government bonds (like US Treasuries) are the safest — backed by the full faith of the government. They offer lower returns but near-zero risk of default.",
          "Corporate bonds are issued by companies. They pay higher interest than government bonds, but carry more risk — if the company goes bankrupt, you might not get paid back.",
          "Municipal bonds are issued by states and cities, often to fund schools or infrastructure. They have a unique tax advantage — the interest is often tax-free.",
          "💡 Key Takeaway: Choose bonds based on your risk tolerance. Government bonds = safety. Corporate bonds = higher returns with more risk. Municipal bonds = tax advantages.",
        ],
        quiz: {
          question: "Which type of bond is generally considered the safest?",
          options: ["Corporate bonds", "Municipal bonds", "Government bonds", "Junk bonds"],
          answer: 2,
        },
      },
    ],
  },
  {
    id: "mutual-funds",
    title: "Mutual Funds & ETFs",
    description: "Pool your money for instant diversification",
    icon: BookOpen,
    color: "bg-orange-50",
    accent: "text-orange-600",
    lessons: [
      {
        id: "m1",
        title: "Mutual Funds Explained",
        duration: "4 min",
        content: [
          "A mutual fund pools money from thousands of investors to buy a diversified portfolio of stocks, bonds, or other assets managed by professional fund managers.",
          "When you invest $500 in a mutual fund, that $500 gets spread across potentially hundreds of different investments — giving you instant diversification.",
          "Mutual funds charge a fee called an expense ratio (usually 0.5%–1.5% per year). This pays the fund managers. Lower fees = more money staying in your pocket.",
          "💡 Key Takeaway: Mutual funds make diversification easy and affordable. They're great for beginners who want professional management without picking individual stocks.",
        ],
        quiz: {
          question: "What is an expense ratio in a mutual fund?",
          options: [
            "The fund's annual profit",
            "The annual fee charged by the fund",
            "The percentage of stocks vs bonds",
            "The fund's minimum investment",
          ],
          answer: 1,
        },
      },
      {
        id: "m2",
        title: "ETFs vs Mutual Funds",
        duration: "5 min",
        content: [
          "ETFs (Exchange-Traded Funds) are similar to mutual funds but trade on the stock market like individual stocks. You can buy and sell them throughout the day.",
          "ETFs typically have lower fees than mutual funds because most are passively managed — they just track an index rather than having managers actively picking stocks.",
          "For most beginners, ETFs are the better choice due to lower costs, tax efficiency, and flexibility. Popular ETFs like VOO (Vanguard S&P 500) have expense ratios as low as 0.03%.",
          "💡 Key Takeaway: ETFs are often cheaper and more flexible than mutual funds. Both are great for diversification — ETFs just give you more control and lower costs.",
        ],
        quiz: {
          question: "What is a key advantage of ETFs over traditional mutual funds?",
          options: [
            "They always have higher returns",
            "They are government guaranteed",
            "They typically have lower fees and trade like stocks",
            "They are only available to wealthy investors",
          ],
          answer: 2,
        },
      },
    ],
  },
  {
    id: "real-estate",
    title: "Real Estate Investing",
    description: "Build wealth through property investments",
    icon: Home,
    color: "bg-rose-50",
    accent: "text-rose-600",
    lessons: [
      {
        id: "r1",
        title: "Real Estate Basics",
        duration: "5 min",
        content: [
          "Real estate investing means buying property to generate income or profit. This can be through rental income, property appreciation, or both.",
          "Unlike stocks, real estate is a tangible asset — something you can see and touch. Many investors like the psychological comfort of owning a physical asset.",
          "Real estate has historically appreciated about 3–4% per year, but rental properties can generate 6–10% annual returns through rent income on top of appreciation.",
          "💡 Key Takeaway: Real estate builds wealth through two streams — monthly rental income and long-term appreciation. It requires more capital but offers unique advantages.",
        ],
        quiz: {
          question: "What are the two main ways real estate generates returns?",
          options: [
            "Dividends and stock growth",
            "Rental income and property appreciation",
            "Interest and bond payments",
            "Tax refunds and government grants",
          ],
          answer: 1,
        },
      },
      {
        id: "r2",
        title: "REITs — Real Estate Without the Hassle",
        duration: "4 min",
        content: [
          "A REIT (Real Estate Investment Trust) lets you invest in real estate without buying physical property. REITs own and operate income-producing real estate like apartments, offices, and shopping centers.",
          "REITs trade on the stock market like regular stocks, so you can invest with as little as $10. They're required by law to pay at least 90% of their income as dividends to investors.",
          "This makes REITs one of the best ways for beginners to get real estate exposure. You get the benefits of real estate (steady income, appreciation) without being a landlord.",
          "💡 Key Takeaway: REITs are the easiest way to invest in real estate. Buy them like stocks, collect dividends like rent, without ever managing a property.",
        ],
        quiz: {
          question: "What percentage of income are REITs required to pay as dividends?",
          options: ["50%", "75%", "90%", "100%"],
          answer: 2,
        },
      },
    ],
  },
];

/* ─── Progress helpers ─── */
function loadProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem("eduProgress") ?? "{}"); } catch { return {}; }
}
function saveProgress(p: Record<string, boolean>) {
  localStorage.setItem("eduProgress", JSON.stringify(p));
}

/* ─── Lesson Modal ─── */
function LessonModal({
  lesson, moduleAccent, onClose, onComplete,
}: {
  lesson: Lesson;
  moduleAccent: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [step, setStep]           = useState<"content" | "quiz" | "done">("content");
  const [selected, setSelected]   = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const submitQuiz = () => {
    if (selected === null) return;
    const correct = selected === lesson.quiz.answer;
    setIsCorrect(correct);
    if (correct) setTimeout(() => { setStep("done"); onComplete(); }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{lesson.duration} read</p>
            <h3 className="font-bold text-gray-900">{lesson.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {["content", "quiz", "done"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? "bg-indigo-600 text-white" :
                  (step === "quiz" && i === 0) || step === "done" ? "bg-green-500 text-white" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {((step === "quiz" && i === 0) || step === "done") && i < 2 ? "✓" : i + 1}
                </div>
                {i < 2 && <div className={`h-0.5 w-8 ${step !== "content" && i === 0 ? "bg-green-500" : step === "done" && i === 1 ? "bg-green-500" : "bg-gray-100"}`} />}
              </div>
            ))}
            <span className="text-xs text-gray-400 ml-1">
              {step === "content" ? "Reading" : step === "quiz" ? "Quiz" : "Complete!"}
            </span>
          </div>

          {/* Content */}
          {step === "content" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="space-y-4 mb-8">
                {lesson.content.map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`text-sm leading-relaxed ${para.startsWith("💡") ? "bg-indigo-50 rounded-xl p-4 text-indigo-800 font-medium" : "text-gray-700"}`}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
              <button
                onClick={() => setStep("quiz")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                Take the Quiz <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Quiz */}
          {step === "quiz" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-semibold text-gray-800 mb-4">{lesson.quiz.question}</p>
              <div className="space-y-2 mb-6">
                {lesson.quiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelected(i); setIsCorrect(null); }}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                      selected === i
                        ? isCorrect === true ? "border-green-500 bg-green-50 text-green-800"
                        : isCorrect === false ? "border-red-400 bg-red-50 text-red-800"
                        : "border-indigo-400 bg-indigo-50 text-indigo-800"
                        : "border-gray-100 hover:border-indigo-200 text-gray-700"
                    }`}
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
              {isCorrect === false && (
                <p className="text-red-500 text-sm mb-3">Not quite — try again!</p>
              )}
              <button
                onClick={submitQuiz}
                disabled={selected === null}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Submit Answer
              </button>
              <button onClick={() => setStep("content")} className="w-full mt-2 text-gray-500 text-sm py-2 hover:text-gray-700">
                <ChevronLeft size={14} className="inline mr-1" /> Back to lesson
              </button>
            </motion.div>
          )}

          {/* Done */}
          {step === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={28} className="text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Lesson Complete!</h4>
              <p className="text-gray-500 text-sm mb-6">Great work! You answered correctly and completed this lesson.</p>
              <button
                onClick={onClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                Continue Learning
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function EducationalModulesPage() {
  const [progress, setProgress]         = useState<Record<string, boolean>>({});
  const [activeModule, setActiveModule] = useState<string>(MODULES[0].id);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeMeta, setActiveMeta]     = useState<{ accent: string } | null>(null);

  useEffect(() => { setProgress(loadProgress()); }, []);

  const completeLesson = (lessonId: string) => {
    const next = { ...progress, [lessonId]: true };
    setProgress(next);
    saveProgress(next);
  };

  const totalLessons    = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount  = Object.values(progress).filter(Boolean).length;
  const overallPct      = Math.round((completedCount / totalLessons) * 100);

  const currentModule   = MODULES.find(m => m.id === activeModule) ?? MODULES[0];
  const moduleCompleted = currentModule.lessons.filter(l => progress[l.id]).length;
  const modulePct       = Math.round((moduleCompleted / currentModule.lessons.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-1">📚 Educational Modules</h1>
          <p className="text-gray-500">Learn finance and investing at your own pace</p>
        </motion.div>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              <span className="font-semibold text-gray-800">Overall Progress</span>
            </div>
            <span className="text-sm font-bold text-indigo-600">{completedCount}/{totalLessons} lessons</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-indigo-600 h-2.5 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{overallPct}% complete</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Module sidebar */}
          <div className="lg:col-span-1 space-y-2">
            {MODULES.map((mod, i) => {
              const done = mod.lessons.filter(l => progress[l.id]).length;
              const pct  = Math.round((done / mod.lessons.length) * 100);
              const Icon = mod.icon;
              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setActiveModule(mod.id)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                    activeModule === mod.id
                      ? "border-indigo-400 bg-white shadow-md"
                      : "border-transparent bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 ${mod.color} rounded-lg flex items-center justify-center`}>
                      <Icon size={16} className={mod.accent} />
                    </div>
                    <span className="font-semibold text-sm text-gray-800 leading-tight">{mod.title}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{done}/{mod.lessons.length} lessons</p>
                </motion.button>
              );
            })}
          </div>

          {/* Lessons panel */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {/* Module header */}
                <div className={`${currentModule.color} rounded-2xl p-6 mb-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className={`text-xl font-bold ${currentModule.accent}`}>{currentModule.title}</h2>
                    <span className={`text-sm font-semibold ${currentModule.accent}`}>{modulePct}%</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{currentModule.description}</p>
                  <div className="w-full bg-white/60 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${modulePct}%` }}
                      transition={{ duration: 0.6 }}
                      className="bg-indigo-500 h-2 rounded-full"
                    />
                  </div>
                </div>

                {/* Lessons list */}
                <div className="space-y-3">
                  {currentModule.lessons.map((lesson, i) => {
                    const done     = progress[lesson.id];
                    const unlocked = i === 0 || progress[currentModule.lessons[i - 1]?.id];

                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => {
                          if (!unlocked) return;
                          setActiveLesson(lesson);
                          setActiveMeta({ accent: currentModule.accent });
                        }}
                        className={`bg-white rounded-2xl p-5 border-2 transition-all ${
                          done ? "border-green-200"
                          : unlocked ? "border-gray-100 hover:border-indigo-200 cursor-pointer hover:shadow-md"
                          : "border-gray-100 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            done ? "bg-green-100" : unlocked ? "bg-indigo-100" : "bg-gray-100"
                          }`}>
                            {done ? (
                              <CheckCircle size={20} className="text-green-600" />
                            ) : unlocked ? (
                              <Play size={18} className="text-indigo-600 ml-0.5" />
                            ) : (
                              <Lock size={16} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className={`font-semibold text-sm ${done ? "text-green-700" : unlocked ? "text-gray-800" : "text-gray-400"}`}>
                                {lesson.title}
                              </h3>
                              <span className="text-xs text-gray-400">{lesson.duration}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {done ? "Completed ✓" : unlocked ? "Click to start" : "Complete previous lesson to unlock"}
                            </p>
                          </div>
                          {unlocked && !done && (
                            <ChevronRight size={16} className="text-gray-300 shrink-0" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Module complete banner */}
                {modulePct === 100 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center"
                  >
                    <Trophy size={24} className="text-yellow-500 mx-auto mb-2" />
                    <p className="font-bold text-green-800">Module Complete! 🎉</p>
                    <p className="text-green-600 text-sm mt-1">You've mastered {currentModule.title}. Move on to the next module!</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Lesson modal */}
      <AnimatePresence>
        {activeLesson && activeMeta && (
          <LessonModal
            lesson={activeLesson}
            moduleAccent={activeMeta.accent}
            onClose={() => setActiveLesson(null)}
            onComplete={() => completeLesson(activeLesson.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}