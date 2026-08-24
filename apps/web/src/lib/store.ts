import type {
  Bar,
  TradeSetup,
  AlertItem,
  PaperTrade,
  JournalEntry,
} from "@dse/shared";

let useMemory = process.env.VERCEL === "1";

try {
  if (!useMemory) {
    const { getDb } = require("./db");
    getDb();
  }
} catch {
  useMemory = true;
}

function sqlite() {
  return require("./store-sqlite");
}

export function upsertBars(symbol: string, bars: Bar[]) {
  if (useMemory) return require("./memory-store").memoryUpsertBars(symbol, bars);
  return sqlite().upsertBars(symbol, bars);
}

export function getBars(symbol: string, limit = 200): Bar[] {
  if (useMemory) return require("./memory-store").memoryGetBars(symbol, limit);
  return sqlite().getBars(symbol, limit);
}

export function upsertSetup(setup: TradeSetup) {
  if (useMemory) return require("./memory-store").memoryUpsertSetup(setup);
  return sqlite().upsertSetup(setup);
}

export function getSetupsForSymbol(symbol: string): TradeSetup[] {
  if (useMemory) return require("./memory-store").memoryGetSetupsForSymbol(symbol);
  return sqlite().getSetupsForSymbol(symbol);
}

export function getRecentSetups(limit = 20): TradeSetup[] {
  if (useMemory) return require("./memory-store").memoryGetRecentSetups(limit);
  return sqlite().getRecentSetups(limit);
}

export function getWatchlist(): string[] {
  if (useMemory) return require("./memory-store").memoryGetWatchlist();
  return sqlite().getWatchlist();
}

export function addToWatchlist(symbol: string) {
  if (useMemory) return require("./memory-store").memoryAddToWatchlist(symbol);
  return sqlite().addToWatchlist(symbol);
}

export function removeFromWatchlist(symbol: string) {
  if (useMemory) return require("./memory-store").memoryRemoveFromWatchlist(symbol);
  return sqlite().removeFromWatchlist(symbol);
}

export function createAlert(alert: Omit<AlertItem, "read">) {
  if (useMemory) return require("./memory-store").memoryCreateAlert(alert);
  return sqlite().createAlert(alert);
}

export function getAlerts(limit = 50): AlertItem[] {
  if (useMemory) return require("./memory-store").memoryGetAlerts(limit);
  return sqlite().getAlerts(limit);
}

export function markAlertRead(id: string) {
  if (useMemory) return require("./memory-store").memoryMarkAlertRead(id);
  return sqlite().markAlertRead(id);
}

export function createPaperTrade(trade: PaperTrade) {
  if (useMemory) return require("./memory-store").memoryCreatePaperTrade(trade);
  return sqlite().createPaperTrade(trade);
}

export function getPaperTrades(): PaperTrade[] {
  if (useMemory) return require("./memory-store").memoryGetPaperTrades();
  return sqlite().getPaperTrades();
}

export function closePaperTrade(
  id: string,
  exitPrice: number,
  pnl: number,
  fees: number,
) {
  if (useMemory)
    return require("./memory-store").memoryClosePaperTrade(id, exitPrice, pnl, fees);
  return sqlite().closePaperTrade(id, exitPrice, pnl, fees);
}

export function createJournalEntry(entry: JournalEntry) {
  if (useMemory) return require("./memory-store").memoryCreateJournalEntry(entry);
  return sqlite().createJournalEntry(entry);
}

export function getJournalEntries(): JournalEntry[] {
  if (useMemory) return require("./memory-store").memoryGetJournalEntries();
  return sqlite().getJournalEntries();
}

export function setMeta(key: string, value: string) {
  if (useMemory) return require("./memory-store").memorySetMeta(key, value);
  return sqlite().setMeta(key, value);
}

export function getMeta(key: string): string | null {
  if (useMemory) return require("./memory-store").memoryGetMeta(key);
  return sqlite().getMeta(key);
}
