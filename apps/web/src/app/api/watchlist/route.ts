import { NextResponse } from "next/server";
import { addToWatchlist, removeFromWatchlist } from "@/lib/store";

export async function POST(req: Request) {
  const { symbol } = await req.json();
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
  addToWatchlist(symbol.toUpperCase());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { symbol } = await req.json();
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });
  removeFromWatchlist(symbol.toUpperCase());
  return NextResponse.json({ ok: true });
}
