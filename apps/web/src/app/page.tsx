import Link from "next/link";
import { SessionClock } from "@/components/SessionClock";
import { getMarketPulse, refreshMarketData } from "@/lib/market";
import { getBars } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const barsExist = getBars("CRDB").length > 0;
  if (!barsExist) {
    await refreshMarketData();
  }

  const pulse = await getMarketPulse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Market Pulse</h1>
        <p className="text-slate-400 text-sm mt-1">
          ICT-style structure and liquidity on Dar es Salaam Stock Exchange
        </p>
        {pulse.lastRefresh && (
          <p className="text-xs text-slate-500 mt-1">
            Data: {pulse.dataSource} · Last refresh:{" "}
            {new Date(pulse.lastRefresh).toLocaleString()}
          </p>
        )}
      </div>

      <SessionClock />

      <section>
        <h2 className="text-lg font-semibold mb-3">Indices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {pulse.indices.map((idx) => (
            <div key={idx.code} className="card p-4">
              <p className="text-sm text-slate-400">{idx.name}</p>
              <p className="text-2xl font-mono font-bold">{idx.value.toFixed(2)}</p>
              <p
                className={`text-sm ${idx.changePct >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {idx.changePct >= 0 ? "+" : ""}{idx.changePct.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">ICT Attention</h2>
        <p className="text-sm text-slate-400 mb-3">
          Symbols with fresh structure + liquidity confluence today
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pulse.attention.map((item) => (
            <Link
              key={item.symbol}
              href={`/symbol/${item.symbol}`}
              className="card p-4 hover:border-green-500/50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">{item.symbol}</span>
                <span className="text-green-400 font-mono">{item.setup?.confidence}%</span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {item.setup?.bias} · Liquidity {item.liquidityScore}
              </p>
              <p className="text-xs text-slate-500 mt-2 truncate">
                {item.setup?.events.join(" · ")}
              </p>
            </Link>
          ))}
          {pulse.attention.length === 0 && (
            <p className="text-slate-500 text-sm">No high-confidence setups detected. Check individual symbols.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Top Movers</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-[var(--border)]">
              <tr>
                <th className="text-left p-3">Symbol</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3">Change</th>
                <th className="text-right p-3">Volume</th>
              </tr>
            </thead>
            <tbody>
              {pulse.snapshots
                .sort((a, b) => b.changePct - a.changePct)
                .slice(0, 10)
                .map((s) => (
                  <tr key={s.symbol} className="border-b border-[var(--border)] last:border-0">
                    <td className="p-3">
                      <Link href={`/symbol/${s.symbol}`} className="hover:text-green-400">
                        {s.symbol}
                      </Link>
                      <span className="text-slate-500 text-xs block">{s.name}</span>
                    </td>
                    <td className="p-3 text-right font-mono">{s.price.toFixed(2)}</td>
                    <td
                      className={`p-3 text-right font-mono ${s.changePct >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {s.changePct >= 0 ? "+" : ""}{s.changePct.toFixed(2)}%
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {s.volume.toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
