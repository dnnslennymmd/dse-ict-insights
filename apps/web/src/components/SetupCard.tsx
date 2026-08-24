import type { TradeSetup } from "@dse/shared";
import { DSE_TRADING_FEE_RATE } from "@dse/shared";
import {
  calculatePositionSize,
  estimateFees,
} from "@dse/ict-engine";

export function SetupCard({
  setup,
  capitalTzs = 1000000,
  riskPct = 2,
}: {
  setup: TradeSetup;
  capitalTzs?: number;
  riskPct?: number;
}) {
  const entryMid = (setup.entryZone.top + setup.entryZone.bottom) / 2;
  const sizing = calculatePositionSize(capitalTzs, riskPct, entryMid, setup.stop);
  const fees = estimateFees(sizing.positionValue, DSE_TRADING_FEE_RATE);

  const biasClass =
    setup.bias === "bullish" ? "badge-bullish" : setup.bias === "bearish" ? "badge-bearish" : "badge-neutral";

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{setup.symbol} Setup</h3>
          <p className="text-xs text-slate-500">
            {setup.timeframe} · {new Date(setup.detectedAt).toLocaleString()} · {setup.dataSource}
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${biasClass}`}>
          {setup.bias}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Confidence</p>
          <p className="font-mono text-lg">{setup.confidence}%</p>
        </div>
        <div>
          <p className="text-slate-500">Liquidity score</p>
          <p className="font-mono text-lg">{setup.liquidityScore}</p>
        </div>
        <div>
          <p className="text-slate-500">Draw on liquidity</p>
          <p className="font-mono">{setup.drawOnLiquidity.toFixed(2)} TZS</p>
        </div>
        <div>
          <p className="text-slate-500">Session</p>
          <p className="text-sm">{setup.session.label}</p>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Entry zone</span>
          <span className="font-mono">
            {setup.entryZone.bottom.toFixed(2)} – {setup.entryZone.top.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Stop / Invalidation</span>
          <span className="font-mono text-red-400">{setup.stop.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Target</span>
          <span className="font-mono text-green-400">{setup.target.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-3 space-y-2 text-sm">
        <p className="text-slate-500">Position sizing ({riskPct}% risk on {capitalTzs.toLocaleString()} TZS)</p>
        <div className="flex justify-between">
          <span>Shares</span>
          <span className="font-mono">{sizing.shares}</span>
        </div>
        <div className="flex justify-between">
          <span>Position value</span>
          <span className="font-mono">{sizing.positionValue.toLocaleString()} TZS</span>
        </div>
        <div className="flex justify-between">
          <span>Est. fees (~2.38%)</span>
          <span className="font-mono">{fees.toLocaleString(undefined, { maximumFractionDigits: 0 })} TZS</span>
        </div>
      </div>

      {setup.events.length > 0 && (
        <ul className="text-xs text-slate-400 space-y-1 border-t border-[var(--border)] pt-3">
          {setup.events.map((e) => (
            <li key={e}>• {e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
