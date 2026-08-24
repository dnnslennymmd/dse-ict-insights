import Link from "next/link";
import { DSE_LIQUID_SYMBOLS } from "@dse/shared";
import { getWatchlist, getAlerts } from "@/lib/store";
import { WatchlistActions } from "@/components/WatchlistActions";
import { AlertFeed } from "@/components/AlertFeed";

export const dynamic = "force-dynamic";

export default function WatchlistPage() {
  const watchlist = getWatchlist();
  const alerts = getAlerts(30);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Watchlist & Alerts</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track liquid DSE names and ICT event alerts
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3">Your Watchlist</h2>
        {watchlist.length === 0 ? (
          <p className="text-slate-500 text-sm mb-4">No symbols watched yet. Add from the list below.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {watchlist.map((sym) => (
              <div key={sym} className="card p-3 flex items-center justify-between">
                <Link href={`/symbol/${sym}`} className="font-mono font-bold hover:text-green-400">
                  {sym}
                </Link>
                <WatchlistActions symbol={sym} isWatched={true} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Add to Watchlist</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DSE_LIQUID_SYMBOLS.map((meta) => (
            <div key={meta.symbol} className="card p-3 flex items-center justify-between gap-2">
              <Link href={`/symbol/${meta.symbol}`} className="text-sm font-mono">
                {meta.symbol}
              </Link>
              <WatchlistActions symbol={meta.symbol} isWatched={watchlist.includes(meta.symbol)} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Alert Feed</h2>
        <AlertFeed alerts={alerts} />
      </section>
    </div>
  );
}
