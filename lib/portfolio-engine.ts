import type { ScreenedETF } from "./fmp";

export type RiskProfile = "Conservative" | "Moderate" | "Aggressive";

// Fallback CAGRs used only when FMP historical data is unavailable
const FALLBACK_CAGR: Record<string, number> = {
  BND:  0.015,
  VTIP: 0.022,
  VTI:  0.12,
  GLD:  0.07,
  SCHD: 0.11,
  QQQ:  0.17,
  VNQ:  0.08,
  VXUS: 0.07,
  VGT:  0.20,
  SOXX: 0.18,
};

export function getRiskProfile(
  totalIncome: number,
  totalExpense: number,
  investable: number,
): RiskProfile {
  if (totalIncome === 0 || investable <= 0 || totalExpense >= totalIncome) return "Conservative";
  const savingsRate = investable / totalIncome;
  if (savingsRate < 0.10) return "Conservative";
  if (savingsRate < 0.25) return "Moderate";
  return "Aggressive";
}

export function getTimeHorizon(riskProfile: RiskProfile): string {
  if (riskProfile === "Conservative") return "Short-term (1-2 years)";
  if (riskProfile === "Moderate")     return "Medium-term (3-5 years)";
  return "Long-term (5+ years)";
}

// Distribute allocations evenly across screened ETFs
// Slight tilt: first ETF (highest score) gets a bit more weight
export function buildAllocations(
  etfs: ScreenedETF[],
  monthlyInvestment: number,
): {
  symbol:        string;
  name:          string;
  type:          string;
  percentage:    number;
  monthlyAmount: number;
  livePrice:     number;
  expenseRatio:  number | null;
  sharesPerMonth: number | null;
  cagr:          number;
  color:         string;
}[] {
  const n = etfs.length;
  if (n === 0) return [];

  // Weights: first ETF gets 10% extra, rest split equally
  const baseWeight = 100 / n;
  const bonus      = 10;
  const weights    = etfs.map((_, i) =>
    i === 0 ? baseWeight + bonus : baseWeight - bonus / (n - 1),
  );

  // Round to integers summing to 100
  const rounded = weights.map(w => Math.round(w));
  const diff    = 100 - rounded.reduce((a, b) => a + b, 0);
  rounded[0]   += diff;

  return etfs.map((etf, i) => {
    const pct          = rounded[i];
    const monthlyAmount = Math.round((pct / 100) * monthlyInvestment);
    const cagr         = etf.cagr5yr ?? FALLBACK_CAGR[etf.symbol] ?? 0.08;

    return {
      symbol:        etf.symbol,
      name:          etf.name !== etf.symbol ? etf.name : (etf.symbol),
      type:          etf.type,
      percentage:    pct,
      monthlyAmount,
      livePrice:     etf.price,
      expenseRatio:  etf.expenseRatio,
      sharesPerMonth: etf.price > 0
        ? parseFloat((monthlyAmount / etf.price).toFixed(3))
        : null,
      cagr,
      color:         etf.color,
    };
  });
}

// Future Value of annuity: FV = PMT × ((1+r)^n − 1) / r
function fvAnnuity(monthly: number, annualRate: number, years: number): number {
  if (monthly <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r));
}

export function calculateProjections(
  monthlyInvestment: number,
  allocations: { percentage: number; cagr: number }[],
): { oneYear: number; threeYear: number; fiveYear: number } {
  const weightedCAGR = allocations.reduce(
    (sum, a) => sum + (a.percentage / 100) * a.cagr,
    0,
  );
  return {
    oneYear:   fvAnnuity(monthlyInvestment, weightedCAGR, 1),
    threeYear: fvAnnuity(monthlyInvestment, weightedCAGR, 3),
    fiveYear:  fvAnnuity(monthlyInvestment, weightedCAGR, 5),
  };
}
