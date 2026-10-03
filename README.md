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
│   ├── /api/*  JSON API (health today; auth + data next)
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
│           ├── calculator/  # currencies, CurrencyPicker, SavingsCalculator
│           └── pwa/         # useInstallPrompt
├── server/
│   └── src/
│       ├── index.ts         # HTTP server bootstrap + graceful shutdown
│       ├── app.ts           # Express app and /api router
│       ├── frontend.ts      # Vite middleware (dev) / static files (prod)
│       ├── env.ts           # validated environment variables
│       ├── routes/          # one router per API area
│       └── middleware/      # errors, 404s
├── shared/                  # code shared by client and server (savings maths)
├── railway.json             # Railway build/deploy config
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.{client,server,node}.json
```

Client code imports shared code as `@shared/...`.

## 🚀 Getting Started

Requires Node.js 24+.

```bash
git clone https://github.com/heshamelmasry77/StackSave.git
cd StackSave
npm install
npm run dev          # http://localhost:3000
```

Run the production build locally:

```bash
npm run build
npm start            # http://localhost:3000
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Express + Vite with hot reload on one port (`PORT`, default 3000) |
| `npm run build` | Build the client and bundle the server into `dist/` |
| `npm start` | Run the production build |
| `npm run typecheck` | Type-check client, server and config |
| `npm test` | Run the Vitest suite |
| `npm run check` | Typecheck + tests + build (run before opening a PR) |

### Environment variables

See `.env.example`. Variables are validated at startup in `server/src/env.ts`.

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `3000` | Set automatically by Railway |
| `NODE_ENV` | `development` | `npm start` sets `production` |

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

Not enabled yet. The plan is to run authentication inside this Express app with [Better Auth](https://www.better-auth.com/) and a Postgres database, so user accounts stay in our own database:

- Google sign-in
- Passkeys (fingerprint / Face ID) for the installed PWA
- Email magic link as a fallback

## 🔒 Privacy

- Calculator inputs remain in browser state.
- Calculator values are not currently written to a database.
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
Start:        npm start
Health check: GET /api/health
```

Railway provides `PORT` and HTTPS. Pushes to `main` deploy automatically once the service is connected to the GitHub repo.

## 🗺️ Roadmap

### Planned

- 💬 **AI natural-language savings input** — Let users describe income and expenses conversationally, extract structured data, confirm it, then save it to their account.
- 🌍 **Multilingual support** — English, Arabic, French, Norwegian, Finnish, Swedish, Danish and German.
- 🔐 **Accounts** — Google sign-in and passkeys via Better Auth, stored in Railway Postgres.
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

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/my-feature
   ```
3. Make your changes.
4. Run:
   ```bash
   npm run check
   ```
5. Commit and push your branch.
6. Open a pull request.

Keep changes focused and follow the existing TypeScript and Tailwind conventions.

## 📄 License

This project is distributed under the license included in the repository's `LICENSE` file.

## 👤 Author

**Hesham El Masry**

GitHub: https://github.com/heshamelmasry77

---

Built with React, TypeScript, Vite, Tailwind CSS and Express.
