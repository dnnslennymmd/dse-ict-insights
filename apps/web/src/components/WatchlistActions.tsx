"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function WatchlistActions({
  symbol,
  isWatched,
}: {
  symbol: string;
  isWatched: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch("/api/watchlist", {
      method: isWatched ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
    >
      {isWatched ? "−" : "+"}
    </button>
  );
}
