import { notFound } from "next/navigation";
import { IctChart } from "@/components/IctChart";
import { SetupCard } from "@/components/SetupCard";
import { getSymbolAnalysis } from "@/lib/market";
import { DSE_LIQUID_SYMBOLS } from "@dse/shared";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SymbolPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase();
  const meta = DSE_LIQUID_SYMBOLS.find((s) => s.symbol === symbol);
  if (!meta) notFound();

  const { bars, analysis, setup } = getSymbolAnalysis(symbol);
  if (bars.length === 0) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{symbol}</h1>
          <p className="text-slate-400">{meta.name} · {meta.sector} · Liquidity {meta.liquidityScore}</p>
        </div>
        <Link
          href={`/paper?symbol=${symbol}`}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
        >
          Paper trade this setup
        </Link>
      </div>

      <div className="card p-4">
        <IctChart bars={bars} overlays={analysis} />
      </div>

      {setup ? (
        <SetupCard setup={setup} />
      ) : (
        <div className="card p-5 text-slate-400 text-sm">
          No clear ICT setup on daily timeframe right now. Watch for liquidity sweeps near session opens
          or wait for displacement after the opening auction.
        </div>
      )}
    </div>
  );
}
