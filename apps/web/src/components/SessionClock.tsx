import { dseSessionContext } from "@dse/ict-engine";

export function SessionClock() {
  const ctx = dseSessionContext(Date.now());
  const now = new Date();
  const eat = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const timeStr = eat.toISOString().slice(11, 16);

  const phaseColors: Record<string, string> = {
    "pre-open": "text-yellow-400",
    auction: "text-orange-400",
    continuous: "text-green-400",
    close: "text-red-400",
    "after-hours": "text-slate-400",
  };

  return (
    <div className="card px-4 py-3 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">DSE Session (EAT)</p>
        <p className="text-lg font-mono">{timeStr}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${phaseColors[ctx.phase] ?? "text-slate-300"}`}>
          {ctx.label}
        </p>
        <p className="text-xs text-slate-500">Quality modifier: {(ctx.qualityModifier * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
}
