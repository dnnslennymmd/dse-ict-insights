import { NextResponse } from "next/server";
import { getJournalEntries } from "@/lib/store";

export async function GET() {
  const entries = getJournalEntries();
  const header = "id,symbol,content,emotion,outcome,created_at,trade_id\n";
  const rows = entries
    .map((e) =>
      [
        e.id,
        e.symbol,
        `"${e.content.replace(/"/g, '""')}"`,
        e.emotion ?? "",
        e.outcome ?? "",
        e.createdAt,
        e.tradeId ?? "",
      ].join(","),
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=dse-journal.csv",
    },
  });
}
