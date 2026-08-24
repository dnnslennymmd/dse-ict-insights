import { NextResponse } from "next/server";
import { markAlertRead } from "@/lib/store";

export async function POST(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  markAlertRead(id);
  return NextResponse.json({ ok: true });
}
