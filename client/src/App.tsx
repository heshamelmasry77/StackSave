import { useState } from "react";
import { CurrencyPicker } from "./features/calculator/CurrencyPicker";
import { SavingsCalculator } from "./features/calculator/SavingsCalculator";
import { findCurrency } from "./features/calculator/currencies";
import { useInstallPrompt } from "./features/pwa/useInstallPrompt";

function App() {
  const [currencyCode, setCurrencyCode] = useState("EUR");
  const currency = findCurrency(currencyCode);
  const { canInstall, install } = useInstallPrompt();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12 animate-page-in">
        <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-lime-300 font-black text-zinc-950 animate-logo-pulse">S</div>
              <span className="text-xl font-extrabold tracking-tight">SlackSave</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Know what you keep. Build what you want.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            {canInstall && <button onClick={() => void install()} className="rounded-xl border border-lime-300/30 bg-lime-300/10 px-4 py-3 text-sm font-bold text-lime-300">Install app</button>}
            <CurrencyPicker value={currency} onChange={setCurrencyCode} />
          </div>
        </header>

        <SavingsCalculator currency={currency} />

        <footer className="flex flex-col gap-2 px-1 pt-7 text-xs text-zinc-600 sm:flex-row sm:justify-between animate-fade-up animation-delay-400"><span>SlackSave</span><span>Calculations happen locally in your browser.</span></footer>
      </main>
    </div>
  );
}

export default App;
