import { describe, expect, it } from "vitest";
import { calculateSavings, isMoneyDraft } from "./savings";

describe("calculateSavings", () => {
  it("computes monthly, yearly, rate and months to goal", () => {
    expect(calculateSavings({ income: 5000, expenses: 3500, goal: 10000 })).toEqual({
      monthly: 1500,
      yearly: 18000,
      rate: 30,
      goal: 10000,
      monthsToGoal: 7,
    });
  });

  it("never reports negative savings", () => {
    const s = calculateSavings({ income: 1000, expenses: 1500, goal: 500 });
    expect(s.monthly).toBe(0);
    expect(s.rate).toBe(0);
    expect(s.monthsToGoal).toBeNull();
  });

  it("handles zero income and invalid numbers", () => {
    const s = calculateSavings({ income: 0, expenses: Number.NaN, goal: -5 });
    expect(s).toMatchObject({ monthly: 0, rate: 0, goal: 0, monthsToGoal: null });
  });
});

describe("isMoneyDraft", () => {
  it.each(["", "0", "5000", "12.", "12.3", "12.34"])("accepts %j", (v) => {
    expect(isMoneyDraft(v)).toBe(true);
  });

  it.each(["abc", "1.234", "-1", "1,000", "1e5"])("rejects %j", (v) => {
    expect(isMoneyDraft(v)).toBe(false);
  });
});
