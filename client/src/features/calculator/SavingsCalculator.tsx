import { useMemo, useState } from "react";
import { calculateSavings, isMoneyDraft } from "@shared/savings";
import type { Currency } from "./currencies";

type Props = { currency: Currency };

export function SavingsCalculator({ currency }: Props) {
  const [income, setIncome] = useState("5000");
  const [expenses, setExpenses] = useState("3500");
  const [goal, setGoal] = useState("10000");

  const values = useMemo(
    () => calculateSavings({ income: Number(income), expenses: Number(expenses), goal: Number(goal) }),
    [income, expenses, goal],
  );

  const money = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: currency.code, maximumFractionDigits: 0 }).format(n);

  const fields = [
    { label: "Monthly income", value: income, set: setIncome, optional: false },
    { label: "Monthly expenses", value: expenses, set: setExpenses, optional: false },
    { label: "Savings goal", value: goal, set: setGoal, optional: true },
  ];

  return (
    <>
      <section className="mb-5 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/60 p-6 sm:p-10 animate-fade-up animation-delay-100 hover:border-zinc-700 transition-colors duration-300">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Your savings</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] sm:text-7xl tabular-nums">{money(values.monthly)} <span className="text-lg font-medium tracking-normal text-zinc-500">/ month</span></h1>
            <p className="mt-4 text-sm text-zinc-500">You’re keeping <strong className="text-lime-300">{values.rate.toFixed(1)}%</strong> of your monthly income.</p>
          </div>
          <div className="rounded-2xl bg-lime-300 p-5 text-zinc-950 sm:min-w-48 animate-float-slow">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Yearly</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{money(values.yearly)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 animate-fade-up animation-delay-200 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20">
          <div className="mb-7 flex items-start justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Inputs</p><h2 className="mt-1 text-xl font-bold tracking-tight">Your monthly numbers</h2></div>
            <span className="grid size-10 place-items-center rounded-xl bg-zinc-800 text-sm font-bold text-lime-300">{currency.symbol}</span>
          </div>
          <div className="space-y-5">
            {fields.map((field) => (
              <label key={field.label} className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-400">{field.label} {field.optional && <em className="not-italic text-zinc-600">optional</em>}</span>
                <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-3 transition focus-within:border-lime-300">
                  <span className="text-zinc-600">{currency.symbol}</span>
                  <input inputMode="decimal" value={field.value} onChange={(e) => { if (isMoneyDraft(e.target.value)) field.set(e.target.value); }} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-lg font-bold outline-none" />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 animate-fade-up animation-delay-300 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Savings goal</p>
          {values.monthsToGoal ? (
            <>
              <h2 className="mt-5 text-4xl font-black tracking-tight">{values.monthsToGoal} months</h2>
              <p className="mt-2 text-sm text-zinc-500">to reach {money(values.goal)}</p>
              <div className="mt-9 h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-lime-300 transition-[width] duration-700 ease-out animate-progress-glow" style={{ width: `${Math.min(100, (values.monthly / values.goal) * 100)}%` }} /></div>
              <div className="mt-5 flex justify-between text-xs"><span className="text-zinc-500">Monthly contribution</span><strong>{money(values.monthly)}</strong></div>
            </>
          ) : (
            <div className="mt-5"><h2 className="text-3xl font-black">Set a goal</h2><p className="mt-2 text-sm text-zinc-500">Add a savings goal to see your timeline.</p></div>
          )}
        </div>
      </section>
    </>
  );
}
