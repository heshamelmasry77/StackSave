import type { Mail } from "./mailer";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function magicLinkEmail(to: string, url: string, expiresInMinutes: number): Mail {
  const safeUrl = escapeHtml(url);
  return {
    to,
    subject: "Your SlackSave sign-in link",
    text: `Sign in to SlackSave:\n\n${url}\n\nThis link works once and expires in ${expiresInMinutes} minutes. If you didn't ask for it, you can ignore this email.`,
    html: `<!doctype html>
<html><body style="margin:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e4e4e7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#18181b;border:1px solid #27272a;border-radius:16px">
      <tr><td style="padding:32px">
        <div style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;border-radius:10px;background:#bef264;color:#09090b;font-weight:900">S</div>
        <h1 style="margin:24px 0 8px;font-size:22px;color:#fafafa">Sign in to SlackSave</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#a1a1aa">Tap the button below to sign in. No password needed.</p>
        <a href="${safeUrl}" style="display:inline-block;background:#bef264;color:#09090b;font-weight:800;font-size:14px;text-decoration:none;padding:12px 20px;border-radius:12px">Sign in</a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#71717a">This link works once and expires in ${expiresInMinutes} minutes. If you didn't ask for it, you can ignore this email.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  };
}
