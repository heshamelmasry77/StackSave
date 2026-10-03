// Pure savings maths shared by the client and the server.

export type SavingsInput = {
  income: number;
  expenses: number;
  goal: number;
};

export type SavingsSummary = {
  monthly: number;
  yearly: number;
  /** Percentage of monthly income kept, 0–100. */
  rate: number;
  goal: number;
  /** Months needed to reach the goal, or null when there is no goal or nothing is saved. */
  monthsToGoal: number | null;
};

const clean = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

export function calculateSavings(input: SavingsInput): SavingsSummary {
  const income = clean(input.income);
  const expenses = clean(input.expenses);
  const goal = clean(input.goal);

  const monthly = Math.max(0, income - expenses);
  return {
    monthly,
    yearly: monthly * 12,
    rate: income ? (monthly / income) * 100 : 0,
    goal,
    monthsToGoal: goal && monthly ? Math.ceil(goal / monthly) : null,
  };
}

/** Accepts a partially typed money amount: digits with up to two decimals. */
export const isMoneyDraft = (value: string) => /^\d*(\.\d{0,2})?$/.test(value);
