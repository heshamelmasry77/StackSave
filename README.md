# SlackSave

> Put money aside in two taps and watch your stack grow. One Node.js app serves both the React frontend and the Express API.

SlackSave helps you understand how much you save each month and year, measure your savings rate, and estimate how long it will take to reach a savings goal.

Type an amount, pick a currency, tap **Save it**. No account needed to start: saves stay on the device, and SlackSave then suggests a free, passwordless account so they're never lost and show up on every device.

## ✨ Features

- **Save in two taps**: amount, currency, **Save it**. Quick +10 / +50 / +100 buttons.
- **Totals per currency**: the selected currency's total is shown large and the others as chips. Amounts are never converted.
- **This month**: how much went aside in the selected currency this calendar month.
- **Notes**: optionally say where the money is kept or what it's for, in your own words. Once you've written notes, your recent ones appear as quick picks (no presets). Tap a history entry to edit it.
- **History**: every save, newest first, with its note. Tap one to **edit the amount, currency or note**, or delete it (with **Undo**).
- **No account needed to start**: saves are kept on the device. After the first save, a card offers a free account ("Keep it safe"); dismissed, it becomes a small "Not backed up" badge.
- **Moves into your account**: on sign-in, device saves are imported once (duplicates impossible: every save has a client-generated UUID), then cleared from the device.
- **Passwordless sign-in**: Google or an emailed magic link.
- **App lock (opt-in)**: unlock with fingerprint / Face ID / Windows Hello (WebAuthn platform authenticator) or a 4–6 digit PIN, on opening and after more than a minute away. The PIN is stored only as a salted PBKDF2 hash on the device; 5 wrong tries trigger a growing wait. It's a privacy screen per device, not encryption.
- **21 currencies**, with the first one guessed from the browser's region and the last choice remembered.
- **Installable PWA**, mobile-first, with the Geist font bundled for offline use.

## 🧱 Architecture

```text
one Node.js process, one URL
│
├── Express 5
│   ├── /api/auth/*  Better Auth (Google, magic link)
│   ├── /api/savings  the user's savings (session required)
│   ├── /api/*  JSON API
│   └── /*      React app
│               dev:  Vite middleware + HMR
│               prod: static dist/client + SPA fallback
│
└── shared/     pure TypeScript used by both sides
```

- **Same origin for frontend and API** — no CORS, and cookie-based sessions will just work.
- **Development** — `npm run dev` starts Express, which runs Vite inside it as middleware. One port, hot reload included.
- **Production** — `npm run build` builds the client to `dist/client` and bundles the server to `dist/server/index.js`; `npm start` runs it.
- **Security headers** — Helmet (strict Content-Security-Policy in production), gzip compression, `trust proxy` for hosting behind a TLS proxy.
- **Caching** — fingerprinted `/assets/*` are cached for a year; `index.html`, `sw.js` and the manifest always revalidate so installed PWAs pick up new releases.

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| React 19 + TypeScript | User interface |
| Vite 8 | Frontend dev server and build |
| Tailwind CSS 4 | Styling |
| shadcn/ui (Radix, vaul, cmdk, sonner) + lucide | Design system: components in `client/src/components/ui`, tokens in `client/src/index.css` |
| vite-plugin-pwa | Manifest and service worker |
| Express 5 | HTTP server and API |
| Helmet, compression | Security headers, gzip |
| Zod | Environment validation |
| esbuild, tsx | Server bundle, dev runner |
| Vitest | Unit and API tests |
| Better Auth | Passwordless auth (Google, magic link) |
| PostgreSQL + Drizzle ORM | Database and migrations |
| Nodemailer | Magic-link email over SMTP |
| Railway | Hosting |

## 📁 Project Structure

```text
StackSave/
├── client/                  # React app (Vite root)
│   ├── index.html
│   ├── public/              # favicon, PWA icon
│   └── src/
│       ├── App.tsx          # page layout
│       ├── components/      # AppSheet + ui/ (shadcn/ui components)
│       ├── main.tsx
│       ├── index.css
│       └── features/
│           ├── auth/        # sign-in dialog, account button
│           ├── lock/        # app lock: PIN hashing, WebAuthn biometric, lock screen, settings
│           ├── savings/     # SaveCard, TotalHero, History, CurrencySheet, useSavings (device ↔ account)
│           └── pwa/         # useInstallPrompt
├── server/
│   ├── src/
│   │   ├── index.ts         # HTTP server bootstrap + graceful shutdown
│   │   ├── app.ts           # Express app and /api router
│   │   ├── frontend.ts      # Vite middleware (dev) / static files (prod)
│   │   ├── env.ts           # validated environment variables
│   │   ├── auth/            # Better Auth config, requireSession
│   │   ├── db/              # Drizzle schema, client, migrator
│   │   ├── mail/            # mailer + email templates
│   │   ├── routes/          # one router per API area
│   │   └── middleware/      # errors, 404s
│   └── drizzle/             # generated SQL migrations
├── shared/                  # currencies + savings maths, used by client and server
├── railway.json             # Railway build/deploy config
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.{client,server,node}.json
```

