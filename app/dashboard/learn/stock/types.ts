export type StockQuote = {
  symbol:    string;
  price:     number;
  change:    number;
  changePct: string;
  high:      number;
  low:       number;
  volume:    number;
  prevClose: number;
  latestDay: string;
};

export type ChartPoint = {
  time:   string;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
};

export type SearchResult = {
  symbol:   string;
  name:     string;
  type:     string;
  region:   string;
  currency: string;
};

export type ChartRange = "intraday" | "daily";

export type WatchlistItem = {
  symbol:    string;
  addedAt:   string;
  lastPrice?: number;
};

export type SimulatedHolding = {
  symbol:    string;
  shares:    number;
  avgPrice:  number;
  boughtAt:  string;
};

export type Portfolio = {
  cash:     number;
  holdings: SimulatedHolding[];
};