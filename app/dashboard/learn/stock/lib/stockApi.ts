export async function fetchQuote(symbol: string) {
  const res = await fetch(`/api/stocks?action=quote&symbol=${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch quote");
  return res.json();
}

export async function fetchIntraday(symbol: string) {
  const res = await fetch(`/api/stocks?action=intraday&symbol=${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch intraday data");
  return res.json();
}

export async function fetchDaily(symbol: string) {
  const res = await fetch(`/api/stocks?action=daily&symbol=${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch daily data");
  return res.json();
}

export async function searchSymbol(query: string) {
  const res = await fetch(`/api/stocks?action=search&q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search symbol");
  return res.json();
}