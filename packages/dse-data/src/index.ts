import type { Bar, IndexSnapshot, StockSnapshot } from "@dse/shared";
import { DSE_LIQUID_SYMBOLS } from "@dse/shared";

const MANSA_BASE = "https://mansaapi.com/api/v1/markets";

export type MansaConfig = {
  apiKey?: string;
  baseUrl?: string;
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function generateSyntheticBars(
  symbol: string,
  days = 120,
  basePrice?: number,
): Bar[] {
  const meta = DSE_LIQUID_SYMBOLS.find((s) => s.symbol === symbol);
  const startPrice = basePrice ?? (meta ? 200 + meta.liquidityScore * 3 : 500);
  const rand = seededRandom(symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  const bars: Bar[] = [];
  let price = startPrice;
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = days; i >= 0; i--) {
    const time = now - i * dayMs;
    const volatility = 0.02 + (1 - (meta?.liquidityScore ?? 50) / 100) * 0.03;
    const change = (rand() - 0.48) * price * volatility;
    const open = price;
    const close = Math.max(10, price + change);
    const high = Math.max(open, close) + rand() * price * 0.01;
    const low = Math.min(open, close) - rand() * price * 0.01;
    const volume = Math.floor(10000 + rand() * 50000 * ((meta?.liquidityScore ?? 50) / 100));
    bars.push({ time, open, high, low, close, volume });
    price = close;
  }

  // Inject ICT-friendly patterns occasionally
  if (bars.length > 10) {
    const idx = bars.length - 5;
    const prev = bars[idx - 1];
    bars[idx] = {
      ...bars[idx],
      high: prev.high + 5,
      low: prev.low - 2,
      close: prev.close - 1,
      open: prev.close,
    };
    bars[idx + 1] = {
      time: bars[idx].time + dayMs,
      open: bars[idx].close,
      high: bars[idx].close + 20,
      low: bars[idx].close - 1,
      close: bars[idx].close + 18,
      volume: bars[idx].volume! * 2,
    };
    bars[idx + 2] = {
      time: bars[idx + 1].time + dayMs,
      open: bars[idx + 1].close,
      high: bars[idx + 1].close + 5,
      low: bars[idx + 1].close - 3,
      close: bars[idx + 1].close + 2,
      volume: bars[idx + 1].volume,
    };
  }

  return bars;
}

async function mansaFetch<T>(path: string, config: MansaConfig): Promise<T | null> {
  if (!config.apiKey) return null;
  const base = config.baseUrl ?? MANSA_BASE;
  try {
    const res = await fetch(`${base}${path}`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json as T;
  } catch {
    return null;
  }
}

export async function fetchDseIndices(config: MansaConfig): Promise<IndexSnapshot[]> {
  const response = await mansaFetch<{
    success: boolean;
    data: Array<{
      code: string;
      name: string;
      value: number;
      change_pct: number;
      updated_at: string;
    }>;
  }>("/exchanges/DSE/indices", config);

  if (response?.success && response.data?.length) {
    return response.data.map((d) => ({
      code: d.code,
      name: d.name,
      value: d.value,
      changePct: d.change_pct,
      updatedAt: d.updated_at,
    }));
  }

  return [
    { code: "DSEI", name: "DSE All Share Index", value: 2875.42, changePct: 0.18, updatedAt: new Date().toISOString() },
    { code: "TSI", name: "Tanzania Share Index", value: 4120.15, changePct: 0.12, updatedAt: new Date().toISOString() },
    { code: "BI", name: "Banks Index", value: 1890.33, changePct: 0.25, updatedAt: new Date().toISOString() },
  ];
}

export async function fetchStockSnapshot(
  symbol: string,
  config: MansaConfig,
): Promise<StockSnapshot | null> {
  const response = await mansaFetch<{
    success: boolean;
    data: {
      symbol: string;
      name: string;
      price: number;
      change_pct: number;
      volume: number;
      updated_at: string;
    };
  }>(`/exchanges/DSE/stocks/${symbol}`, config);

  if (response?.success && response.data) {
    const d = response.data;
    return {
      symbol: d.symbol,
      name: d.name,
      price: d.price,
      changePct: d.change_pct,
      volume: d.volume,
      updatedAt: d.updated_at,
    };
  }
  return null;
}

export async function fetchHistoricalBars(
  symbol: string,
  config: MansaConfig,
  days = 120,
): Promise<Bar[]> {
  const response = await mansaFetch<{
    success: boolean;
    data: Array<{
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  }>(`/exchanges/DSE/stocks/${symbol}/history?days=${days}`, config);

  if (response?.success && response.data?.length) {
    return response.data.map((d) => ({
      time: new Date(d.date).getTime(),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }));
  }

  return generateSyntheticBars(symbol, days);
}

export async function fetchAllSnapshots(config: MansaConfig): Promise<StockSnapshot[]> {
  const snapshots: StockSnapshot[] = [];
  for (const meta of DSE_LIQUID_SYMBOLS) {
    const snap = await fetchStockSnapshot(meta.symbol, config);
    if (snap) {
      snapshots.push(snap);
    } else {
      const bars = generateSyntheticBars(meta.symbol, 5);
      const last = bars[bars.length - 1];
      const prev = bars[bars.length - 2];
      snapshots.push({
        symbol: meta.symbol,
        name: meta.name,
        price: last.close,
        changePct: ((last.close - prev.close) / prev.close) * 100,
        volume: last.volume ?? 0,
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return snapshots;
}

export function getDataSourceLabel(config: MansaConfig): string {
  return config.apiKey ? "Mansa API" : "Synthetic seed (configure MANSA_API_KEY for live data)";
}
