import { NextResponse } from "next/server";
import { refreshMarketData } from "@/lib/market";

export async function POST() {
  const result = await refreshMarketData();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await refreshMarketData();
  return NextResponse.json(result);
}
