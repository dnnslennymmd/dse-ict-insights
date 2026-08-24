import {
  fetchAllSnapshots,
  fetchDseIndices,
  fetchHistoricalBars,
  getDataSourceLabel,
  type MansaConfig,
} from "@dse/dse-data";
import { buildSetup, analyzeBars } from "@dse/ict-engine";
import { DSE_LIQUID_SYMBOLS } from "@dse/shared";
import {
  upsertBars,
  getBars,
  upsertSetup,
  createAlert,
  setMeta,
  getMeta,
} from "./store";

export function getMansaConfig(): MansaConfig {
  return { apiKey: process.env.MANSA_API_KEY };
}

export async function refreshMarketData() {
  const config = getMansaConfig();
  const dataSource = getDataSourceLabel(config);
  const refreshedAt = Date.now();

  for (const meta of DSE_LIQUID_SYMBOLS) {
    const bars = await fetchHistoricalBars(meta.symbol, config, 120);
    upsertBars(meta.symbol, bars);

    const setup = buildSetup(meta.symbol, bars, {
      liquidityScore: meta.liquidityScore,
      dataSource,
      timeframe: "daily",
    });

    if (setup && setup.confidence >= 40) {
      upsertSetup(setup);
      createAlert({
        id: `alert-${setup.id}`,
        symbol: setup.symbol,
        message: `${setup.bias.toUpperCase()} setup (${setup.confidence}% confidence): ${setup.events.join(", ")}`,
        type: "setup",
        createdAt: Date.now(),
      });
    }

    const analysis = analyzeBars(bars);
    const recentSweep = analysis.sweeps[analysis.sweeps.length - 1];
    if (recentSweep && bars[bars.length - 1].time === recentSweep.time) {
      createAlert({
        id: `sweep-${meta.symbol}-${recentSweep.time}`,
        symbol: meta.symbol,
        message: `Liquidity sweep detected (${recentSweep.direction})`,
        type: "sweep",
        createdAt: Date.now(),
      });
    }
  }

  setMeta("lastRefresh", String(refreshedAt));
  setMeta("dataSource", dataSource);

  return { refreshedAt, dataSource, symbols: DSE_LIQUID_SYMBOLS.length };
}

export async function getMarketPulse() {
  const config = getMansaConfig();
  const indices = await fetchDseIndices(config);
  const snapshots = await fetchAllSnapshots(config);
  const lastRefresh = getMeta("lastRefresh");
  const dataSource = getMeta("dataSource") ?? getDataSourceLabel(config);

  const attention = DSE_LIQUID_SYMBOLS.map((meta) => {
    const bars = getBars(meta.symbol);
    const setup = buildSetup(meta.symbol, bars, {
      liquidityScore: meta.liquidityScore,
      dataSource,
    });
    return { symbol: meta.symbol, setup, liquidityScore: meta.liquidityScore };
  })
    .filter((a) => a.setup && a.setup.confidence >= 35)
    .sort((a, b) => (b.setup?.confidence ?? 0) - (a.setup?.confidence ?? 0))
    .slice(0, 8);

  return {
    indices,
    snapshots,
    attention,
    lastRefresh: lastRefresh ? Number(lastRefresh) : null,
    dataSource,
  };
}

export function getSymbolAnalysis(symbol: string) {
  const bars = getBars(symbol);
  const meta = DSE_LIQUID_SYMBOLS.find((s) => s.symbol === symbol);
  const dataSource = getMeta("dataSource") ?? "cached";
  const analysis = analyzeBars(bars);
  const setup = buildSetup(symbol, bars, {
    liquidityScore: meta?.liquidityScore ?? 50,
    dataSource,
  });
  return { bars, analysis, setup, meta };
}
