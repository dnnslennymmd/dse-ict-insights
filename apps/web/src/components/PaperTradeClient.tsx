"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PaperTrade } from "@dse/shared";
import { DSE_TRADING_FEE_RATE } from "@dse/shared";
import { estimateFees } from "@dse/ict-engine";

export function PaperTradeClient({
  initialTrades,
  defaultSymbol,
}: {
  initialTrades: PaperTrade[];
  defaultSymbol?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sym = defaultSymbol ?? searchParams.get("symbol") ?? "CRDB";

  const [symbol, setSymbol] = useState(sym);
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [shares, setShares] = useState("");
  const [stop, setStop] = useState("");
  const [target, setTarget] = useState("");
  const [thesis, setThesis] = useState("");
  const [emotion, setEmotion] = useState("");
  const [loading, setLoading] = useState(false);

  async function openTrade() {
    setLoading(true);
    await fetch("/api/paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "open",
        symbol,
        direction,
        entryPrice: Number(entryPrice),
        shares: Number(shares),
        stop: Number(stop),
        target: Number(target),
        thesis,
        emotion,
      }),
    });
    router.refresh();
    setLoading(false);
  }

  async function closeTrade(id: string, exitPrice: number) {
    setLoading(true);
    await fetch("/api/paper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", id, exitPrice }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold">Open Paper Trade</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-slate-400">Symbol</span>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Direction</span>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "long" | "short")}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Entry price (TZS)</span>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Shares</span>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Stop</span>
            <input
              type="number"
              value={stop}
              onChange={(e) => setStop(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-400">Target</span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
            />
          </label>
        </div>
        <label className="space-y-1 block text-sm">
          <span className="text-slate-400">Thesis (why this trade?)</span>
          <textarea
            value={thesis}
            onChange={(e) => setThesis(e.target.value)}
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
          />
        </label>
        <label className="space-y-1 block text-sm">
          <span className="text-slate-400">Emotion state</span>
          <input
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="calm, FOMO, revenge..."
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2"
          />
        </label>
        <button
          onClick={openTrade}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Open paper trade
        </button>
      </div>

      <div className="card overflow-hidden">
        <h2 className="font-semibold p-4 border-b border-[var(--border)]">Open & Closed Trades</h2>
        {initialTrades.length === 0 ? (
          <p className="p-4 text-slate-500 text-sm">No paper trades yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-[var(--border)]">
              <tr>
                <th className="text-left p-3">Symbol</th>
                <th className="text-left p-3">Dir</th>
                <th className="text-right p-3">Entry</th>
                <th className="text-right p-3">Shares</th>
                <th className="text-right p-3">P&L</th>
                <th className="text-right p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {initialTrades.map((t) => {
                const posValue = t.entryPrice * t.shares;
                const fees = estimateFees(posValue, DSE_TRADING_FEE_RATE);
                return (
                  <tr key={t.id} className="border-b border-[var(--border)]">
                    <td className="p-3 font-mono">{t.symbol}</td>
                    <td className="p-3">{t.direction}</td>
                    <td className="p-3 text-right font-mono">{t.entryPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono">{t.shares}</td>
                    <td className="p-3 text-right font-mono">
                      {t.pnl != null
                        ? `${t.pnl.toLocaleString()} TZS`
                        : "—"}
                    </td>
                    <td className="p-3 text-right">{t.status}</td>
                    <td className="p-3">
                      {t.status === "open" && (
                        <button
                          onClick={() => closeTrade(t.id, t.target)}
                          disabled={loading}
                          className="text-xs text-green-400 hover:text-green-300"
                        >
                          Close at target
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
