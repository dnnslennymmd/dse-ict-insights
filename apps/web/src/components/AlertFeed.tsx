"use client";

import type { AlertItem } from "@dse/shared";
import { useRouter } from "next/navigation";

export function AlertFeed({ alerts }: { alerts: AlertItem[] }) {
  const router = useRouter();

  async function markRead(id: string) {
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  if (alerts.length === 0) {
    return <p className="text-slate-500 text-sm">No alerts yet. Data refresh generates setup and sweep alerts.</p>;
  }

  return (
    <div className="space-y-2">
      {alerts.map((a) => (
        <div
          key={a.id}
          className={`card p-3 flex items-start justify-between gap-3 ${!a.read ? "border-green-500/30" : ""}`}
        >
          <div>
            <p className="font-mono text-sm font-bold">{a.symbol}</p>
            <p className="text-sm text-slate-300">{a.message}</p>
            <p className="text-xs text-slate-500 mt-1">
              {new Date(a.createdAt).toLocaleString()} · {a.type}
            </p>
          </div>
          {!a.read && (
            <button
              onClick={() => markRead(a.id)}
              className="text-xs text-green-400 hover:text-green-300 shrink-0"
            >
              Mark read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
