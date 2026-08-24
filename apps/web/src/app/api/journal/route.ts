import { NextResponse } from "next/server";
import { createJournalEntry, getJournalEntries } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getJournalEntries());
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `journal-${Date.now()}`;
  createJournalEntry({
    id,
    symbol: body.symbol,
    content: body.content,
    emotion: body.emotion,
    outcome: body.outcome,
    createdAt: Date.now(),
    tradeId: body.tradeId,
  });
  return NextResponse.json({ id });
}
