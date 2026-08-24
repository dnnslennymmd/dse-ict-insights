import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">DSE ICT Playbook</h1>
        <p className="text-slate-400 text-sm mt-1">
          How to read one setup on DSE—not generic forex content
        </p>
      </div>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold text-green-400">1. DSE session timing</h2>
        <p className="text-sm text-slate-300">
          DSE trades 9:00–16:00 East Africa Time. The opening auction at 9:30 often produces
          displacement—similar to ICT kill zones but localized. Our tool maps{" "}
          <strong>morning drive (9:31–10:31)</strong>, midday chop, and closing hour instead of
          London/NY sessions.
        </p>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold text-green-400">2. Example: CRDB liquidity sweep</h2>
        <p className="text-sm text-slate-300">
          On liquid banks like <Link href="/symbol/CRDB" className="text-green-400 hover:underline">CRDB</Link>,
          watch for price to wick above a recent equal-high cluster (buy-side liquidity), then close back
          below. That sweep often precedes a bearish shift—or sets up a bullish reversal if sell-side was
          swept instead.
        </p>
        <ol className="text-sm text-slate-400 space-y-2 list-decimal list-inside">
          <li>Mark swing highs/lows on daily chart</li>
          <li>Identify equal highs (buy-side liquidity pool)</li>
          <li>Wait for sweep + close back inside range</li>
          <li>Look for displacement candle leaving a Fair Value Gap</li>
          <li>Entry at FVG or Order Block with stop beyond invalidation</li>
        </ol>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold text-green-400">3. Example: NMB opening displacement</h2>
        <p className="text-sm text-slate-300">
          <Link href="/symbol/NMB" className="text-green-400 hover:underline">NMB</Link> frequently
          moves on bank-sector sentiment. After the 9:30 auction, a strong-bodied candle with minimal wicks
          signals institutional sponsorship. The last down-close candle before that move is your bullish order
          block. Target the opposite side liquidity (previous swing high).
        </p>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold text-green-400">4. Risk on DSE</h2>
        <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
          <li>Size positions in TZS—use 1–2% risk per trade</li>
          <li>Factor ~2.38% total fees on round trip (broker + DSE + CMSA + CDS)</li>
          <li>Settlement is T+2—plan holds accordingly</li>
          <li>Thin names (low liquidity score) produce fewer clean ICT patterns</li>
        </ul>
      </section>

      <section className="card p-5 space-y-3">
        <h2 className="text-lg font-semibold text-green-400">5. Execution workflow</h2>
        <p className="text-sm text-slate-300">
          This app builds the plan. You execute in{" "}
          <strong>Hisa Kiganjani</strong> or your licensed broker app. Never trade without a written
          thesis—use the{" "}
          <Link href="/paper" className="text-green-400 hover:underline">paper trader</Link> first, then{" "}
          <Link href="/journal" className="text-green-400 hover:underline">journal</Link> every decision.
        </p>
      </section>

      <p className="text-xs text-slate-500 border-t border-[var(--border)] pt-4">
        ICT concepts are educational frameworks. They do not guarantee profits. DSE liquidity is thinner
        than major FX markets—expect fewer A+ setups and wider spreads on small caps.
      </p>
    </div>
  );
}
