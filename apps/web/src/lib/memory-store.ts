import type {
  Bar,
  TradeSetup,
  AlertItem,
  PaperTrade,
  JournalEntry,
} from "@dse/shared";

type MemoryStore = {
  ohlcv: Map<string, Bar[]>;
  setups: Map<string, TradeSetup>;
  watchlist: Set<string>;
  alerts: AlertItem[];
  paperTrades: PaperTrade[];
  journal: JournalEntry[];
  meta: Map<string, string>;
};

const memory: MemoryStore = {
  ohlcv: new Map(),
  setups: new Map(),
  watchlist: new Set(),
  alerts: [],
  paperTrades: [],
  journal: [],
  meta: new Map(),
};

export function memoryUpsertBars(symbol: string, bars: Bar[]) {
  memory.ohlcv.set(symbol, bars);
}

export function memoryGetBars(symbol: string, limit = 200): Bar[] {
  const bars = memory.ohlcv.get(symbol) ?? [];
  return bars.slice(-limit);
}

export function memoryUpsertSetup(setup: TradeSetup) {
  memory.setups.set(setup.id, setup);
}

export function memoryGetSetupsForSymbol(symbol: string): TradeSetup[] {
  return [...memory.setups.values()]
    .filter((s) => s.symbol === symbol)
    .sort((a, b) => b.detectedAt - a.detectedAt)
    .slice(0, 5);
}

export function memoryGetRecentSetups(limit = 20): TradeSetup[] {
  return [...memory.setups.values()]
    .sort((a, b) => b.detectedAt - a.detectedAt)
    .slice(0, limit);
}

export function memoryGetWatchlist(): string[] {
  return [...memory.watchlist];
}

export function memoryAddToWatchlist(symbol: string) {
  memory.watchlist.add(symbol);
}

export function memoryRemoveFromWatchlist(symbol: string) {
  memory.watchlist.delete(symbol);
}

export function memoryCreateAlert(alert: Omit<AlertItem, "read">) {
  memory.alerts.unshift({ ...alert, read: false });
  if (memory.alerts.length > 100) memory.alerts.length = 100;
}

export function memoryGetAlerts(limit = 50): AlertItem[] {
  return memory.alerts.slice(0, limit);
}

export function memoryMarkAlertRead(id: string) {
  const a = memory.alerts.find((x) => x.id === id);
  if (a) a.read = true;
}

export function memoryCreatePaperTrade(trade: PaperTrade) {
  memory.paperTrades.unshift(trade);
}

export function memoryGetPaperTrades(): PaperTrade[] {
  return memory.paperTrades;
}

export function memoryClosePaperTrade(
  id: string,
  exitPrice: number,
  pnl: number,
  fees: number,
) {
  const t = memory.paperTrades.find((x) => x.id === id);
  if (t) {
    t.exitPrice = exitPrice;
    t.pnl = pnl;
    t.fees = fees;
    t.status = "closed";
    t.closedAt = Date.now();
  }
}

export function memoryCreateJournalEntry(entry: JournalEntry) {
  memory.journal.unshift(entry);
}

export function memoryGetJournalEntries(): JournalEntry[] {
  return memory.journal;
}

export function memorySetMeta(key: string, value: string) {
  memory.meta.set(key, value);
}

export function memoryGetMeta(key: string): string | null {
  return memory.meta.get(key) ?? null;
}
