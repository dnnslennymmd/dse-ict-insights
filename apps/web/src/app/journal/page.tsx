import { JournalClient } from "@/components/JournalClient";
import { getJournalEntries } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function JournalPage() {
  const entries = getJournalEntries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trade Journal</h1>
        <p className="text-slate-400 text-sm mt-1">
          Document your thesis and emotions—discipline compounds over years
        </p>
      </div>
      <JournalClient entries={entries} />
    </div>
  );
}
