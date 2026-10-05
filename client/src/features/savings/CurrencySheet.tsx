import { useState } from "react";
import { CheckIcon } from "lucide-react";
import { CURRENCIES, type CurrencyCode } from "@shared/currencies";
import { AppSheet } from "@/components/AppSheet";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

type Props = {
  value: CurrencyCode;
  /** Currencies the person already saved in, most recent first. */
  used: CurrencyCode[];
  onPick: (code: CurrencyCode) => void;
  onClose: () => void;
};

export function CurrencySheet({ value, used, onPick, onClose }: Props) {
  const [query, setQuery] = useState("");
  const pick = (code: CurrencyCode) => {
    onPick(code);
    onClose();
  };

  return (
    <AppSheet title="Currency" description="Choose the currency for your next save" onClose={onClose}>
      <Command label="Search currencies" className="h-auto overflow-visible bg-transparent">
        {/* Pinned while the list scrolls underneath. */}
        <div className="sticky top-0 z-10 -mx-1 bg-card px-1 pb-3">
          <CommandInput value={query} onValueChange={setQuery} placeholder="Search, e.g. dirham or USD" />
        </div>

        {!query && used.length > 0 && (
          <div className="flex flex-col gap-2 pb-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">You use</span>
            <div className="flex flex-wrap gap-2">
              {used.slice(0, 4).map((code) => (
                <Button key={code} variant={code === value ? "default" : "outline"} onClick={() => pick(code)} aria-pressed={code === value} className="min-w-20 flex-1 font-bold">
                  {code}
                </Button>
              ))}
            </div>
          </div>
        )}

        <CommandList className="max-h-none overflow-visible">
          <CommandEmpty className="py-4 text-sm text-muted-foreground">No currency matches “{query}”.</CommandEmpty>
          <CommandGroup heading={query ? "Results" : "All currencies"} className="p-0 **:[[cmdk-group-heading]]:px-0 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-widest">
            {CURRENCIES.map((c) => (
              <CommandItem
                key={c.code}
                value={c.code}
                keywords={[c.name]}
                onSelect={() => pick(c.code)}
                aria-selected={c.code === value}
                className={cn(c.code === value && "bg-success-surface data-[selected=true]:bg-success-surface")}
              >
                <span className="grid h-8 w-11 place-items-center rounded-lg bg-secondary text-xs font-extrabold">{c.code}</span>
                <span className="flex-1">{c.name}</span>
                {c.code === value && <CheckIcon className="size-[18px] text-primary" aria-label="Selected" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </AppSheet>
  );
}