Client code imports shared code as `@shared/...`.

## 🚀 Getting Started

Requires Node.js 24+ and Docker (for the local Postgres and mail inbox).

```bash
git clone https://github.com/heshamelmasry77/StackSave.git
cd StackSave
npm install
npm run services:up   # Postgres on :54329, Mailpit inbox on http://localhost:8026
npm run db:migrate
npm run dev           # http://localhost:3000
```

Run the production build locally:

```bash
npm run build
npm start             # needs the production env vars below
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Express + Vite with hot reload on one port (`PORT`, default 3000) |
| `npm run build` | Build the client and bundle the server (and migrator) into `dist/` |
| `npm start` | Run the production build |
| `npm run typecheck` | Type-check client, server and config |
| `npm test` | Run the Vitest suite (`RUN_DB_TESTS=1` also runs the database tests) |
| `npm run check` | Typecheck + tests + build (CI runs this on every PR) |
| `npm run services:up` / `services:down` | Start / stop local Postgres + Mailpit |
| `npm run db:generate` | Create a migration after editing `server/src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations (Railway runs this before every deploy) |
| `npm run db:studio` | Browse the database |

### Environment variables

See `.env.example`. They are validated at startup in `server/src/env.ts`. In development every variable has a working default.

| Variable | Production | Notes |
| --- | --- | --- |
| `DATABASE_URL` | required | Railway Postgres reference variable |
| `BETTER_AUTH_SECRET` | required | `openssl rand -base64 32` |
| `APP_URL` | optional | Public URL; defaults to Railway's generated domain |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | optional | Enables Google sign-in |
| `SMTP_URL` / `MAIL_FROM` | optional | Enables magic links in production |
| `PORT` | set by Railway | Default 3000 |

## 💰 Savings API

All routes need a signed-in session and only ever touch that user's rows.

| Route | What it does |
| --- | --- |
| `GET /api/savings` | The user's saves, newest first |
| `POST /api/savings` | Add `{ id, amount, currency, savedAt, note? }`. `id` is a client UUID; re-posting it is a no-op (safe retries, undo) |
| `POST /api/savings/import` | Up to 500 device saves at once (the client batches); existing ids are skipped. Returns the full list |
| `PATCH /api/savings/:id` | Edit any of `{ amount, currency, note }`; fields left out don't change (`note: null` or `""` removes the note) |
| `DELETE /api/savings/:id` | Remove one save |

Validation: amount > 0 and ≤ 1,000,000,000 with at most 4 decimals; a supported currency code; `savedAt` between 2020 and tomorrow; `note` is trimmed, whitespace collapsed, at most 200 characters. Amounts are stored as `numeric(18,4)`.

## 💱 Currency Support

| Code | Currency |
| --- | --- |
| EUR | Euro |
| USD | US Dollar |
| GBP | British Pound |
| NOK | Norwegian Krone |
| SEK | Swedish Krona |
| DKK | Danish Krone |
| CHF | Swiss Franc |
| CAD | Canadian Dollar |
| AUD | Australian Dollar |
| NZD | New Zealand Dollar |
| JPY | Japanese Yen |
| CNY | Chinese Yuan |
| INR | Indian Rupee |
| EGP | Egyptian Pound |
| AED | UAE Dirham |
| SAR | Saudi Riyal |
| QAR | Qatari Riyal |
| KWD | Kuwaiti Dinar |
| BHD | Bahraini Dinar |
| PLN | Polish Złoty |
| CZK | Czech Koruna |

Formatting uses the browser's `Intl.NumberFormat` API.

Totals are kept **per currency**. SlackSave never converts between currencies.

## 📱 PWA

SlackSave is configured as an installable Progressive Web App through `vite-plugin-pwa`.

Current PWA capabilities:

- Installable on supported browsers/devices
- Standalone app display mode
- Automatic service-worker updates
- Application-shell caching
- Offline navigation fallback
- Web app manifest
- Branded favicon and PWA icon
- In-app install prompt when supported by the browser

