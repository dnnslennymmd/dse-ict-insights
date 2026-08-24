"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { JournalEntry } from "@dse/shared";

export function JournalClient({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("CRDB");
  const [content, setContent] = useState("");
  const [emotion, setEmotion] = useState("");
  const [outcome, setOutcome] = useState("");

  async function addEntry() {
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, content, emotion, outcome }),
    });
    setContent("");
    setEmotion("");
    setOutcome("");
    router.refresh();
  }

  function exportCsv() {
    window.open("/api/journal/export", "_blank");
  }

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold">New Journal Entry</h2>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol"
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you see? What was your plan?"
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            placeholder="Emotion"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
          />
          <input
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Outcome"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={addEntry}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm"
          >
            Save entry
          </button>
          <button
            onClick={exportCsv}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((e) => (
          <div key={e.id} className="card p-4">
            <div className="flex justify-between text-sm">
              <span className="font-mono font-bold">{e.symbol}</span>
              <span className="text-slate-500">{new Date(e.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm">{e.content}</p>
            {(e.emotion || e.outcome) && (
              <p className="mt-2 text-xs text-slate-500">
                {e.emotion && `Emotion: ${e.emotion}`}
                {e.emotion && e.outcome && " · "}
                {e.outcome && `Outcome: ${e.outcome}`}
              </p>
            )}
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-slate-500 text-sm">No journal entries yet.</p>
        )}
      </div>
    </div>
  );
}
