import { useState } from "react";
import { currencies, type Currency } from "./currencies";

type Props = {
  value: Currency;
  onChange: (code: string) => void;
};

export function CurrencyPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const matches = currencies.filter((item) =>
    `${item.code} ${item.name}`.toLowerCase().includes(search.toLowerCase()),
  );

  const select = (code: string) => {
    onChange(code);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full sm:w-64">
      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Currency</span>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-left text-sm outline-none transition hover:border-zinc-700 focus:border-lime-300">
        <span className="flex items-center gap-3"><span className="text-lg">{value.flag}</span><span><strong className="block text-zinc-100">{value.code}</strong><span className="text-xs text-zinc-500">{value.name}</span></span></span>
        <span className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-2 shadow-2xl shadow-black/40 animate-fade-up">
          <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search currency..." className="mb-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-lime-300" />
          <div className="max-h-72 overflow-y-auto">
            {matches.map((item) => (
              <button type="button" key={item.code} onClick={() => select(item.code)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-zinc-800 ${item.code === value.code ? "bg-lime-300/10 text-lime-300" : "text-zinc-200"}`}>
                <span className="text-lg">{item.flag}</span><span className="flex-1"><strong className="block text-sm">{item.code}</strong><span className="text-xs text-zinc-500">{item.name}</span></span>{item.code === value.code && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
