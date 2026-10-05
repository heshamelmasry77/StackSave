import { useCallback, useState } from "react";
import { formatMoney, type CurrencyCode } from "@shared/currencies";
import { totalsByCurrency, usedCurrencies, type SavingEntry } from "@shared/savings";
import { AccountMenu } from "./features/auth/AccountMenu";
import { takeAuthErrorFromUrl } from "./features/auth/authErrors";
import { SignInSheet } from "./features/auth/SignInSheet";
import { useAuthConfig } from "./features/auth/useAuthConfig";
import { useInstallPrompt } from "./features/pwa/useInstallPrompt";
import { BackupNudge } from "./features/savings/BackupNudge";
import { CurrencySheet } from "./features/savings/CurrencySheet";
import { History } from "./features/savings/History";
import { SaveCard } from "./features/savings/SaveCard";
import { TotalHero } from "./features/savings/TotalHero";
import { UndoToast } from "./features/savings/UndoToast";
import { usePreferredCurrency } from "./features/savings/usePreferredCurrency";
import { useSavings } from "./features/savings/useSavings";
import { authClient } from "./lib/authClient";
import { readJson, writeJson } from "./lib/storage";

const NUDGE_DISMISSED_KEY = "stacksave.backupNudgeDismissed";

function App() {
  const { data: session, isPending } = authClient.useSession();
  const userId = isPending ? undefined : (session?.user.id ?? null);
  const savings = useSavings(userId);
  const [currency, setCurrency] = usePreferredCurrency();
  const authConfig = useAuthConfig();
  const { canInstall, install } = useInstallPrompt();

  // A failed magic-link / Google callback lands back here with ?error=..., so open sign-in to explain.
  const [urlError] = useState(takeAuthErrorFromUrl);
  const [signInOpen, setSignInOpen] = useState(urlError !== null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(() => readJson(NUDGE_DISMISSED_KEY) === true);
  const [removed, setRemoved] = useState<SavingEntry | null>(null);

  const canSignIn = authConfig !== null && (authConfig.google || authConfig.magicLink);
  const onDevice = savings.mode === "device" && savings.entries.length > 0;
  const showNudge = onDevice && canSignIn && !nudgeDismissed;
  const showBackupBadge = onDevice && canSignIn && nudgeDismissed;

  const dismissNudge = () => {
    setNudgeDismissed(true);
    writeJson(NUDGE_DISMISSED_KEY, true);
  };

  const removeEntry = (entry: SavingEntry) => {
    void savings.remove(entry);
    setRemoved(entry);
  };
  const clearRemoved = useCallback(() => setRemoved(null), []);
  const closeSignIn = useCallback(() => setSignInOpen(false), []);
  const closeCurrencies = useCallback(() => setCurrencyOpen(false), []);

  const latest = savings.entries[0];
  const carried = onDevice
    ? {
        count: savings.entries.length,
        totals: Object.entries(totalsByCurrency(savings.entries)).map(([code, total]) => formatMoney(total!, code as CurrencyCode)),
      }
    : null;

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50">
      <main className="animate-page-in mx-auto flex max-w-md flex-col gap-5 px-5 pb-28 pt-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-[10px] bg-lime-300 text-base font-extrabold text-zinc-950" aria-hidden="true">S</div>
            <span className="text-lg font-bold tracking-tight">SlackSave</span>
          </div>
          <div className="flex items-center gap-2">
            {canInstall && (
              <button type="button" onClick={() => void install()} className="h-10 rounded-xl border border-lime-300/30 bg-lime-300/10 px-3 text-sm font-bold text-lime-300">Install</button>
            )}
            {showBackupBadge && (
              <button type="button" onClick={() => setSignInOpen(true)} className="flex h-9 items-center gap-1.5 rounded-full border border-amber-800 bg-amber-950 px-3 text-[13px] font-semibold text-amber-200 transition hover:border-amber-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                Not backed up
              </button>
            )}
            {session ? (
              <AccountMenu user={session.user} />
            ) : (
              !isPending && canSignIn && !showBackupBadge && (
                <button type="button" onClick={() => setSignInOpen(true)} className="h-10 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600">Sign in</button>
              )
            )}
          </div>
        </header>

        <TotalHero entries={savings.entries} currency={currency} onPickCurrency={setCurrency} />

        <SaveCard
          currency={currency}
          disabled={savings.mode === "loading"}
          onOpenCurrencies={() => setCurrencyOpen(true)}
          onSave={(amount) => savings.add(amount, currency)}
        />

        {savings.error && (
          <p role="alert" className="flex items-start justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {savings.error}
            <button type="button" onClick={savings.dismissError} className="font-bold text-red-100 underline-offset-4 hover:underline">OK</button>
          </p>
        )}

        {showNudge && latest && (
          <BackupNudge lastSaved={formatMoney(latest.amount, latest.currency)} onKeepSafe={() => setSignInOpen(true)} onDismiss={dismissNudge} />
        )}

        <History entries={savings.entries} onRemove={removeEntry} />
      </main>

      {currencyOpen && <CurrencySheet value={currency} used={usedCurrencies(savings.entries)} onPick={setCurrency} onClose={closeCurrencies} />}
      {signInOpen && authConfig && <SignInSheet config={authConfig} initialError={urlError} carried={carried} onClose={closeSignIn} />}
      {removed && (
        <UndoToast
          message={`Removed +${formatMoney(removed.amount, removed.currency)}`}
          onUndo={() => {
            savings.restore(removed);
            setRemoved(null);
          }}
          onDone={clearRemoved}
        />
      )}
    </div>
  );
}

export default App;
