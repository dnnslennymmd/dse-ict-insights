import type {
  Bar,
  DseSessionPhase,
  FVGZone,
  LiquidityPool,
  OrderBlock,
  SessionContext,
  SetupBias,
  StructureShift,
  SweepEvent,
  SwingPoint,
  TradeSetup,
} from "@dse/shared";

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

export function detectSwings(bars: Bar[], lookback = 2): SwingPoint[] {
  const swings: SwingPoint[] = [];
  for (let i = lookback; i < bars.length - lookback; i++) {
    const bar = bars[i];
    const isHigh =
      bars.slice(i - lookback, i).every((b) => b.high <= bar.high) &&
      bars.slice(i + 1, i + 1 + lookback).every((b) => b.high <= bar.high);
    const isLow =
      bars.slice(i - lookback, i).every((b) => b.low >= bar.low) &&
      bars.slice(i + 1, i + 1 + lookback).every((b) => b.low >= bar.low);

    if (isHigh) {
      swings.push({ index: i, time: bar.time, price: bar.high, type: "high" });
    }
    if (isLow) {
      swings.push({ index: i, time: bar.time, price: bar.low, type: "low" });
    }
  }
  return swings;
}

export function detectLiquidityPools(
  swings: SwingPoint[],
  tolerancePct = 0.015,
): LiquidityPool[] {
  const pools: LiquidityPool[] = [];
  const highs = swings.filter((s) => s.type === "high");
  const lows = swings.filter((s) => s.type === "low");

  function cluster(points: SwingPoint[], type: "buy-side" | "sell-side") {
    for (let i = 0; i < points.length; i++) {
      const cluster = [points[i]];
      for (let j = i + 1; j < points.length; j++) {
        const diff = Math.abs(points[j].price - points[i].price) / points[i].price;
        if (diff <= tolerancePct) cluster.push(points[j]);
      }
      if (cluster.length >= 2) {
        const level =
          cluster.reduce((sum, p) => sum + p.price, 0) / cluster.length;
        pools.push({
          level,
          type,
          swingIndices: cluster.map((c) => c.index),
          strength: cluster.length,
        });
      }
    }
  }

  cluster(highs, "buy-side");
  cluster(lows, "sell-side");
  return pools;
}

export function detectSweeps(bars: Bar[], pools: LiquidityPool[]): SweepEvent[] {
  const sweeps: SweepEvent[] = [];
  for (let i = 1; i < bars.length; i++) {
    const bar = bars[i];
    for (const pool of pools) {
      if (pool.type === "buy-side") {
        if (bar.high > pool.level && bar.close < pool.level) {
          sweeps.push({
            index: i,
            time: bar.time,
            pool,
            direction: "bearish",
          });
        }
      } else {
        if (bar.low < pool.level && bar.close > pool.level) {
          sweeps.push({
            index: i,
            time: bar.time,
            pool,
            direction: "bullish",
          });
        }
      }
    }
  }
  return sweeps;
}

export function detectFVG(bars: Bar[]): FVGZone[] {
  const fvgs: FVGZone[] = [];
  for (let i = 2; i < bars.length; i++) {
    const c1 = bars[i - 2];
    const c3 = bars[i];
    if (c3.low > c1.high) {
      fvgs.push({
        top: c3.low,
        bottom: c1.high,
        startIndex: i - 2,
        endIndex: i,
        direction: "bullish",
        mitigated: false,
      });
    }
    if (c3.high < c1.low) {
      fvgs.push({
        top: c1.low,
        bottom: c3.high,
        startIndex: i - 2,
        endIndex: i,
        direction: "bearish",
        mitigated: false,
      });
    }
  }
  for (const fvg of fvgs) {
    for (let j = fvg.endIndex + 1; j < bars.length; j++) {
      const bar = bars[j];
      if (fvg.direction === "bullish" && bar.low <= fvg.top) fvg.mitigated = true;
      if (fvg.direction === "bearish" && bar.high >= fvg.bottom) fvg.mitigated = true;
    }
  }
  return fvgs;
}

export function detectDisplacement(
  bars: Bar[],
  minBodyRatio = 0.6,
): { index: number; direction: "bullish" | "bearish" }[] {
  const displacements: { index: number; direction: "bullish" | "bearish" }[] = [];
  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    const range = bar.high - bar.low;
    if (range === 0) continue;
    const body = Math.abs(bar.close - bar.open);
    const bodyRatio = body / range;
    if (bodyRatio >= minBodyRatio) {
      displacements.push({
        index: i,
        direction: bar.close > bar.open ? "bullish" : "bearish",
      });
    }
  }
  return displacements;
}

