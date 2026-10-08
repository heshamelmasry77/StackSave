import { useCallback, useState } from "react";
import { CircleAlertIcon, LockKeyholeIcon } from "lucide-react";
import { toast } from "sonner";
import { formatMoney, type CurrencyCode } from "@shared/currencies";
import { noteSuggestions, totalsByCurrency, usedCurrencies, type SavingEntry } from "@shared/savings";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { AccountMenu } from "@/features/auth/AccountMenu";
import { takeAuthErrorFromUrl } from "@/features/auth/authErrors";
import { SignInSheet } from "@/features/auth/SignInSheet";
import { useAuthConfig } from "@/features/auth/useAuthConfig";
import { AppLockSheet } from "@/features/lock/AppLockSheet";
import { LockOffer } from "@/features/lock/LockOffer";
import { LockScreen } from "@/features/lock/LockScreen";
import { dismissLockOffer, isLockOfferDismissed } from "@/features/lock/lockStore";
import { useAppLock } from "@/features/lock/useAppLock";
import { useInstallPrompt } from "@/features/pwa/useInstallPrompt";
import { BackupNudge } from "@/features/savings/BackupNudge";
import { CurrencySheet } from "@/features/savings/CurrencySheet";
import { History } from "@/features/savings/History";
import { EditSavingSheet } from "@/features/savings/EditSavingSheet";
import { SaveCard } from "@/features/savings/SaveCard";
import { TotalHero } from "@/features/savings/TotalHero";
import { usePreferredCurrency } from "@/features/savings/usePreferredCurrency";
import { useSavings } from "@/features/savings/useSavings";
import { authClient } from "@/lib/authClient";
import { readJson, writeJson } from "@/lib/storage";

const NUDGE_DISMISSED_KEY = "stacksave.backupNudgeDismissed";