The PWA configuration lives in `vite.config.ts`. The service worker never serves `/api/*` requests from its cache.

## 🔐 Authentication

Passwordless only. There are no passwords anywhere.

- **Google sign-in**
- **Magic link**: enter your email and get a single-use sign-in link (expires in 15 minutes). First use creates the account.
- Fingerprint / Face ID (passkeys) is planned: [#4](https://github.com/heshamelmasry77/StackSave/issues/4).

It runs inside the Express app with [Better Auth](https://www.better-auth.com/). Users and sessions live in our own Postgres. Endpoints are under `/api/auth/*`; sessions are an HTTP-only cookie (30 days).

| Piece | Where |
| --- | --- |
| Auth config | `server/src/auth/auth.ts` |
| Protect an API route | `requireSession(auth)` in `server/src/auth/requireSession.ts` (see `routes/me.ts`) |
| Database schema | `server/src/db/schema.ts` → migrations in `server/drizzle/` |
| Email sending | `server/src/mail/` (SMTP via `SMTP_URL`) |
| UI | `client/src/features/auth/` |

Each sign-in method switches on only when its credentials are set (`GET /api/config` tells the client). In development magic links work without any email setup: the link is printed in the server console.

### Google sign-in setup
1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** → *Web application*.
2. Authorised JavaScript origin: `https://<your-domain>`. Authorised redirect URI: `https://<your-domain>/api/auth/callback/google`. Add the `http://localhost:3000` equivalents for local dev.
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

## 🔒 Privacy

- Signed out, saves stay in this browser's storage and never leave the device.
- Signed in, saves are stored in our own Postgres and every query is scoped to your user id.
- Signing in stores only your email, name and (for Google) profile picture.
- No account is required to use SlackSave.

## 🎨 Design

SlackSave uses a dark financial-dashboard aesthetic with:

- Deep green / jalapeño-inspired branding
- Lime savings accents
- Orange secondary branding
- High-contrast financial figures
- Rounded cards
- Responsive Tailwind layouts
- Subtle motion and hover interactions
- Reduced-motion support

The product goal is to make one question immediately clear:

> **How much are you actually keeping?**

## 🧑‍💻 Development

### Adding an API route

1. Create a router in `server/src/routes/`, e.g. `goals.ts`.
2. Mount it in `server/src/app.ts`: `api.use("/goals", goalsRouter);`
3. Add a test next to it (see `server/src/app.test.ts`).

Unknown `/api/*` paths return a JSON 404, never the React app.

### Adding a currency

Currencies live in `shared/currencies.ts` (used by both the client and the API validation). Add an entry to `CURRENCIES`; formatting uses `Intl.NumberFormat`.

## 🌐 Deployment

SlackSave deploys to [Railway](https://railway.com) as a single service. `railway.json` configures it:

```text
Build:        npm run build   (Railpack, Node 24 from .node-version)
Pre-deploy:   node dist/server/migrate.js   (database migrations)
Start:        npm start
Health check: GET /api/health
```

Railway provides `PORT` and HTTPS. Pushes to `main` deploy automatically once the service is connected to the GitHub repo.

## 🗺️ Roadmap

### Planned

- 💬 **Chat** — log saves in plain words ("put aside 200 dirhams today") with a confirmation card, and ask questions ("how much did I save in September?").
- 🌍 **Multilingual support** — English, Arabic, French, Norwegian, Finnish, Swedish, Danish and German.
- 🔐 **Passkeys** — fingerprint / Face ID login (#4).
- 📊 **Savings history and charts**
- 🧾 **Expense categories**
- 🎯 **Multiple savings goals**
- 💱 **Live exchange-rate conversion**
- 📤 **CSV/PDF export**
- 📈 **Budget vs. actual tracking**
- 🤖 **Automated savings recommendations**

### GitHub issues

- **#1 — AI chat for logging and asking about savings**
- **#2 — Multilingual language support**

The GitHub issues are the source of truth for detailed acceptance criteria and implementation planning.

## 🤝 Contributing

See [`AGENTS.md`](AGENTS.md) for the working rules. In short:

1. Branch from the latest `main` (`feature/…`, `fix/…`, `chore/…`).
2. Run `npm run check`.
3. Open a PR into `main`. **Merging a PR into `main` is a release**: Railway deploys it automatically.

## 📄 License

This project is distributed under the license included in the repository's `LICENSE` file.

## 👤 Author

**Hesham El Masry**

GitHub: https://github.com/heshamelmasry77

---

Built with React, TypeScript, Vite, Tailwind CSS and Express.
