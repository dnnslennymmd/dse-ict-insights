import { describe, expect, it } from "vitest";
import {
  analyzeBars,
  buildSetup,
  detectFVG,
  detectLiquidityPools,
  detectSweeps,
  detectSwings,
  dseSessionContext,
  calculatePositionSize,
} from "./index.js";
import type { Bar } from "@dse/shared";

function makeBar(
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
): Bar {
  return { time, open, high, low, close, volume: 1000 };
}

describe("detectSwings", () => {
  it("identifies swing high in synthetic series", () => {
    const bars: Bar[] = [
      makeBar(1, 100, 105, 99, 102),
      makeBar(2, 102, 108, 101, 106),
      makeBar(3, 106, 115, 105, 110),
      makeBar(4, 110, 112, 104, 105),
      makeBar(5, 105, 107, 100, 101),
    ];
    const swings = detectSwings(bars, 1);
    const highs = swings.filter((s) => s.type === "high");
    expect(highs.length).toBeGreaterThan(0);
    expect(highs.some((s) => s.price === 115)).toBe(true);
  });
});

describe("detectFVG", () => {
  it("detects bullish fair value gap", () => {
    const bars: Bar[] = [
      makeBar(1, 100, 102, 99, 101),
      makeBar(2, 101, 110, 100, 109),
      makeBar(3, 109, 115, 108, 114),
    ];
    const fvgs = detectFVG(bars);
    expect(fvgs.length).toBeGreaterThan(0);
    expect(fvgs[0].direction).toBe("bullish");
    expect(fvgs[0].bottom).toBe(102);
    expect(fvgs[0].top).toBe(108);
  });
});

describe("detectSweeps", () => {
  it("detects buy-side liquidity sweep", () => {
    const swings = [
      { index: 0, time: 1, price: 110, type: "high" as const },
      { index: 2, time: 3, price: 110.5, type: "high" as const },
    ];
    const pools = detectLiquidityPools(swings, 0.02);
    const bars: Bar[] = [
      makeBar(1, 108, 110, 107, 109),
      makeBar(2, 109, 110, 108, 109),
      makeBar(3, 109, 112, 106, 107),
    ];
    const sweeps = detectSweeps(bars, pools);
    expect(sweeps.some((s) => s.direction === "bearish")).toBe(true);
  });
});

describe("dseSessionContext", () => {
  it("returns morning drive during 10:00 EAT", () => {
    const eat10am = Date.UTC(2026, 0, 15, 7, 0, 0);
    const ctx = dseSessionContext(eat10am);
    expect(ctx.phase).toBe("continuous");
    expect(ctx.qualityModifier).toBeGreaterThan(0.5);
  });
});

describe("buildSetup", () => {
  it("returns setup for trending synthetic data", () => {
    const bars: Bar[] = [];
    let price = 500;
    for (let i = 0; i < 40; i++) {
      const open = price;
      const close = price + (i % 3 === 0 ? -2 : 3);
      const high = Math.max(open, close) + 1;
      const low = Math.min(open, close) - 1;
      bars.push(makeBar(i * 86400000, open, high, low, close));
      price = close;
    }
    bars[35] = makeBar(
      bars[35].time,
      bars[34].close,
      bars[34].close + 15,
      bars[34].close - 1,
      bars[34].close + 12,
    );
    bars[36] = makeBar(
      bars[36].time,
      bars[35].close,
      bars[35].close + 5,
      bars[35].close - 8,
      bars[35].close - 6,
    );
    const setup = buildSetup("CRDB", bars, { liquidityScore: 90 });
    expect(setup).not.toBeNull();
    if (setup) {
      expect(setup.symbol).toBe("CRDB");
      expect(setup.confidence).toBeGreaterThan(0);
      expect(setup.events.length).toBeGreaterThan(0);
    }
  });
});

describe("calculatePositionSize", () => {
  it("sizes position based on risk", () => {
    const result = calculatePositionSize(1000000, 2, 500, 480);
    expect(result.shares).toBeGreaterThan(0);
    expect(result.riskAmount).toBe(20000);
  });
});

describe("analyzeBars", () => {
  it("returns full analysis object", () => {
    const bars: Bar[] = [
      makeBar(1, 100, 105, 99, 102),
      makeBar(2, 102, 108, 101, 106),
      makeBar(3, 106, 115, 105, 110),
      makeBar(4, 110, 112, 104, 105),
      makeBar(5, 105, 107, 100, 101),
      makeBar(6, 101, 103, 98, 99),
      makeBar(7, 99, 102, 97, 100),
    ];
    const analysis = analyzeBars(bars);
    expect(analysis.swings.length).toBeGreaterThan(0);
    expect(analysis.fvgs).toBeDefined();
  });
});
