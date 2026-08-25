import type {
  Bar,
  TradeSetup,
  AlertItem,
  PaperTrade,
  JournalEntry,
} from "@dse/shared";
import * as memory from "./memory-store";

function shouldUseMemory(): boolean {
  if (process.env.VERCEL === "1") return true;
  if (process.env.USE_MEMORY_STORE === "1") return true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("better-sqlite3");
    return false;
  } catch {
    return true;
  }
}

const useMemory = shouldUseMemory();

function sqlite(): typeof import("./store-sqlite") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./store-sqlite");
}

export function upsertBars(symbol: string, bars: Bar[]) {
  if (useMemory) return memory.memoryUpsertBars(symbol, bars);
  return sqlite().upsertBars(symbol, bars);
}

export function getBars(symbol: string, limit = 200): Bar[] {
  if (useMemory) return memory.memoryGetBars(symbol, limit);
  return sqlite().getBars(symbol, limit);
}

export function upsertSetup(setup: TradeSetup) {
  if (useMemory) return memory.memoryUpsertSetup(setup);
  return sqlite().upsertSetup(setup);
}

export function getSetupsForSymbol(symbol: string): TradeSetup[] {
  if (useMemory) return memory.memoryGetSetupsForSymbol(symbol);
  return sqlite().getSetupsForSymbol(symbol);
}

export function getRecentSetups(limit = 20): TradeSetup[] {
  if (useMemory) return memory.memoryGetRecentSetups(limit);
  return sqlite().getRecentSetups(limit);
}

export function getWatchlist(): string[] {
  if (useMemory) return memory.memoryGetWatchlist();
  return sqlite().getWatchlist();
}

export function addToWatchlist(symbol: string) {
  if (useMemory) return memory.memoryAddToWatchlist(symbol);
  return sqlite().addToWatchlist(symbol);
}

export function removeFromWatchlist(symbol: string) {
  if (useMemory) return memory.memoryRemoveFromWatchlist(symbol);
  return sqlite().removeFromWatchlist(symbol);
}

export function createAlert(alert: Omit<AlertItem, "read">) {
  if (useMemory) return memory.memoryCreateAlert(alert);
  return sqlite().createAlert(alert);
}

export function getAlerts(limit = 50): AlertItem[] {
  if (useMemory) return memory.memoryGetAlerts(limit);
  return sqlite().getAlerts(limit);
}

export function markAlertRead(id: string) {
  if (useMemory) return memory.memoryMarkAlertRead(id);
  return sqlite().markAlertRead(id);
}

export function createPaperTrade(trade: PaperTrade) {
  if (useMemory) return memory.memoryCreatePaperTrade(trade);
  return sqlite().createPaperTrade(trade);
}

export function getPaperTrades(): PaperTrade[] {
  if (useMemory) return memory.memoryGetPaperTrades();
  return sqlite().getPaperTrades();
}

export function closePaperTrade(
  id: string,
  exitPrice: number,
  pnl: number,
  fees: number,
) {
  if (useMemory) return memory.memoryClosePaperTrade(id, exitPrice, pnl, fees);
  return sqlite().closePaperTrade(id, exitPrice, pnl, fees);
}

export function createJournalEntry(entry: JournalEntry) {
  if (useMemory) return memory.memoryCreateJournalEntry(entry);
  return sqlite().createJournalEntry(entry);
}

export function getJournalEntries(): JournalEntry[] {
  if (useMemory) return memory.memoryGetJournalEntries();
  return sqlite().getJournalEntries();
}

export function setMeta(key: string, value: string) {
  if (useMemory) return memory.memorySetMeta(key, value);
  return sqlite().setMeta(key, value);
}

export function getMeta(key: string): string | null {
  if (useMemory) return memory.memoryGetMeta(key);
  return sqlite().getMeta(key);
}
