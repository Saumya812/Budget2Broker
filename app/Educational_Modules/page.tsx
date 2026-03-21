"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Lock, ChevronRight, ChevronLeft,
  Trophy, BookOpen, TrendingUp, DollarSign, Home,
  BarChart2, X, Zap, Star, Search, StickyNote,
  Award, Filter, FileText,
} from "lucide-react";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type Lesson = {
  id: string; title: string; duration: string; difficulty: Difficulty;
  content: string[];
  quiz: { question: string; options: string[]; answer: number };
};
type Module = {
  id: string; title: string; description: string;
  icon: React.ElementType; color: string;
  difficulty: Difficulty; estimatedTime: string;
  lessons: Lesson[];
};

const DIFF_COLORS: Record<Difficulty, string> = {
  Beginner: "#00FF88", Intermediate: "#FFD600", Advanced: "#FF6B35",
};

const MODULES: Module[] = [
  {
    id: "budgeting", title: "Budgeting Basics", color: "#00FF88",
    description: "Master your money with proven budgeting strategies",
    icon: DollarSign, difficulty: "Beginner", estimatedTime: "25 min",
    lessons: [
      {
        id: "b1", title: "What is a Budget?", duration: "3 min", difficulty: "Beginner",
        content: [
          "A budget is a plan for how you will spend and save your money each month. Think of it as a financial roadmap that helps you reach your goals.",
          "The most popular rule is the 50/30/20 rule: 50% of your income goes to needs (rent, food, bills), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment.",
          "Tracking your spending is the first step. Most people are surprised to see where their money actually goes versus where they think it goes.",
          "💡 KEY INSIGHT: A budget is not about restricting yourself — it is about making intentional choices so you can afford what matters most to you.",
        ],
        quiz: { question: "In the 50/30/20 rule, what percentage goes to savings?", options: ["10%", "20%", "30%", "50%"], answer: 1 },
      },
      {
        id: "b2", title: "Tracking Your Expenses", duration: "4 min", difficulty: "Beginner",
        content: [
          "The first step to budgeting is knowing where your money goes. Most people underestimate their spending by 20-30%.",
          "Categorize expenses into fixed (rent, loan payments) and variable (groceries, entertainment). Fixed costs are predictable; variable ones are where you have the most control.",
          "Use the FinMentor budget tracker to log every purchase for one month. You will quickly spot patterns — like a daily coffee that costs $1,500 per year.",
          "💡 KEY INSIGHT: You cannot manage what you do not measure. Even two weeks of tracking will reveal powerful insights about your habits.",
        ],
        quiz: { question: "Which type of expense gives you the most control?", options: ["Fixed expenses", "Variable expenses", "One-time expenses", "Tax expenses"], answer: 1 },
      },
      {
        id: "b3", title: "Building an Emergency Fund", duration: "5 min", difficulty: "Beginner",
        content: [
          "An emergency fund is money set aside for unexpected expenses — job loss, medical bills, car repairs. Without one, these events force you into debt.",
          "Financial experts recommend saving 3-6 months of living expenses. If your monthly expenses are $2,000, aim for $6,000-$12,000 in your emergency fund.",
          "Keep this money in a high-yield savings account — accessible but not so easy to spend that you will dip into it for non-emergencies.",
          "💡 KEY INSIGHT: Start small. Even $500 in an emergency fund dramatically reduces financial stress and protects you from going into debt for small crises.",
        ],
        quiz: { question: "How many months of expenses should an emergency fund cover?", options: ["1 month", "2 months", "3-6 months", "12 months"], answer: 2 },
      },
      {
        id: "b4", title: "Cutting Unnecessary Spending", duration: "4 min", difficulty: "Beginner",
        content: [
          "The average American spends $237/month on subscriptions alone — and 84% underestimate how much they spend on them. Audit every recurring charge.",
          "Common money leaks: unused gym memberships, overlapping streaming services, extended warranties, and impulse purchases. These small leaks sink big budgets.",
          "Try a 30-day no-spend challenge on non-essentials. Most people save $300-600 and discover what they actually value versus what they mindlessly bought.",
          "💡 KEY INSIGHT: Eliminating just $50/month in wasted spending adds up to $600/year — enough to start investing.",
        ],
        quiz: { question: "What is the most common hidden money leak for most people?", options: ["Grocery shopping", "Unused subscriptions", "Utility bills", "Transportation"], answer: 1 },
      },
      {
        id: "b5", title: "Setting Financial Goals", duration: "5 min", difficulty: "Intermediate",
        content: [
          "Goals give your budget direction. Without them, saving feels like deprivation. With them, saving feels like progress toward something meaningful.",
          "Use the SMART framework: Specific, Measurable, Achievable, Relevant, Time-bound. Instead of 'save money,' try 'save $5,000 for a car by December 2025.'",
          "Split goals into short-term (under 1 year), medium-term (1-5 years), and long-term (5+ years). Each needs a different savings strategy.",
          "💡 KEY INSIGHT: People with written financial goals are 42% more likely to achieve them than those who just think about their goals.",
        ],
        quiz: { question: "What does the 'S' in SMART goals stand for?", options: ["Simple", "Specific", "Strategic", "Savings"], answer: 1 },
      },
    ],
  },
  {
    id: "stocks", title: "Stocks & Investing", color: "#00CFFF",
    description: "Learn how the stock market works and how to invest",
    icon: TrendingUp, difficulty: "Beginner", estimatedTime: "35 min",
    lessons: [
      {
        id: "s1", title: "What is a Stock?", duration: "4 min", difficulty: "Beginner",
        content: [
          "A stock represents a small ownership stake in a company. When you buy Apple stock, you literally own a tiny piece of Apple Inc.",
          "Companies sell stock to raise money for growth. When the company does well, the stock price rises and your investment grows. When it does poorly, the price falls.",
          "The stock market is simply a marketplace where buyers and sellers trade these ownership stakes. Prices change every second based on supply and demand.",
          "💡 KEY INSIGHT: Buying stock means becoming a part-owner of a business. Your goal is to invest in companies you believe will grow over time.",
        ],
        quiz: { question: "What does owning a stock mean?", options: ["You lent money to a company", "You own a small piece of the company", "You work for the company", "You manage the company"], answer: 1 },
      },
      {
        id: "s2", title: "Risk vs. Reward", duration: "5 min", difficulty: "Beginner",
        content: [
          "All investments involve risk — the possibility of losing money. Stocks historically offer higher returns than savings accounts, but with more volatility.",
          "Over the last 100 years, the US stock market has returned about 10% per year on average. But in any single year, it can drop 30% or rise 40%.",
          "Diversification is your best protection against risk. By spreading investments across many companies and industries, one bad investment will not sink your portfolio.",
          "💡 KEY INSIGHT: Higher potential returns always come with higher risk. Match your investment risk level to your timeline and comfort level.",
        ],
        quiz: { question: "What is the best protection against investment risk?", options: ["Buying only safe stocks", "Diversification", "Selling when prices drop", "Only investing in bonds"], answer: 1 },
      },
      {
        id: "s3", title: "Index Funds for Beginners", duration: "5 min", difficulty: "Beginner",
        content: [
          "An index fund automatically invests in hundreds or thousands of companies at once. The S&P 500 index fund holds stock in the 500 largest US companies.",
          "Index funds are perfect for beginners because they are diversified by default, have very low fees, and historically outperform most actively managed funds.",
          "Warren Buffett himself recommends low-cost index funds for most investors. His advice: invest regularly, do not try to time the market, and think long-term.",
          "💡 KEY INSIGHT: You do not need to pick individual stocks to invest successfully. A simple S&P 500 index fund is one of the best long-term investments available.",
        ],
        quiz: { question: "What is an index fund?", options: ["A fund managed by experts who pick stocks", "A fund that automatically invests in many companies at once", "A type of savings account", "A government bond"], answer: 1 },
      },
      {
        id: "s4", title: "How to Read a Stock Chart", duration: "6 min", difficulty: "Intermediate",
        content: [
          "A stock chart shows a company's price history over time. The x-axis is time, the y-axis is price. Upward trends suggest growth; downward trends suggest decline.",
          "Volume bars at the bottom show how many shares were traded. High volume on a price move means the move is more significant than the same move on low volume.",
          "Support and resistance levels are prices where stocks historically stop falling (support) or rising (resistance). These help traders predict future movements.",
          "💡 KEY INSIGHT: Never buy a stock based on a chart alone. Charts show the past — not the future. Use them alongside research into the company's fundamentals.",
        ],
        quiz: { question: "What do volume bars on a stock chart represent?", options: ["The stock's profit", "How many shares were traded", "The company's revenue", "The dividend payment"], answer: 1 },
      },
      {
        id: "s5", title: "Dollar-Cost Averaging", duration: "4 min", difficulty: "Intermediate",
        content: [
          "Dollar-cost averaging (DCA) means investing a fixed amount of money at regular intervals, regardless of the market price. For example, $100 every month.",
          "When prices are high, your $100 buys fewer shares. When prices are low, your $100 buys more shares. Over time, this averages out your cost per share.",
          "DCA removes the stress of trying to time the market. It is the strategy used by most 401(k) plans — you invest every paycheck automatically.",
          "💡 KEY INSIGHT: Time in the market beats timing the market. DCA is how ordinary people build extraordinary wealth over decades.",
        ],
        quiz: { question: "What is the main benefit of dollar-cost averaging?", options: ["It guarantees profits", "It removes the need to time the market", "It only works in bull markets", "It requires a large initial investment"], answer: 1 },
      },
      {
        id: "s6", title: "Understanding P/E Ratio", duration: "5 min", difficulty: "Advanced",
        content: [
          "The Price-to-Earnings (P/E) ratio tells you how much investors are paying for each dollar of a company's earnings. P/E = Stock Price divided by Earnings Per Share.",
          "A high P/E (like 30+) means investors expect strong future growth. A low P/E (like 10-15) may mean the stock is undervalued or the company is struggling.",
          "Compare P/E ratios within the same industry — a P/E of 20 might be cheap for a tech company but expensive for a utility company.",
          "💡 KEY INSIGHT: The P/E ratio is just one tool. Never use it alone. A company with a high P/E can still be a great investment if its growth justifies the premium.",
        ],
        quiz: { question: "What does a high P/E ratio generally suggest?", options: ["The stock is cheap", "Investors expect strong future growth", "The company is losing money", "The stock pays high dividends"], answer: 1 },
      },
    ],
  },
  {
    id: "bonds", title: "Bonds & Fixed Income", color: "#A855F7",
    description: "Understand stable, lower-risk investments",
    icon: BarChart2, difficulty: "Intermediate", estimatedTime: "25 min",
    lessons: [
      {
        id: "bo1", title: "What is a Bond?", duration: "4 min", difficulty: "Beginner",
        content: [
          "A bond is essentially a loan you make to a government or company. They promise to pay you back with interest over a set period of time.",
          "When the US government needs money, it sells Treasury bonds. When Apple needs money for expansion, it might sell corporate bonds. You are the lender.",
          "Bonds are generally safer than stocks because you know exactly how much you will earn. However, this also means lower potential returns.",
          "💡 KEY INSIGHT: Bonds are IOUs. You lend money, earn predictable interest, and get your money back at the end. They are the safe part of most portfolios.",
        ],
        quiz: { question: "When you buy a bond, you are:", options: ["Buying ownership in a company", "Lending money to a government or company", "Opening a savings account", "Buying real estate"], answer: 1 },
      },
      {
        id: "bo2", title: "Types of Bonds", duration: "4 min", difficulty: "Beginner",
        content: [
          "Government bonds (like US Treasuries) are the safest — backed by the full faith of the government. They offer lower returns but near-zero risk of default.",
          "Corporate bonds are issued by companies. They pay higher interest than government bonds, but carry more risk.",
          "Municipal bonds are issued by states and cities, often to fund schools or infrastructure. They have a unique tax advantage — the interest is often tax-free.",
          "💡 KEY INSIGHT: Government = safety. Corporate = higher returns with more risk. Municipal = tax advantages. Choose based on your situation.",
        ],
        quiz: { question: "Which type of bond is generally considered the safest?", options: ["Corporate bonds", "Municipal bonds", "Government bonds", "Junk bonds"], answer: 2 },
      },
      {
        id: "bo3", title: "Bond Yields Explained", duration: "5 min", difficulty: "Intermediate",
        content: [
          "A bond's yield is the return you get for holding it. The yield and price of a bond move in opposite directions — when prices go up, yields go down, and vice versa.",
          "The yield curve shows interest rates across different bond maturities. A normal curve slopes upward (longer = higher yield). An inverted curve often predicts recessions.",
          "When interest rates rise, existing bond prices fall because new bonds offer better rates. This is the key risk of holding bonds in a rising rate environment.",
          "💡 KEY INSIGHT: Bond yields tell you the true cost of money in the economy. When yields rise sharply, it often signals tighter financial conditions ahead.",
        ],
        quiz: { question: "When interest rates rise, what happens to existing bond prices?", options: ["They rise", "They fall", "They stay the same", "They double"], answer: 1 },
      },
      {
        id: "bo4", title: "Building a Bond Ladder", duration: "5 min", difficulty: "Advanced",
        content: [
          "A bond ladder is a portfolio of bonds with staggered maturity dates. For example, bonds maturing in 1, 2, 3, 4, and 5 years.",
          "As each bond matures, you reinvest the proceeds in a new long-term bond. This strategy provides regular income and reduces interest rate risk.",
          "Bond ladders are ideal for retirees or anyone who needs predictable income over time without exposing all their capital to interest rate changes at once.",
          "💡 KEY INSIGHT: A bond ladder gives you the best of both worlds — the higher yields of long-term bonds and the liquidity of short-term bonds.",
        ],
        quiz: { question: "What is the main benefit of a bond ladder strategy?", options: ["Maximum returns", "Regular income with reduced interest rate risk", "Tax-free income", "Government guarantees"], answer: 1 },
      },
      {
        id: "bo5", title: "Bonds vs Stocks in a Portfolio", duration: "5 min", difficulty: "Intermediate",
        content: [
          "A classic portfolio allocation is 60% stocks / 40% bonds. Stocks provide growth; bonds provide stability and income. As you age, you typically shift more toward bonds.",
          "During stock market crashes, bonds often rise in value as investors flee to safety. This negative correlation makes bonds valuable for portfolio stability.",
          "Your ideal bond allocation depends on your age, risk tolerance, and investment timeline. A 25-year-old can afford more risk than a 60-year-old near retirement.",
          "💡 KEY INSIGHT: Bonds are the shock absorbers of your portfolio. They reduce volatility and help you stay invested during market downturns.",
        ],
        quiz: { question: "Why do investors typically add bonds to a stock portfolio?", options: ["To maximize returns", "To reduce volatility and add stability", "To avoid taxes", "To beat inflation"], answer: 1 },
      },
    ],
  },
  {
    id: "mutual-funds", title: "Mutual Funds & ETFs", color: "#FF6B35",
    description: "Pool your money for instant diversification",
    icon: BookOpen, difficulty: "Beginner", estimatedTime: "28 min",
    lessons: [
      {
        id: "m1", title: "Mutual Funds Explained", duration: "4 min", difficulty: "Beginner",
        content: [
          "A mutual fund pools money from thousands of investors to buy a diversified portfolio of stocks, bonds, or other assets managed by professional fund managers.",
          "When you invest $500 in a mutual fund, that $500 gets spread across potentially hundreds of different investments — giving you instant diversification.",
          "Mutual funds charge a fee called an expense ratio (usually 0.5-1.5% per year). This pays the fund managers. Lower fees mean more money staying in your pocket.",
          "💡 KEY INSIGHT: Mutual funds make diversification easy and affordable. Great for beginners who want professional management without picking individual stocks.",
        ],
        quiz: { question: "What is an expense ratio in a mutual fund?", options: ["The fund's annual profit", "The annual fee charged by the fund", "The percentage of stocks vs bonds", "The fund's minimum investment"], answer: 1 },
      },
      {
        id: "m2", title: "ETFs vs Mutual Funds", duration: "5 min", difficulty: "Beginner",
        content: [
          "ETFs (Exchange-Traded Funds) are similar to mutual funds but trade on the stock market like individual stocks. You can buy and sell them throughout the day.",
          "ETFs typically have lower fees than mutual funds because most are passively managed — they just track an index rather than having managers actively picking stocks.",
          "For most beginners, ETFs are the better choice due to lower costs, tax efficiency, and flexibility. Popular ETFs like VOO have expense ratios as low as 0.03%.",
          "💡 KEY INSIGHT: ETFs are often cheaper and more flexible than mutual funds. Both are great for diversification — ETFs give you more control and lower costs.",
        ],
        quiz: { question: "What is a key advantage of ETFs over traditional mutual funds?", options: ["They always have higher returns", "They are government guaranteed", "They typically have lower fees and trade like stocks", "They are only available to wealthy investors"], answer: 2 },
      },
      {
        id: "m3", title: "Active vs Passive Investing", duration: "5 min", difficulty: "Intermediate",
        content: [
          "Active investing means fund managers try to beat the market by picking winning stocks. Passive investing means simply tracking a market index like the S&P 500.",
          "Studies consistently show that over 10+ year periods, 80-90% of active fund managers underperform simple index funds — after fees are subtracted.",
          "Active funds charge 0.5-2% per year. Passive index funds charge 0.03-0.2%. Over 30 years, that fee difference can cost you hundreds of thousands of dollars.",
          "💡 KEY INSIGHT: Do not pay high fees for active management that statistically underperforms. Passive index investing beats most professionals over the long run.",
        ],
        quiz: { question: "What percentage of active managers underperform index funds over 10+ years?", options: ["20-30%", "40-50%", "60-70%", "80-90%"], answer: 3 },
      },
      {
        id: "m4", title: "Sector ETFs", duration: "4 min", difficulty: "Intermediate",
        content: [
          "Sector ETFs let you invest in a specific part of the economy — like technology (QQQ), healthcare (XLV), or energy (XLE) — rather than the entire market.",
          "Using sector ETFs, you can overweight industries you believe will outperform while still maintaining diversification within that sector.",
          "Sector concentration adds risk. If the tech sector crashes 40%, a tech-heavy portfolio will suffer more than a diversified total market fund.",
          "💡 KEY INSIGHT: Sector ETFs are powerful tools for experienced investors, but beginners are better served by broad market index funds first.",
        ],
        quiz: { question: "What is the main risk of investing heavily in sector ETFs?", options: ["Higher fees", "Less diversification and concentration risk", "Lower returns", "No dividend payments"], answer: 1 },
      },
      {
        id: "m5", title: "Rebalancing Your Portfolio", duration: "5 min", difficulty: "Advanced",
        content: [
          "Rebalancing means periodically adjusting your portfolio back to your target allocation. If stocks rise to 75% of your portfolio but your target is 60%, you sell stocks and buy bonds.",
          "Most financial advisors recommend rebalancing once per year or whenever your allocation drifts more than 5-10% from your target.",
          "Rebalancing forces you to sell high and buy low automatically — the opposite of what most emotional investors do during market swings.",
          "💡 KEY INSIGHT: Rebalancing is one of the most underrated wealth-building strategies. It enforces discipline and keeps your risk level aligned with your goals.",
        ],
        quiz: { question: "When should you rebalance your portfolio?", options: ["Every day", "Only when markets crash", "Annually or when allocation drifts 5-10%", "Never — let it ride"], answer: 2 },
      },
    ],
  },
  {
    id: "real-estate", title: "Real Estate Investing", color: "#FFD600",
    description: "Build wealth through property investments",
    icon: Home, difficulty: "Intermediate", estimatedTime: "30 min",
    lessons: [
      {
        id: "r1", title: "Real Estate Basics", duration: "5 min", difficulty: "Beginner",
        content: [
          "Real estate investing means buying property to generate income or profit. This can be through rental income, property appreciation, or both.",
          "Unlike stocks, real estate is a tangible asset — something you can see and touch. Many investors like the psychological comfort of owning a physical asset.",
          "Real estate has historically appreciated about 3-4% per year, but rental properties can generate 6-10% annual returns through rent income on top of appreciation.",
          "💡 KEY INSIGHT: Real estate builds wealth through two streams — monthly rental income and long-term appreciation. It requires more capital but offers unique advantages.",
        ],
        quiz: { question: "What are the two main ways real estate generates returns?", options: ["Dividends and stock growth", "Rental income and property appreciation", "Interest and bond payments", "Tax refunds and grants"], answer: 1 },
      },
      {
        id: "r2", title: "REITs — Real Estate Without the Hassle", duration: "4 min", difficulty: "Beginner",
        content: [
          "A REIT (Real Estate Investment Trust) lets you invest in real estate without buying physical property. REITs own and operate income-producing real estate.",
          "REITs trade on the stock market like regular stocks, so you can invest with as little as $10. They are required by law to pay at least 90% of their income as dividends.",
          "This makes REITs one of the best ways for beginners to get real estate exposure. You get the benefits of real estate without being a landlord.",
          "💡 KEY INSIGHT: REITs are the easiest way to invest in real estate. Buy them like stocks, collect dividends like rent, without ever managing a property.",
        ],
        quiz: { question: "What percentage of income are REITs required to pay as dividends?", options: ["50%", "75%", "90%", "100%"], answer: 2 },
      },
      {
        id: "r3", title: "Rental Property Math", duration: "6 min", difficulty: "Intermediate",
        content: [
          "The 1% rule: a rental property should generate monthly rent equal to at least 1% of its purchase price. A $200,000 property should rent for $2,000/month.",
          "Cap rate (capitalization rate) = Net Operating Income divided by Property Value. A cap rate of 6-8% is generally considered good for residential rentals.",
          "Cash-on-cash return measures your annual cash flow against your actual cash invested (down payment + closing costs). Target 8-12% for a solid rental investment.",
          "💡 KEY INSIGHT: Always run the numbers before buying a rental. Many properties look attractive until you factor in vacancy, repairs, property management, and taxes.",
        ],
        quiz: { question: "According to the 1% rule, what should a $300,000 property rent for monthly?", options: ["$1,500", "$2,000", "$3,000", "$4,500"], answer: 2 },
      },
      {
        id: "r4", title: "House Hacking", duration: "5 min", difficulty: "Intermediate",
        content: [
          "House hacking means buying a multi-unit property (duplex, triplex), living in one unit, and renting out the others. Your tenants pay your mortgage.",
          "This strategy lets you buy your first investment property with a low 3.5% FHA down payment — far less than the 20-25% required for a traditional investment property.",
          "Many house hackers live for free or near-free while building equity and cash flow. It is one of the fastest paths to financial independence for young investors.",
          "💡 KEY INSIGHT: House hacking is the single best real estate strategy for beginners. You reduce your living costs to near zero while building a rental portfolio.",
        ],
        quiz: { question: "What is the main benefit of house hacking?", options: ["Avoiding all taxes", "Having tenants help pay your mortgage", "Avoiding property maintenance", "Guaranteed appreciation"], answer: 1 },
      },
      {
        id: "r5", title: "Real Estate vs Stocks", duration: "5 min", difficulty: "Intermediate",
        content: [
          "Stocks have historically returned 10% per year. Real estate returns 8-12% when you include rental income — but real estate also offers leverage (you can control a $300K property with $60K).",
          "Real estate requires active management, large capital, and is illiquid (hard to sell quickly). Stocks require no management, can start with $1, and can be sold instantly.",
          "Many wealthy people own both. Stocks for growth and liquidity. Real estate for income, leverage, and tax advantages (depreciation can offset rental income).",
          "💡 KEY INSIGHT: Neither is universally better. The best investment is the one you understand well enough to stick with through market downturns.",
        ],
        quiz: { question: "What major advantage does real estate have over stocks?", options: ["Higher guaranteed returns", "Leverage — controlling large assets with smaller capital", "No risk of loss", "Always outperforms inflation"], answer: 1 },
      },
    ],
  },
];

function loadProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem("eduProgress") ?? "{}"); } catch { return {}; }
}
function saveProgress(p: Record<string, boolean>) { localStorage.setItem("eduProgress", JSON.stringify(p)); }
function loadNotes(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem("eduNotes") ?? "{}"); } catch { return {}; }
}
function saveNotes(n: Record<string, string>) { localStorage.setItem("eduNotes", JSON.stringify(n)); }

function GridBg() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,207,255,0.04) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "20%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.04) 0%, transparent 70%)" }} />
    </div>
  );
}

/* ── Certificate Modal ── */
function CertModal({ module: mod, onClose }: { module: Module; onClose: () => void }) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: `2px solid ${mod.color}`, borderRadius: 20, width: "100%", maxWidth: 500, padding: "40px 32px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: `0 0 80px ${mod.color}30` }}
      >
        {/* Corner brackets */}
        {[
          { pos: { top: 0, left: 0 },     borders: { borderTop: `2px solid ${mod.color}`, borderLeft: `2px solid ${mod.color}` } },
          { pos: { top: 0, right: 0 },    borders: { borderTop: `2px solid ${mod.color}`, borderRight: `2px solid ${mod.color}` } },
          { pos: { bottom: 0, left: 0 },  borders: { borderBottom: `2px solid ${mod.color}`, borderLeft: `2px solid ${mod.color}` } },
          { pos: { bottom: 0, right: 0 }, borders: { borderBottom: `2px solid ${mod.color}`, borderRight: `2px solid ${mod.color}` } },
        ].map((c, i) => (
          <div key={i} style={{ position: "absolute", width: 32, height: 32, ...c.pos, ...c.borders }} />
        ))}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${mod.color}, transparent)`, position: "absolute", top: 0, left: 0, right: 0 }} />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          style={{ width: 72, height: 72, borderRadius: "50%", background: mod.color + "15", border: `2px solid ${mod.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 0 40px ${mod.color}50` }}
        >
          <Award size={32} color={mod.color} />
        </motion.div>
        <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: mod.color, letterSpacing: "3px", marginBottom: 8 }}>CERTIFICATE OF COMPLETION</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{mod.title}</h2>
        <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 20, lineHeight: 1.6 }}>
          Successfully completed all {mod.lessons.length} lessons and passed all quizzes
        </p>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 20 }}>
          {mod.lessons.map((_, i) => <Star key={i} size={16} color={mod.color} fill={mod.color} style={{ filter: `drop-shadow(0 0 4px ${mod.color})` }} />)}
        </div>
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 20px", marginBottom: 24 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", letterSpacing: "0.5px" }}>ISSUED ON {date.toUpperCase()}</p>
        </div>
        <button onClick={onClose} style={{ padding: "12px 32px", background: mod.color, color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", boxShadow: `0 0 20px ${mod.color}40` }}>
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── Lesson Modal ── */
function LessonModal({ lesson, color, note, onClose, onComplete, onSaveNote }: {
  lesson: Lesson; color: string; note: string;
  onClose: () => void; onComplete: () => void; onSaveNote: (n: string) => void;
}) {
  const [step, setStep]           = useState<"content" | "quiz" | "done">("content");
  const [selected, setSelected]   = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [shake, setShake]         = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText]   = useState(note);

  const submitQuiz = () => {
    if (selected === null) return;
    const correct = selected === lesson.quiz.answer;
    setIsCorrect(correct);
    if (correct) { setTimeout(() => { setStep("done"); onComplete(); }, 800); }
    else { setShake(true); setTimeout(() => setShake(false), 500); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--surface)", border: `1px solid ${color}40`, borderRadius: 20, width: "100%", maxWidth: showNotes ? 860 : 520, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: `0 0 60px ${color}20`, transition: "max-width 0.3s" }}
      >
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

        {/* Header */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg3)", flexShrink: 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <p style={{ fontFamily: "var(--mono)", fontSize: 9, color, letterSpacing: "2px" }}>// LESSON</p>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: DIFF_COLORS[lesson.difficulty], background: DIFF_COLORS[lesson.difficulty] + "15", border: `1px solid ${DIFF_COLORS[lesson.difficulty]}30`, borderRadius: 100, padding: "1px 7px" }}>{lesson.difficulty.toUpperCase()}</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{lesson.title}</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{lesson.duration}</span>
            <button onClick={() => setShowNotes(n => !n)} style={{ background: showNotes ? color + "20" : "none", border: `1px solid ${showNotes ? color : "var(--border2)"}`, borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: showNotes ? color : "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
              <StickyNote size={13} />
            </button>
            <button onClick={onClose} style={{ background: "none", border: "1px solid var(--border2)", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.color = "var(--red)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
            ><X size={13} /></button>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {["Read", "Quiz", "Done"].map((s, i) => {
            const active = (i === 0 && step === "content") || (i === 1 && step === "quiz") || (i === 2 && step === "done");
            const done   = (i === 0 && step !== "content") || (i === 1 && step === "done");
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", background: done ? color : active ? color + "20" : "var(--bg3)", color: done ? "#000" : active ? color : "var(--text3)", border: `1px solid ${active || done ? color : "var(--border)"}`, boxShadow: active ? `0 0 12px ${color}40` : "none", transition: "all 0.3s" }}>
                  {done ? "✓" : i + 1}
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: active ? color : "var(--text3)", letterSpacing: "0.5px" }}>{s.toUpperCase()}</span>
                {i < 2 && <div style={{ width: 20, height: 1, background: done ? color : "var(--border)", marginLeft: 2 }} />}
              </div>
            );
          })}
        </div>

        {/* Main content + notes */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", minHeight: 0 }}>
          {/* Lesson content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            <AnimatePresence mode="wait">
              {step === "content" && (
                <motion.div key="content" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                    {lesson.content.map((para, i) => (
                      <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        style={{ lineHeight: 1.8, color: para.startsWith("💡") ? color : "var(--text2)", background: para.startsWith("💡") ? color + "10" : "transparent", border: para.startsWith("💡") ? `1px solid ${color}25` : "none", borderRadius: para.startsWith("💡") ? 10 : 0, padding: para.startsWith("💡") ? "12px 14px" : "0", fontFamily: para.startsWith("💡") ? "var(--mono)" : "inherit", fontWeight: para.startsWith("💡") ? 600 : 400, fontSize: para.startsWith("💡") ? 13 : 14 }}
                      >{para}</motion.p>
                    ))}
                  </div>
                  <button onClick={() => setStep("quiz")} style={{ width: "100%", padding: "12px", background: color, color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 0 20px ${color}40` }}>
                    Take the Quiz <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}
              {step === "quiz" && (
                <motion.div key="quiz" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 20, lineHeight: 1.6 }}>{lesson.quiz.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {lesson.quiz.options.map((opt, i) => {
                      const isSel  = selected === i;
                      const isWrong = isSel && isCorrect === false;
                      const isRight = isSel && isCorrect === true;
                      return (
                        <motion.button key={i}
                          animate={isWrong && shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          onClick={() => { setSelected(i); setIsCorrect(null); }}
                          style={{ width: "100%", padding: "12px 16px", textAlign: "left", background: isRight ? color + "20" : isWrong ? "rgba(255,68,68,0.1)" : isSel ? "var(--surface2)" : "var(--bg3)", border: `1px solid ${isRight ? color : isWrong ? "rgba(255,68,68,0.5)" : isSel ? color + "40" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s", boxShadow: isRight ? `0 0 16px ${color}30` : "none" }}
                        >
                          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: isSel ? color : "var(--text3)", marginRight: 10 }}>{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                  {isCorrect === false && <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)", marginBottom: 12, letterSpacing: "0.5px" }}>// INCORRECT — TRY AGAIN</p>}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setStep("content")} style={{ flex: 1, padding: "11px", background: "transparent", color: "var(--text3)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <ChevronLeft size={14} /> Back
                    </button>
                    <button onClick={submitQuiz} disabled={selected === null} style={{ flex: 2, padding: "11px", background: selected !== null ? color : "var(--border)", color: selected !== null ? "#000" : "var(--text3)", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: selected !== null ? "pointer" : "not-allowed", fontFamily: "'Space Grotesk', sans-serif", boxShadow: selected !== null ? `0 0 16px ${color}40` : "none", transition: "all 0.2s" }}>
                      Submit Answer
                    </button>
                  </div>
                </motion.div>
              )}
              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    style={{ width: 72, height: 72, borderRadius: "50%", background: color + "15", border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: `0 0 40px ${color}30` }}
                  >
                    <Trophy size={30} color={color} />
                  </motion.div>
                  <h4 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Lesson Complete!</h4>
                  <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 8 }}>You answered correctly and unlocked the next lesson.</p>
                  <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 24 }}>
                    {[1,2,3].map(i => <Star key={i} size={20} color={color} fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />)}
                  </div>
                  <button onClick={onClose} style={{ padding: "12px 32px", background: color, color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", boxShadow: `0 0 20px ${color}40` }}>
                    Continue Learning
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notes panel */}
          <AnimatePresence>
            {showNotes && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                style={{ borderLeft: `1px solid ${color}30`, overflow: "hidden", flexShrink: 0, display: "flex", flexDirection: "column" }}
              >
                <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg3)", display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={13} color={color} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color, letterSpacing: "1px" }}>MY NOTES</span>
                </div>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onBlur={() => onSaveNote(noteText)}
                  placeholder="Type your notes here while reading..."
                  style={{ flex: 1, background: "var(--surface2)", border: "none", outline: "none", padding: "14px", fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", resize: "none", lineHeight: 1.7 }}
                />
                <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", background: "var(--bg3)" }}>
                  <button onClick={() => onSaveNote(noteText)} style={{ width: "100%", padding: "7px", background: color + "20", color, border: `1px solid ${color}30`, borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "var(--mono)", letterSpacing: "0.5px", transition: "all 0.15s" }}>
                    SAVE NOTES
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function EducationalModulesPage() {
  const [progress, setProgress]       = useState<Record<string, boolean>>({});
  const [notes, setNotes]             = useState<Record<string, string>>({});
  const [activeModule, setActiveModule] = useState(MODULES[0].id);
  const [activeLesson, setActiveLesson] = useState<{ lesson: Lesson; color: string } | null>(null);
  const [showCert, setShowCert]       = useState<Module | null>(null);
  const [search, setSearch]           = useState("");
  const [diffFilter, setDiffFilter]   = useState<Difficulty | "All">("All");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => { setProgress(loadProgress()); setNotes(loadNotes()); }, []);

  const completeLesson = (id: string) => {
    const next = { ...progress, [id]: true };
    setProgress(next); saveProgress(next);
    const mod = MODULES.find(m => m.lessons.some(l => l.id === id));
    if (mod && mod.lessons.every(l => next[l.id])) {
      setTimeout(() => setShowCert(mod), 600);
    }
  };

  const saveNote = (lessonId: string, note: string) => {
    const next = { ...notes, [lessonId]: note };
    setNotes(next); saveNotes(next);
  };

  const totalLessons   = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = Object.values(progress).filter(Boolean).length;
  const overallPct     = Math.round((completedCount / totalLessons) * 100);
  const currentModule  = MODULES.find(m => m.id === activeModule) ?? MODULES[0];
  const moduleDone     = currentModule.lessons.filter(l => progress[l.id]).length;
  const modulePct      = Math.round((moduleDone / currentModule.lessons.length) * 100);

  /* Search results across all modules */
  const searchResults = search.trim().length > 1
    ? MODULES.flatMap(m => m.lessons.filter(l =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.content.some(c => c.toLowerCase().includes(search.toLowerCase()))
      ).map(l => ({ lesson: l, module: m })))
    : [];

  /* Filtered lessons in current module */
  const filteredLessons = currentModule.lessons.filter(l =>
    diffFilter === "All" || l.difficulty === diffFilter
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", position: "relative" }}>
      <GridBg />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "2px", marginBottom: 6 }}>// EDUCATIONAL MODULES</p>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
              Learn to <span style={{ color: "var(--em)" }}>Invest</span>
            </h1>
            <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 6 }}>{completedCount}/{totalLessons} lessons complete · {overallPct}% overall progress</p>
          </div>

          {/* Search */}
          <div style={{ position: "relative", width: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: `1px solid ${searchFocused ? "var(--em)" : "var(--border2)"}`, borderRadius: 10, padding: "8px 14px", boxShadow: searchFocused ? "0 0 0 3px var(--em3)" : "none", transition: "all 0.2s" }}>
              <Search size={14} color="var(--text3)" />
              <input value={search} onChange={e => setSearch(e.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search lessons..."
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", width: "100%" }}
              />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 0 }}><X size={12} /></button>}
            </div>
            {/* Search dropdown */}
            {searchResults.length > 0 && searchFocused && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 50, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
                {searchResults.map(({ lesson, module: mod }, i) => (
                  <button key={i} onClick={() => { setActiveModule(mod.id); setActiveLesson({ lesson, color: mod.color }); setSearch(""); }}
                    style={{ width: "100%", padding: "10px 14px", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", textAlign: "left", transition: "background 0.15s", fontFamily: "'Space Grotesk', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface2)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{lesson.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: mod.color }}>{mod.title}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: DIFF_COLORS[lesson.difficulty] }}>{lesson.difficulty}</span>
                      {progress[lesson.id] && <CheckCircle size={9} color="var(--em)" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {search.trim().length > 1 && searchResults.length === 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px", textAlign: "center", zIndex: 50 }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>NO RESULTS FOUND</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Overall progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 20, position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--em), transparent)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={13} color="var(--em)" />
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--em)", letterSpacing: "1px" }}>OVERALL PROGRESS</span>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--em)", textShadow: "0 0 12px rgba(0,255,136,0.4)" }}>{overallPct}%</span>
          </div>
          <div style={{ height: 5, background: "var(--bg3)", borderRadius: 100, overflow: "hidden", marginBottom: 12 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              style={{ height: "100%", borderRadius: 100, background: "linear-gradient(90deg, #00FF88, #00CC6A)", boxShadow: "0 0 8px rgba(0,255,136,0.6)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {MODULES.map(m => {
              const done = m.lessons.filter(l => progress[l.id]).length;
              const pct  = Math.round((done / m.lessons.length) * 100);
              return (
                <button key={m.id} onClick={() => setActiveModule(m.id)}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0, transition: "opacity 0.15s", opacity: m.id === activeModule ? 1 : 0.6 }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: pct === 100 ? m.color : "var(--border2)", boxShadow: pct === 100 ? `0 0 6px ${m.color}` : "none" }} />
                  <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: pct === 100 ? m.color : "var(--text3)", letterSpacing: "0.5px" }}>{m.title.split(" ")[0].toUpperCase()}</span>
                  {pct === 100 && <Award size={9} color={m.color} />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main layout */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }} className="fm-edu-grid">

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODULES.map((mod, i) => {
              const done   = mod.lessons.filter(l => progress[l.id]).length;
              const pct    = Math.round((done / mod.lessons.length) * 100);
              const active = mod.id === activeModule;
              const Icon   = mod.icon;
              return (
                <motion.button key={mod.id}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                  onClick={() => setActiveModule(mod.id)}
                  style={{ width: "100%", textAlign: "left", padding: "12px", background: active ? mod.color + "10" : "var(--surface)", border: `1px solid ${active ? mod.color + "40" : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif", boxShadow: active ? `0 0 20px ${mod.color}15` : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: mod.color + "15", border: `1px solid ${mod.color}25`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? `0 0 12px ${mod.color}40` : "none", flexShrink: 0 }}>
                      <Icon size={14} color={mod.color} strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: active ? mod.color : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: DIFF_COLORS[mod.difficulty], background: DIFF_COLORS[mod.difficulty] + "15", borderRadius: 100, padding: "0px 5px" }}>{mod.difficulty.toUpperCase()}</span>
                        <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--text3)" }}>{mod.estimatedTime}</span>
                      </div>
                    </div>
                    {pct === 100 && <Award size={13} color={mod.color} style={{ flexShrink: 0 }} />}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ flex: 1, height: 3, background: "var(--bg3)", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: mod.color, borderRadius: 100, boxShadow: `0 0 4px ${mod.color}`, transition: "width 0.5s" }} />
                    </div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", flexShrink: 0 }}>{done}/{mod.lessons.length}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Lessons panel */}
          <AnimatePresence mode="wait">
            <motion.div key={activeModule} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

              {/* Module header */}
              <div style={{ background: currentModule.color + "08", border: `1px solid ${currentModule.color}25`, borderRadius: "var(--radius-lg)", padding: "18px 22px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${currentModule.color}, transparent)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: currentModule.color, letterSpacing: "2px" }}>// MODULE</p>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: DIFF_COLORS[currentModule.difficulty], background: DIFF_COLORS[currentModule.difficulty] + "15", border: `1px solid ${DIFF_COLORS[currentModule.difficulty]}30`, borderRadius: 100, padding: "1px 7px" }}>{currentModule.difficulty.toUpperCase()}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)" }}>~{currentModule.estimatedTime}</span>
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: currentModule.color }}>{currentModule.title}</h2>
                    <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>{currentModule.description}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {modulePct === 100 && (
                      <button onClick={() => setShowCert(currentModule)}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: currentModule.color + "15", border: `1px solid ${currentModule.color}40`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: currentModule.color, fontSize: 12, fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: "0.5px", transition: "all 0.2s", boxShadow: `0 0 16px ${currentModule.color}20` }}
                        onMouseEnter={e => { e.currentTarget.style.background = currentModule.color + "25"; e.currentTarget.style.boxShadow = `0 0 24px ${currentModule.color}40`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = currentModule.color + "15"; e.currentTarget.style.boxShadow = `0 0 16px ${currentModule.color}20`; }}
                      >
                        <Award size={13} /> VIEW CERTIFICATE
                      </button>
                    )}
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 700, color: currentModule.color, textShadow: `0 0 20px ${currentModule.color}60`, lineHeight: 1 }}>{modulePct}%</p>
                      <p style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)" }}>{moduleDone}/{currentModule.lessons.length}</p>
                    </div>
                  </div>
                </div>
                <div style={{ height: 4, background: "var(--bg3)", borderRadius: 100, overflow: "hidden", marginTop: 12 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${modulePct}%` }} transition={{ duration: 0.6 }}
                    style={{ height: "100%", background: currentModule.color, borderRadius: 100, boxShadow: `0 0 8px ${currentModule.color}` }}
                  />
                </div>
              </div>

              {/* Difficulty filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Filter size={12} color="var(--text3)" />
                <div style={{ display: "flex", gap: 6 }}>
                  {(["All", "Beginner", "Intermediate", "Advanced"] as const).map(d => (
                    <button key={d} onClick={() => setDiffFilter(d)}
                      style={{ padding: "4px 12px", background: diffFilter === d ? (d === "All" ? "var(--em3)" : DIFF_COLORS[d as Difficulty] + "20") : "transparent", border: `1px solid ${diffFilter === d ? (d === "All" ? "var(--em2)" : DIFF_COLORS[d as Difficulty] + "50") : "var(--border)"}`, borderRadius: 100, cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10, color: diffFilter === d ? (d === "All" ? "var(--em)" : DIFF_COLORS[d as Difficulty]) : "var(--text3)", transition: "all 0.15s", letterSpacing: "0.5px" }}
                    >{d.toUpperCase()}</button>
                  ))}
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginLeft: "auto" }}>{filteredLessons.length} LESSONS</span>
              </div>

              {/* Lessons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredLessons.map((lesson, i) => {
                  const origIndex = currentModule.lessons.indexOf(lesson);
                  const done      = progress[lesson.id];
                  const unlocked  = origIndex === 0 || progress[currentModule.lessons[origIndex - 1]?.id];
                  const c         = currentModule.color;
                  const hasNote   = !!notes[lesson.id]?.trim();

                  return (
                    <motion.div key={lesson.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => unlocked && setActiveLesson({ lesson, color: c })}
                      style={{ background: done ? c + "08" : "var(--surface)", border: `1px solid ${done ? c + "30" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: "16px 20px", cursor: unlocked ? "pointer" : "not-allowed", opacity: unlocked ? 1 : 0.4, transition: "all 0.25s", position: "relative", overflow: "hidden" }}
                      onMouseEnter={e => { if (unlocked && !done) { (e.currentTarget as HTMLDivElement).style.borderColor = c + "50"; (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)"; } }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = done ? c + "30" : "var(--border)"; (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)"; }}
                    >
                      {done && <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: c, boxShadow: `0 0 8px ${c}` }} />}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: done ? c + "20" : unlocked ? "var(--surface2)" : "var(--bg3)", border: `1px solid ${done ? c + "40" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: done ? `0 0 16px ${c}40` : "none" }}>
                          {done ? <CheckCircle size={17} color={c} /> : unlocked ? <Zap size={15} color={c} /> : <Lock size={14} color="var(--text3)" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: done ? c : unlocked ? "var(--text)" : "var(--text3)" }}>{lesson.title}</h3>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: DIFF_COLORS[lesson.difficulty], background: DIFF_COLORS[lesson.difficulty] + "15", border: `1px solid ${DIFF_COLORS[lesson.difficulty]}25`, borderRadius: 100, padding: "1px 7px" }}>{lesson.difficulty.toUpperCase()}</span>
                            {done && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: c, background: c + "15", border: `1px solid ${c}30`, borderRadius: 100, padding: "1px 7px" }}>COMPLETE</span>}
                            {hasNote && <span style={{ display: "flex", alignItems: "center", gap: 3, fontFamily: "var(--mono)", fontSize: 9, color: "#A855F7", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: 100, padding: "1px 7px" }}><StickyNote size={8} /> NOTE</span>}
                          </div>
                          <p style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                            {done ? "Completed ✓" : unlocked ? `${lesson.duration} · click to start` : "Complete previous lesson to unlock"}
                          </p>
                        </div>
                        {unlocked && !done && <ChevronRight size={15} color="var(--text3)" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Module complete banner */}
              {modulePct === 100 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ marginTop: 14, background: currentModule.color + "08", border: `1px solid ${currentModule.color}30`, borderRadius: "var(--radius-lg)", padding: "18px", textAlign: "center", position: "relative", overflow: "hidden", cursor: "pointer" }}
                  onClick={() => setShowCert(currentModule)}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${currentModule.color}, transparent)` }} />
                  <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                    {[1,2,3].map(i => <Star key={i} size={16} color={currentModule.color} fill={currentModule.color} style={{ filter: `drop-shadow(0 0 4px ${currentModule.color})` }} />)}
                  </div>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: currentModule.color, fontWeight: 700 }}>MODULE COMPLETE · CLICK TO VIEW CERTIFICATE</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeLesson && (
          <LessonModal
            lesson={activeLesson.lesson} color={activeLesson.color}
            note={notes[activeLesson.lesson.id] ?? ""}
            onClose={() => setActiveLesson(null)}
            onComplete={() => completeLesson(activeLesson.lesson.id)}
            onSaveNote={(n) => saveNote(activeLesson.lesson.id, n)}
          />
        )}
        {showCert && <CertModal module={showCert} onClose={() => setShowCert(null)} />}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) { .fm-edu-grid { grid-template-columns: 1fr !important; } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
      `}</style>
    </div>
  );
}