export function detectOrderBlocks(
  bars: Bar[],
  displacements: { index: number; direction: "bullish" | "bearish" }[],
): OrderBlock[] {
  const blocks: OrderBlock[] = [];
  for (const d of displacements) {
    const prevIdx = d.index - 1;
    if (prevIdx < 0) continue;
    const prev = bars[prevIdx];
    const isBullishOB =
      d.direction === "bullish" && prev.close < prev.open;
    const isBearishOB =
      d.direction === "bearish" && prev.close > prev.open;
    if (isBullishOB || isBearishOB) {
      blocks.push({
        top: prev.high,
        bottom: prev.low,
        index: prevIdx,
        time: prev.time,
        direction: d.direction,
        mitigated: false,
      });
    }
  }
  for (const ob of blocks) {
    for (let j = ob.index + 2; j < bars.length; j++) {
      const bar = bars[j];
      if (ob.direction === "bullish" && bar.low <= ob.top) ob.mitigated = true;
      if (ob.direction === "bearish" && bar.high >= ob.bottom) ob.mitigated = true;
    }
  }
  return blocks;
}

export function detectStructureShift(bars: Bar[], swings: SwingPoint[]): StructureShift[] {
  const shifts: StructureShift[] = [];
  const sorted = [...swings].sort((a, b) => a.index - b.index);
  let lastHigh: SwingPoint | null = null;
  let lastLow: SwingPoint | null = null;
  let trend: "bullish" | "bearish" | null = null;

  for (const swing of sorted) {
    if (swing.type === "high") {
      if (lastHigh && swing.price > lastHigh.price && trend === "bearish") {
        shifts.push({
          index: swing.index,
          time: swing.time,
          type: "CHoCH",
          direction: "bullish",
        });
        trend = "bullish";
      }
      lastHigh = swing;
    } else {
      if (lastLow && swing.price < lastLow.price && trend === "bullish") {
        shifts.push({
          index: swing.index,
          time: swing.time,
          type: "CHoCH",
          direction: "bearish",
        });
        trend = "bearish";
      }
      lastLow = swing;
    }
    if (!trend && lastHigh && lastLow) {
      trend = lastHigh.index > lastLow.index ? "bullish" : "bearish";
    }
  }

  for (let i = 1; i < shifts.length; i++) {
    if (shifts[i].direction !== shifts[i - 1].direction) {
      shifts[i].type = "MSS";
    }
  }
  return shifts;
}

export function dseSessionContext(timestampMs: number): SessionContext {
  const eat = new Date(timestampMs + EAT_OFFSET_MS);
  const hours = eat.getUTCHours();
  const minutes = eat.getUTCMinutes();
  const totalMinutes = hours * 60 + minutes;

  const preOpenStart = 9 * 60;
  const auctionStart = 9 * 60 + 30;
  const continuousStart = 9 * 60 + 31;
  const closeTime = 16 * 60;

  let phase: DseSessionPhase;
  let qualityModifier: number;
  let label: string;

  if (totalMinutes < preOpenStart) {
    phase = "after-hours";
    qualityModifier = 0.3;
    label = "Before market open";
  } else if (totalMinutes < auctionStart) {
    phase = "pre-open";
    qualityModifier = 0.5;
    label = "Pre-opening session";
  } else if (totalMinutes === auctionStart) {
    phase = "auction";
    qualityModifier = 0.85;
    label = "Opening auction";
  } else if (totalMinutes < continuousStart + 60) {
    phase = "continuous";
    qualityModifier = 0.9;
    label = "Morning drive (high activity)";
  } else if (totalMinutes < closeTime - 60) {
    phase = "continuous";
    qualityModifier = 0.6;
    label = "Midday session";
  } else if (totalMinutes < closeTime) {
    phase = "continuous";
    qualityModifier = 0.75;
    label = "Closing hour";
  } else if (totalMinutes === closeTime) {
    phase = "close";
    qualityModifier = 0.4;
    label = "Market close";
  } else {
    phase = "after-hours";
    qualityModifier = 0.3;
    label = "After hours";
  }

  return { phase, qualityModifier, label };
}

function fibLevel(low: number, high: number, ratio: number): number {
  return low + (high - low) * ratio;
}

