const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "Just now", "Today, 09:41", "Yesterday", "2 Oct", or "2 Oct 2025" for older years. */
export function savedAtLabel(iso: string, now = new Date(), locale?: string) {
  const d = new Date(iso);
  if (now.getTime() - d.getTime() < 60_000 && now.getTime() >= d.getTime()) return "Just now";
  if (sameDay(d, now)) return `Today, ${d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
