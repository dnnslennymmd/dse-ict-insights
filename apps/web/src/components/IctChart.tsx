"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";
import type { Bar, FVGZone, LiquidityPool, OrderBlock, SweepEvent, SwingPoint } from "@dse/shared";

type ChartOverlays = {
  swings: SwingPoint[];
  pools: LiquidityPool[];
  sweeps: SweepEvent[];
  fvgs: FVGZone[];
  orderBlocks: OrderBlock[];
};

function toChartTime(ms: number): Time {
  return (ms / 1000) as Time;
}

export function IctChart({
  bars,
  overlays,
  height = 420,
}: {
  bars: Bar[];
  overlays: ChartOverlays;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "#111827" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      timeScale: { borderColor: "#1f2937" },
      rightPriceScale: { borderColor: "#1f2937" },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const candleData: CandlestickData[] = bars.map((b) => ({
      time: toChartTime(b.time),
      open: b.open,
      high: b.high,
      low: b.low,
      close: b.close,
    }));
    series.setData(candleData);

    // FVG zones as price lines
    overlays.fvgs
      .filter((f) => !f.mitigated)
      .slice(-5)
      .forEach((fvg) => {
        series.createPriceLine({
          price: fvg.top,
          color: fvg.direction === "bullish" ? "#22c55e" : "#ef4444",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: "FVG",
        });
        series.createPriceLine({
          price: fvg.bottom,
          color: fvg.direction === "bullish" ? "#22c55e" : "#ef4444",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: false,
        });
      });

    // Liquidity pool levels
    overlays.pools.slice(-4).forEach((pool) => {
      series.createPriceLine({
        price: pool.level,
        color: "#f59e0b",
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
        title: pool.type === "buy-side" ? "BSL" : "SSL",
      });
    });

    // Order blocks
    overlays.orderBlocks
      .filter((ob) => !ob.mitigated)
      .slice(-3)
      .forEach((ob) => {
        series.createPriceLine({
          price: (ob.top + ob.bottom) / 2,
          color: "#8b5cf6",
          lineWidth: 1,
          lineStyle: 0,
          axisLabelVisible: true,
          title: "OB",
        });
      });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [bars, overlays, height]);

  const recentSweeps = overlays.sweeps.slice(-3);

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
      {recentSweeps.length > 0 && (
        <p className="text-xs text-slate-500">
          Recent sweeps: {recentSweeps.map((s) => `${s.direction} @ bar ${s.index}`).join(", ")}
        </p>
      )}
      <div className="flex gap-3 text-xs text-slate-500">
        <span className="text-green-400">■ FVG</span>
        <span className="text-amber-400">■ Liquidity</span>
        <span className="text-violet-400">■ Order Block</span>
      </div>
    </div>
  );
}