export function buildSetup(
  symbol: string,
  bars: Bar[],
  options: {
    timeframe?: string;
    liquidityScore?: number;
    dataSource?: string;
  } = {},
): TradeSetup | null {
  if (bars.length < 20) return null;

  const swings = detectSwings(bars);
  const pools = detectLiquidityPools(swings);
  const sweeps = detectSweeps(bars, pools);
  const fvgs = detectFVG(bars);
  const displacements = detectDisplacement(bars);
  const orderBlocks = detectOrderBlocks(bars, displacements);
  const structureShifts = detectStructureShift(bars, swings);
  const session = dseSessionContext(Date.now());

  const recentSweep = sweeps[sweeps.length - 1];
  const recentShift = structureShifts[structureShifts.length - 1];
  const activeFvg = fvgs.filter((f) => !f.mitigated).pop();
  const activeOb = orderBlocks.filter((o) => !o.mitigated).pop();

  let bias: SetupBias = "neutral";
  if (recentShift) bias = recentShift.direction === "bullish" ? "bullish" : "bearish";
  else if (recentSweep) bias = recentSweep.direction === "bullish" ? "bullish" : "bearish";
  else if (displacements.length) {
    const lastD = displacements[displacements.length - 1];
    bias = lastD.direction === "bullish" ? "bullish" : "bearish";
  }

  if (bias === "neutral") return null;

  const lastBar = bars[bars.length - 1];
  const swingHighs = swings.filter((s) => s.type === "high");
  const swingLows = swings.filter((s) => s.type === "low");
  const rangeHigh = Math.max(...swingHighs.slice(-3).map((s) => s.price), lastBar.high);
  const rangeLow = Math.min(...swingLows.slice(-3).map((s) => s.price), lastBar.low);

  const drawOnLiquidity =
    bias === "bullish" ? rangeHigh : rangeLow;

  let entryTop = lastBar.close;
  let entryBottom = lastBar.close;
  if (activeFvg) {
    entryTop = activeFvg.top;
    entryBottom = activeFvg.bottom;
  } else if (activeOb) {
    entryTop = activeOb.top;
    entryBottom = activeOb.bottom;
  }

  const displacement = displacements[displacements.length - 1];
  if (displacement) {
    const dBar = bars[displacement.index];
    const legLow = Math.min(dBar.low, bars[displacement.index - 1]?.low ?? dBar.low);
    const legHigh = Math.max(dBar.high, bars[displacement.index - 1]?.high ?? dBar.high);
    const ote62 = fibLevel(legLow, legHigh, 0.62);
    const ote79 = fibLevel(legLow, legHigh, 0.79);
    entryBottom = Math.min(entryBottom, Math.min(ote62, ote79));
    entryTop = Math.max(entryTop, Math.max(ote62, ote79));
  }

  const stop =
    bias === "bullish"
      ? Math.min(entryBottom, rangeLow) * 0.98
      : Math.max(entryTop, rangeHigh) * 1.02;
  const target = drawOnLiquidity;
  const entryMid = (entryTop + entryBottom) / 2;

  const events: string[] = [];
  if (recentSweep) events.push(`Liquidity sweep (${recentSweep.direction})`);
  if (recentShift) events.push(`${recentShift.type} (${recentShift.direction})`);
  if (activeFvg) events.push(`Active FVG (${activeFvg.direction})`);
  if (activeOb) events.push(`Order block (${activeOb.direction})`);
  if (events.length === 0 && displacements.length) {
    const d = displacements[displacements.length - 1];
    events.push(`Displacement (${d.direction})`);
  }

  const structureScore = recentShift ? 25 : 10;
  const liquidityEventScore = recentSweep ? 25 : 5;
  const pdArrayScore = (activeFvg || activeOb) ? 25 : 5;
  const sessionScore = session.qualityModifier * 25;
  const liquidityScore = options.liquidityScore ?? 70;

  const rawConfidence =
    (structureScore + liquidityEventScore + pdArrayScore + sessionScore) *
    (liquidityScore / 100);
  const confidence = Math.min(99, Math.round(rawConfidence));

  return {
    id: `${symbol}-${bars[bars.length - 1].time}`,
    symbol,
    timeframe: options.timeframe ?? "daily",
    bias,
    confidence,
    drawOnLiquidity,
    entryZone: { top: entryTop, bottom: entryBottom },
    invalidation: stop,
    target,
    stop,
    session,
    events,
    detectedAt: Date.now(),
    dataSource: options.dataSource ?? "cached",
    liquidityScore,
  };
}

export function analyzeBars(bars: Bar[]) {
  const swings = detectSwings(bars);
  const pools = detectLiquidityPools(swings);
  const sweeps = detectSweeps(bars, pools);
  const fvgs = detectFVG(bars);
  const displacements = detectDisplacement(bars);
  const orderBlocks = detectOrderBlocks(bars, displacements);
  const structureShifts = detectStructureShift(bars, swings);
  return {
    swings,
    pools,
    sweeps,
    fvgs,
    displacements,
    orderBlocks,
    structureShifts,
  };
}

export function calculatePositionSize(
  capitalTzs: number,
  riskPct: number,
  entry: number,
  stop: number,
): { shares: number; riskAmount: number; positionValue: number } {
  const riskAmount = capitalTzs * (riskPct / 100);
  const riskPerShare = Math.abs(entry - stop);
  if (riskPerShare === 0) return { shares: 0, riskAmount, positionValue: 0 };
  const shares = Math.floor(riskAmount / riskPerShare);
  const positionValue = shares * entry;
  return { shares, riskAmount, positionValue };
}

export function estimateFees(positionValue: number, feeRate = 0.023768): number {
  return positionValue * feeRate;
}
