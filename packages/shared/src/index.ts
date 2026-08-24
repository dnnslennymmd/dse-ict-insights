export type Bar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type SwingPoint = {
  index: number;
  time: number;
  price: number;
  type: "high" | "low";
};

export type LiquidityPool = {
  level: number;
  type: "buy-side" | "sell-side";
  swingIndices: number[];
  strength: number;
};

export type SweepEvent = {
  index: number;
  time: number;
  pool: LiquidityPool;
  direction: "bullish" | "bearish";
};

export type FVGZone = {
  top: number;
  bottom: number;
  startIndex: number;
  endIndex: number;
  direction: "bullish" | "bearish";
  mitigated: boolean;
};

export type OrderBlock = {
  top: number;
  bottom: number;
  index: number;
  time: number;
  direction: "bullish" | "bearish";
  mitigated: boolean;
};

export type StructureShift = {
  index: number;
  time: number;
  type: "CHoCH" | "MSS";
  direction: "bullish" | "bearish";
};

export type DseSessionPhase =
  | "pre-open"
  | "auction"
  | "continuous"
  | "close"
  | "after-hours";

export type SessionContext = {
  phase: DseSessionPhase;
  qualityModifier: number;
  label: string;
};

export type SetupBias = "bullish" | "bearish" | "neutral";

export type TradeSetup = {
  id: string;
  symbol: string;
  timeframe: string;
  bias: SetupBias;
  confidence: number;
  drawOnLiquidity: number;
  entryZone: { top: number; bottom: number };
  invalidation: number;
  target: number;
  stop: number;
  session: SessionContext;
  events: string[];
  detectedAt: number;
  dataSource: string;
  liquidityScore: number;
};

export type SymbolMeta = {
  symbol: string;
  name: string;
  sector?: string;
  liquidityScore: number;
};

export type IndexSnapshot = {
  code: string;
  name: string;
  value: number;
  changePct: number;
  updatedAt: string;
};

export type StockSnapshot = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  volume: number;
  updatedAt: string;
};

export type PaperTrade = {
  id: string;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice?: number;
  shares: number;
  stop: number;
  target: number;
  status: "open" | "closed";
  openedAt: number;
  closedAt?: number;
  pnl?: number;
  fees?: number;
  setupId?: string;
  thesis?: string;
  emotion?: string;
};

export type JournalEntry = {
  id: string;
  tradeId?: string;
  symbol: string;
  content: string;
  emotion?: string;
  outcome?: string;
  createdAt: number;
};

export type AlertItem = {
  id: string;
  symbol: string;
  message: string;
  type: "sweep" | "fvg" | "mss" | "setup";
  createdAt: number;
  read: boolean;
};

export const DSE_LIQUID_SYMBOLS: SymbolMeta[] = [
  { symbol: "CRDB", name: "CRDB Bank", sector: "Banking", liquidityScore: 95 },
  { symbol: "NMB", name: "NMB Bank", sector: "Banking", liquidityScore: 92 },
  { symbol: "VODA", name: "Vodacom Tanzania", sector: "Telecom", liquidityScore: 90 },
  { symbol: "TBL", name: "Tanzania Breweries", sector: "Consumer", liquidityScore: 88 },
  { symbol: "TPCC", name: "Tanzania Portland Cement", sector: "Industrial", liquidityScore: 75 },
  { symbol: "SWALA", name: "Swala Oil & Gas", sector: "Energy", liquidityScore: 70 },
  { symbol: "NICOL", name: "NIC Insurance", sector: "Insurance", liquidityScore: 68 },
  { symbol: "DCB", name: "DCB Commercial Bank", sector: "Banking", liquidityScore: 65 },
  { symbol: "MKCB", name: "Mkombozi Commercial Bank", sector: "Banking", liquidityScore: 62 },
  { symbol: "PAL", name: "Palm Oil Tanzania", sector: "Agriculture", liquidityScore: 60 },
  { symbol: "JHL", name: "Jubilee Holdings", sector: "Insurance", liquidityScore: 72 },
  { symbol: "TCC", name: "Tanzania Cigarette Company", sector: "Consumer", liquidityScore: 70 },
  { symbol: "KA", name: "Kenya Airways", sector: "Transport", liquidityScore: 58 },
  { symbol: "EABL", name: "East African Breweries", sector: "Consumer", liquidityScore: 55 },
  { symbol: "YETU", name: "Yetu Microfinance", sector: "Finance", liquidityScore: 50 },
];

export const DSE_TRADING_FEE_RATE = 0.023768;
