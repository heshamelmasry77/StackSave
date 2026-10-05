import { useState } from "react";
import { CURRENCIES, type CurrencyCode } from "@shared/currencies";
import { Sheet } from "../../components/Sheet";

type Props = {
  value: CurrencyCode;
  /** Currencies the person already saved in, most recent first. */
  used: CurrencyCode[];
  onPick: (code: CurrencyCode) => void;
  onClose: () => void;
};

export function CurrencySheet({ value, used, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = CURRENCIES.filter((c) => !q || `${c.code} ${c.name}`.toLowerCase().includes(q));
  const pick = (code: CurrencyCode) => {
    onPick(code);
    onClose();
  };

  return (
    <Sheet title="Currency" onClose={onClose}>
      <label className="flex h-12 items-center gap-2.5 rounded-2xl border border-zinc-700 bg-zinc-950 px-3.5 focus-within:border-lime-300">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-zinc-500" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search currencies" placeholder="Search, e.g. dirham or USD" className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-500" />
      </label>

      {!q && used.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">You use</span>
          <div className="flex flex-wrap gap-2">
            {used.slice(0, 4).map((code) => (
              <button key={code} type="button" onClick={() => pick(code)} aria-pressed={code === value} className={`h-11 min-w-20 flex-1 rounded-xl text-[15px] font-bold transition ${code === value ? "bg-lime-300 text-zinc-950" : "border border-zinc-700 text-zinc-200 hover:border-zinc-500"}`}>
                {code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        <span className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">{q ? "Results" : "All currencies"}</span>
        {matches.length === 0 && <p className="py-4 text-sm text-zinc-400">No currency matches “{query}”.</p>}
        {matches.map((c) => (
          <button key={c.code} type="button" onClick={() => pick(c.code)} aria-pressed={c.code === value} className={`flex h-14 items-center gap-3 rounded-xl px-2 text-left transition hover:bg-zinc-800 ${c.code === value ? "bg-lime-950" : ""}`}>
            <span className="grid h-8 w-11 place-items-center rounded-lg bg-zinc-800 text-xs font-extrabold text-zinc-200">{c.code}</span>
            <span className="flex-1 text-[15px]">{c.name}</span>
            {c.code === value && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="text-lime-300" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
