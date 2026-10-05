import { describe, expect, it } from "vitest";
import { savedAtLabel } from "./dates";

describe("savedAtLabel", () => {
  const now = new Date(2026, 9, 5, 14, 30);
  const at = (...args: [number, number, number, number?, number?]) => new Date(...args).toISOString();

  it("says Just now for the last minute", () => expect(savedAtLabel(new Date(now.getTime() - 20_000).toISOString(), now, "en-GB")).toBe("Just now"));
  it("shows the time for earlier today", () => expect(savedAtLabel(at(2026, 9, 5, 9, 41), now, "en-GB")).toBe("Today, 09:41"));
  it("says Yesterday", () => expect(savedAtLabel(at(2026, 9, 4, 23, 0), now, "en-GB")).toBe("Yesterday"));
  it("shows day and month this year", () => expect(savedAtLabel(at(2026, 9, 2), now, "en-GB")).toBe("2 Oct"));
  it("adds the year for older dates", () => expect(savedAtLabel(at(2025, 9, 2), now, "en-GB")).toBe("2 Oct 2025"));
});
