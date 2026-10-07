import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (pin: string) => void;
  /** Called when the PIN reaches this many digits (e.g. to unlock without pressing a button). */
  completeAt?: number;
  onComplete?: (pin: string) => void;
  hint?: string;
  error?: string | null;
  autoFocus?: boolean;
  disabled?: boolean;
};

/** Digits-only, masked PIN input (4–6 digits) with the numeric keyboard on phones. */
export function PinField({ id, label, value, onChange, completeAt, onComplete, hint, error, autoFocus, disabled }: Props) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-semibold text-foreground/85">{label}</Label>
      {hint && <p id={`${id}-hint`} className="-mt-1 text-[13px] text-muted-foreground">{hint}</p>}
      <Input
        id={id}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        maxLength={6}
        value={value}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
          onChange(pin);
          if (completeAt && pin.length === completeAt) onComplete?.(pin);
        }}
        className={cn("h-14 text-center text-2xl tracking-[0.5em]", error && "border-destructive")}
      />
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
