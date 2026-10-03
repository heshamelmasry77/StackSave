# SlackSave

> A fast, privacy-friendly savings calculator. One Node.js app serves both the React frontend and the Express API.

SlackSave helps you understand how much you save each month and year, measure your savings rate, and estimate how long it will take to reach a savings goal.

The calculator runs locally in the browser. The Express backend is in place so accounts (Google sign-in, passkeys) and saved savings data can be added without a third-party backend service.

## ✨ Features

- **Monthly savings** — Calculates income minus expenses.
- **Yearly projection** — Projects monthly savings across 12 months.
- **Savings rate** — Shows the percentage of monthly income being saved.
- **Savings goals** — Estimates the months required to reach a target.
- **Goal progress** — Visualises the monthly contribution against the target.
- **21 currencies** — EUR, USD, GBP, NOK, SEK, DKK, CHF, CAD, AUD, NZD, JPY, CNY, INR, EGP, AED, SAR, QAR, KWD, BHD, PLN and CZK.
- **Searchable currency selector** — Flag, code, name and selected-state indicator.
- **Responsive UI** — Mobile, tablet and desktop layouts.
- **Animated interface** — Entrance animations, hover states, progress animation and subtle motion.
- **PWA-ready** — Installable web app with manifest, service worker and application-shell caching.
- **Single deployable app** — Express serves the API under `/api` and the built frontend from the same origin.
- **Privacy-first calculator** — Financial inputs are processed locally and are not currently saved to a database.

## 🧱 Architecture

```text
one Node.js process, one URL
│
├── Express 5
│   ├── /api/auth/*  Better Auth (Google, magic link)
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
│       ├── main.tsx
│       ├── index.css
│       └── features/
│           ├── auth/        # sign-in dialog, account button
│           ├── calculator/  # currencies, CurrencyPicker, SavingsCalculator
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
├── shared/                  # code shared by client and server (savings maths)
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

## 💰 Calculator Logic

### Monthly savings

```text
Monthly savings = max(0, monthly income - monthly expenses)
```

If expenses are higher than income, SlackSave displays zero monthly savings rather than a negative value.

### Yearly savings

```text
Yearly savings = monthly savings × 12
```

### Savings rate

```text
Savings rate = (monthly savings ÷ monthly income) × 100
```

When income is zero or missing, the savings rate is 0%.

### Time to goal

```text
Months to goal = ceil(savings goal ÷ monthly savings)
```

If monthly savings is zero, SlackSave does not display a timeline.

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

> **Important:** Selecting a currency changes display formatting only. SlackSave does **not** currently convert between currencies or use live exchange rates.

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

- Calculator inputs remain in browser state.
- Calculator values are not currently written to a database. Signing in stores only your email, name and (for Google) profile picture.
- No financial data is sent to an external calculation API.
- No account is required to use the calculator.

Future features that store user data must include appropriate access controls.

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

Currencies live in `client/src/features/calculator/currencies.ts`. Add an entry to the `currencies` array; formatting uses the code with `Intl.NumberFormat`.

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

- 💬 **AI natural-language savings input** — Let users describe income and expenses conversationally, extract structured data, confirm it, then save it to their account.
- 🌍 **Multilingual support** — English, Arabic, French, Norwegian, Finnish, Swedish, Danish and German.
- 🔐 **Passkeys** — fingerprint / Face ID login (#4).
- 💾 **Persistent savings plans** — Save savings entries per user in Postgres.
- 📊 **Savings history and charts**
- 🧾 **Expense categories**
- 🎯 **Multiple savings goals**
- 💱 **Live exchange-rate conversion**
- 📤 **CSV/PDF export**
- 📈 **Budget vs. actual tracking**
- 🤖 **Automated savings recommendations**

### GitHub issues

- **#1 — AI chat for natural-language savings input**
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
