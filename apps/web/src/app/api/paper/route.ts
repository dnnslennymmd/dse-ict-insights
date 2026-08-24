import { NextResponse } from "next/server";
import { createPaperTrade, closePaperTrade, getPaperTrades } from "@/lib/store";
import { DSE_TRADING_FEE_RATE } from "@dse/shared";
import { estimateFees } from "@dse/ict-engine";

export async function GET() {
  return NextResponse.json(getPaperTrades());
}

export async function POST(req: Request) {
  const body = await req.json();

  if (body.action === "open") {
    const id = `paper-${Date.now()}`;
    createPaperTrade({
      id,
      symbol: body.symbol,
      direction: body.direction,
      entryPrice: body.entryPrice,
      shares: body.shares,
      stop: body.stop,
      target: body.target,
      status: "open",
      openedAt: Date.now(),
      thesis: body.thesis,
      emotion: body.emotion,
    });
    return NextResponse.json({ id });
  }

  if (body.action === "close") {
    const trades = getPaperTrades();
    const trade = trades.find((t) => t.id === body.id);
    if (!trade) return NextResponse.json({ error: "not found" }, { status: 404 });

    const exitPrice = body.exitPrice;
    const grossPnl =
      trade.direction === "long"
        ? (exitPrice - trade.entryPrice) * trade.shares
        : (trade.entryPrice - exitPrice) * trade.shares;
    const entryFees = estimateFees(trade.entryPrice * trade.shares, DSE_TRADING_FEE_RATE);
    const exitFees = estimateFees(exitPrice * trade.shares, DSE_TRADING_FEE_RATE);
    const fees = entryFees + exitFees;
    const pnl = grossPnl - fees;

    closePaperTrade(body.id, exitPrice, pnl, fees);
    return NextResponse.json({ pnl, fees });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}
