import { Suspense } from "react";
import { PaperTradeClient } from "@/components/PaperTradeClient";
import { getPaperTrades } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function PaperPage() {
  const trades = getPaperTrades();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paper Trading</h1>
        <p className="text-slate-400 text-sm mt-1">
          Practice ICT setups with simulated TZS positions before trading in Hisa Kiganjani
        </p>
      </div>
      <Suspense>
        <PaperTradeClient initialTrades={trades} />
      </Suspense>
    </div>
  );
}