function App() {
  const { data: session, isPending } = authClient.useSession();
  const userId = isPending ? undefined : (session?.user.id ?? null);
  const savings = useSavings(userId);
  const [currency, setCurrency] = usePreferredCurrency();
  const authConfig = useAuthConfig();
  const { canInstall, install } = useInstallPrompt();
  const lock = useAppLock();

  // A failed magic-link / Google callback lands back here with ?error=..., so open sign-in to explain.
  const [urlError] = useState(takeAuthErrorFromUrl);
  const [signInOpen, setSignInOpen] = useState(urlError !== null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [editing, setEditing] = useState<SavingEntry | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(() => readJson(NUDGE_DISMISSED_KEY) === true);
  const [lockSheetOpen, setLockSheetOpen] = useState(false);
  const [lockOfferDismissed, setLockOfferDismissed] = useState(isLockOfferDismissed);

  const canSignIn = authConfig !== null && (authConfig.google || authConfig.magicLink);
  const onDevice = savings.mode === "device" && savings.entries.length > 0;
  const showNudge = onDevice && canSignIn && !nudgeDismissed;
  const showBackupBadge = onDevice && canSignIn && nudgeDismissed;
  // Opt-in lock offer: once there's something worth protecting, and never on top of the backup nudge.
  const showLockOffer = !lock.enabled && !lockOfferDismissed && !showNudge && savings.entries.length >= 2;

  const dismissNudge = () => {
    setNudgeDismissed(true);
    writeJson(NUDGE_DISMISSED_KEY, true);
  };

  const removeEntry = (entry: SavingEntry) => {
    void savings.remove(entry);
    toast(`Removed +${formatMoney(entry.amount, entry.currency)}`, {
      duration: 6000,
      action: { label: "Undo", onClick: () => savings.restore(entry) },
    });
  };
  const closeSignIn = useCallback(() => setSignInOpen(false), []);
  const closeLockSheet = useCallback(() => setLockSheetOpen(false), []);
  const dismissOffer = () => {
    dismissLockOffer();
    setLockOfferDismissed(true);
  };

  // Forgot PIN: signed in → sign in again (data comes back from the account); signed out → erase this device's saves.
  const resetLock = async () => {
    if (session) {
      await authClient.signOut();
      lock.disable();
      setSignInOpen(true);
    } else {
      savings.clearDevice();
      lock.disable();
      toast("Lock removed and this device's saves erased");
    }
  };

  const closeCurrencies = useCallback(() => setCurrencyOpen(false), []);
  const closeEditor = useCallback(() => setEditing(null), []);
  const suggestions = noteSuggestions(savings.entries);

  const latest = savings.entries[0];
  const carried = onDevice
    ? {
        count: savings.entries.length,
        totals: Object.entries(totalsByCurrency(savings.entries)).map(([code, total]) => formatMoney(total!, code as CurrencyCode)),
      }
    : null;

  // After every hook above: an early return before them would change the hook order between renders.
  if (lock.locked) {
    return (
      <>
        <LockScreen lock={lock} signedIn={Boolean(session)} onReset={() => void resetLock()} />
        <Toaster position="bottom-center" />
      </>
    );
  }

  return (
    <div className="min-h-dvh">
      <main className="mx-auto animate-page-in flex max-w-md flex-col gap-5 px-5 pb-28 pt-5">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-[10px] bg-primary text-base font-extrabold text-primary-foreground" aria-hidden="true">S</div>
            <span className="text-lg font-bold tracking-tight">SlackSave</span>
          </div>
          <div className="flex items-center gap-2">
            {canInstall && (
              <Button variant="outline" size="sm" onClick={() => void install()} className="border-primary/30 bg-primary/10 font-bold text-primary hover:bg-primary/20 hover:text-primary">Install</Button>
            )}
            {showBackupBadge && (
              <Button variant="outline" size="sm" onClick={() => setSignInOpen(true)} className="rounded-full border-warning-border bg-warning-surface text-[13px] text-warning hover:bg-warning-surface hover:text-warning dark:border-warning-border dark:bg-warning-surface dark:hover:bg-warning-surface">
                <CircleAlertIcon className="size-3.5" />
                Not backed up
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setLockSheetOpen(true)} aria-label={lock.enabled ? "App lock settings (on)" : "App lock settings"} className={lock.enabled ? "text-primary" : "text-muted-foreground"}>
              <LockKeyholeIcon />
            </Button>
            {session ? (
              <AccountMenu user={session.user} />
            ) : (
              !isPending && canSignIn && !showBackupBadge && (
                <Button variant="outline" size="sm" onClick={() => setSignInOpen(true)} className="h-10 bg-card px-3.5">Sign in</Button>
              )
            )}
          </div>
        </header>

        <TotalHero entries={savings.entries} currency={currency} onPickCurrency={setCurrency} />

        <SaveCard
          currency={currency}
          disabled={savings.mode === "loading"}
          noteSuggestions={suggestions}
          onOpenCurrencies={() => setCurrencyOpen(true)}
          onSave={(amount, note) => savings.add(amount, currency, note)}
        />

        {savings.error && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 py-1 pl-4 pr-1 text-sm text-red-200">
            {savings.error}
            <Button variant="ghost" size="sm" onClick={savings.dismissError} className="text-red-100">OK</Button>
          </div>
        )}

        {showNudge && latest && (
          <BackupNudge lastSaved={formatMoney(latest.amount, latest.currency)} onKeepSafe={() => setSignInOpen(true)} onDismiss={dismissNudge} />
        )}

        {showLockOffer && <LockOffer onSetUp={() => setLockSheetOpen(true)} onDismiss={dismissOffer} />}

        <History entries={savings.entries} onEdit={setEditing} onRemove={removeEntry} />
      </main>

      {currencyOpen && <CurrencySheet value={currency} used={usedCurrencies(savings.entries)} onPick={setCurrency} onClose={closeCurrencies} />}
      {editing && (
        <EditSavingSheet
          entry={editing}
          usedCurrencies={usedCurrencies(savings.entries)}
          noteSuggestions={suggestions}
          onSave={(changes) => {
            void savings.update(editing, changes);
            toast("Save updated");
          }}
          onDelete={() => removeEntry(editing)}
          onClose={closeEditor}
        />
      )}
      {lockSheetOpen && <AppLockSheet lock={lock} onClose={closeLockSheet} />}
      {signInOpen && authConfig && <SignInSheet config={authConfig} initialError={urlError} carried={carried} onClose={closeSignIn} />}
      <Toaster position="bottom-center" />
    </div>
  );
}

export default App;
