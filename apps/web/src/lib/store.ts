import type { Bar, TradeSetup, AlertItem, PaperTrade, JournalEntry } from "@dse/shared";
import { getDb } from "./db";

export function upsertBars(symbol: string, bars: Bar[]) {
  const db = getDb();
  const insert = db.prepare(
    `INSERT OR REPLACE INTO ohlcv (symbol, time, open, high, low, close, volume)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const tx = db.transaction((items: Bar[]) => {
    for (const b of items) {
      insert.run(symbol, b.time, b.open, b.high, b.low, b.close, b.volume ?? 0);
    }
  });
  tx(bars);
}

export function getBars(symbol: string, limit = 200): Bar[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT time, open, high, low, close, volume FROM ohlcv
       WHERE symbol = ? ORDER BY time ASC LIMIT ?`,
    )
    .all(symbol, limit) as Bar[];
  return rows;
}

export function upsertSetup(setup: TradeSetup) {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO setups (id, symbol, timeframe, bias, confidence, data_json, detected_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    setup.id,
    setup.symbol,
    setup.timeframe,
    setup.bias,
    setup.confidence,
    JSON.stringify(setup),
    setup.detectedAt,
  );
}

export function getSetupsForSymbol(symbol: string): TradeSetup[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT data_json FROM setups WHERE symbol = ? ORDER BY detected_at DESC LIMIT 5`)
    .all(symbol) as { data_json: string }[];
  return rows.map((r) => JSON.parse(r.data_json) as TradeSetup);
}

export function getRecentSetups(limit = 20): TradeSetup[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT data_json FROM setups ORDER BY detected_at DESC LIMIT ?`)
    .all(limit) as { data_json: string }[];
  return rows.map((r) => JSON.parse(r.data_json) as TradeSetup);
}

export function getWatchlist(): string[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT symbol FROM watchlist ORDER BY added_at DESC`)
    .all() as { symbol: string }[];
  return rows.map((r) => r.symbol);
}

export function addToWatchlist(symbol: string) {
  const db = getDb();
  db.prepare(`INSERT OR IGNORE INTO watchlist (symbol, added_at) VALUES (?, ?)`).run(
    symbol,
    Date.now(),
  );
}

export function removeFromWatchlist(symbol: string) {
  const db = getDb();
  db.prepare(`DELETE FROM watchlist WHERE symbol = ?`).run(symbol);
}

export function createAlert(alert: Omit<AlertItem, "read">) {
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO alerts (id, symbol, message, type, created_at, read) VALUES (?, ?, ?, ?, ?, 0)`,
  ).run(alert.id, alert.symbol, alert.message, alert.type, alert.createdAt);
}

export function getAlerts(limit = 50): AlertItem[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT id, symbol, message, type, created_at, read FROM alerts ORDER BY created_at DESC LIMIT ?`)
    .all(limit) as Array<{
      id: string;
      symbol: string;
      message: string;
      type: AlertItem["type"];
      created_at: number;
      read: number;
    }>;
  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    message: r.message,
    type: r.type,
    createdAt: r.created_at,
    read: Boolean(r.read),
  }));
}

export function markAlertRead(id: string) {
  const db = getDb();
  db.prepare(`UPDATE alerts SET read = 1 WHERE id = ?`).run(id);
}

export function createPaperTrade(trade: PaperTrade) {
  const db = getDb();
  db.prepare(
    `INSERT INTO paper_trades (id, symbol, direction, entry_price, exit_price, shares, stop, target, status, opened_at, closed_at, pnl, fees, setup_id, thesis, emotion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    trade.id,
    trade.symbol,
    trade.direction,
    trade.entryPrice,
    trade.exitPrice ?? null,
    trade.shares,
    trade.stop,
    trade.target,
    trade.status,
    trade.openedAt,
    trade.closedAt ?? null,
    trade.pnl ?? null,
    trade.fees ?? null,
    trade.setupId ?? null,
    trade.thesis ?? null,
    trade.emotion ?? null,
  );
}

export function getPaperTrades(): PaperTrade[] {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM paper_trades ORDER BY opened_at DESC`).all() as Array<{
    id: string;
    symbol: string;
    direction: string;
    entry_price: number;
    exit_price: number | null;
    shares: number;
    stop: number;
    target: number;
    status: string;
    opened_at: number;
    closed_at: number | null;
    pnl: number | null;
    fees: number | null;
    setup_id: string | null;
    thesis: string | null;
    emotion: string | null;
  }>;
  return rows.map((r) => ({
    id: r.id,
    symbol: r.symbol,
    direction: r.direction as "long" | "short",
    entryPrice: r.entry_price,
    exitPrice: r.exit_price ?? undefined,
    shares: r.shares,
    stop: r.stop,
    target: r.target,
    status: r.status as "open" | "closed",
    openedAt: r.opened_at,
    closedAt: r.closed_at ?? undefined,
    pnl: r.pnl ?? undefined,
    fees: r.fees ?? undefined,
    setupId: r.setup_id ?? undefined,
    thesis: r.thesis ?? undefined,
    emotion: r.emotion ?? undefined,
  }));
}

export function closePaperTrade(
  id: string,
  exitPrice: number,
  pnl: number,
  fees: number,
) {
  const db = getDb();
  db.prepare(
    `UPDATE paper_trades SET exit_price = ?, pnl = ?, fees = ?, status = 'closed', closed_at = ? WHERE id = ?`,
  ).run(exitPrice, pnl, fees, Date.now(), id);
}

export function createJournalEntry(entry: JournalEntry) {
  const db = getDb();
  db.prepare(
    `INSERT INTO journal (id, trade_id, symbol, content, emotion, outcome, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    entry.id,
    entry.tradeId ?? null,
    entry.symbol,
    entry.content,
    entry.emotion ?? null,
    entry.outcome ?? null,
    entry.createdAt,
  );
}

export function getJournalEntries(): JournalEntry[] {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM journal ORDER BY created_at DESC`)
    .all() as JournalEntry[];
  return rows;
}

export function setMeta(key: string, value: string) {
  const db = getDb();
  db.prepare(`INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)`).run(key, value);
}

export function getMeta(key: string): string | null {
  const db = getDb();
  const row = db.prepare(`SELECT value FROM meta WHERE key = ?`).get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}
