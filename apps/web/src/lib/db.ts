import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH ?? path.join(dataDir, "dse.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS ohlcv (
      symbol TEXT NOT NULL,
      time INTEGER NOT NULL,
      open REAL NOT NULL,
      high REAL NOT NULL,
      low REAL NOT NULL,
      close REAL NOT NULL,
      volume REAL,
      PRIMARY KEY (symbol, time)
    );

    CREATE TABLE IF NOT EXISTS setups (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      bias TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      data_json TEXT NOT NULL,
      detected_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      symbol TEXT PRIMARY KEY,
      added_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      read INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS paper_trades (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      direction TEXT NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL,
      shares INTEGER NOT NULL,
      stop REAL NOT NULL,
      target REAL NOT NULL,
      status TEXT NOT NULL,
      opened_at INTEGER NOT NULL,
      closed_at INTEGER,
      pnl REAL,
      fees REAL,
      setup_id TEXT,
      thesis TEXT,
      emotion TEXT
    );

    CREATE TABLE IF NOT EXISTS journal (
      id TEXT PRIMARY KEY,
      trade_id TEXT,
      symbol TEXT NOT NULL,
      content TEXT NOT NULL,
      emotion TEXT,
      outcome TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
