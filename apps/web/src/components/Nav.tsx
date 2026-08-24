import Link from "next/link";

const links = [
  { href: "/", label: "Market Pulse" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/paper", label: "Paper Trade" },
  { href: "/journal", label: "Journal" },
  { href: "/learn", label: "Learn" },
];

export function Nav() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        <Link href="/" className="font-bold text-lg">
          <span className="text-[var(--accent)]">DSE</span> ICT Insights
        </Link>
        <nav className="flex gap-4 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
