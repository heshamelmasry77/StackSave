# SlackSave

> A fast, privacy-friendly savings calculator built with React, TypeScript, Vite, and Tailwind CSS.

SlackSave helps you understand how much you save each month and year, measure your savings rate, and estimate how long it will take to reach a savings goal.

The calculator runs locally in the browser. Authentication/PWA infrastructure is present, while persistent savings data and database integration are planned for a later stage.

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
- **Optional authentication UI** — Supabase Auth scaffolding for Google and passwordless email sign-in.
- **Privacy-first calculator** — Financial inputs are processed locally and are not currently saved to a database.

## 🧱 Current Architecture

SlackSave is currently a client-side React application.

```text
Browser
  │
  ├── React + TypeScript
  ├── Tailwind CSS
  ├── Local calculator state
  ├── Intl.NumberFormat
  └── PWA service worker
          │
          └── Optional Supabase Auth
```

There is currently **no persistent savings database** and no exchange-rate API.

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| React 19 | User interface |
| TypeScript | Type safety |
| Vite 7 | Development server and production build |
| Tailwind CSS 4 | Styling and responsive UI |
| @tailwindcss/vite | Tailwind/Vite integration |
| vite-plugin-pwa | PWA manifest and service worker |
| Supabase JS | Authentication scaffolding |
| Intl.NumberFormat | Locale-aware currency formatting |

## 📁 Project Structure

```text
StackSave/
├── public/
│   ├── favicon.svg
│   ├── icon.svg
│   └── site.webmanifest
├── src/
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Git

Check your versions:

```bash
node --version
npm --version
git --version
```

### Installation

```bash
git clone https://github.com/heshamelmasry77/StackSave.git
cd StackSave
npm install
```

### Development

```bash
npm run dev
```

Open the local URL shown by Vite, normally `http://localhost:5173`.

### Production build

```bash
npm run build
```

This runs TypeScript checks and creates the production build in `dist/`.

Preview it locally:

```bash
npm run preview
```

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

The PWA configuration lives in `vite.config.ts`.

## 🔐 Authentication

Supabase Auth is currently **prepared but optional**.

When Supabase environment variables are configured, the UI supports:

- Google OAuth
- Passwordless email magic links
- Session restoration
- Automatic auth state updates
- Sign-out

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Never commit `.env.local`, service-role keys, or other secrets. Only a public Supabase client key intended for frontend use should be exposed to the browser.

### Current limitation

Authentication does **not** currently save calculator data to Supabase. Persistent user savings plans and database integration are future work.

## 🔒 Privacy

- Calculator inputs remain in browser state.
- Calculator values are not currently written to a database.
- No financial data is sent to an external calculation API.
- No account is required to use the calculator.
- Supabase is only used when authentication is configured.

Future features that store user data must include appropriate access controls and database security policies.

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

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build |

### Adding a currency

Currencies are currently defined in `src/App.tsx`.

Add an entry to the `currencies` array:

```ts
{
  code: "CAD",
  symbol: "CA$",
  name: "Canadian Dollar",
  flag: "🇨🇦"
}
```

The formatter uses the currency code with `Intl.NumberFormat`.

### Future code organisation

As SlackSave grows, calculator logic and UI can be separated into:

```text
src/
├── components/
├── hooks/
├── i18n/
├── lib/
├── types/
└── App.tsx
```

This will be particularly useful when multilingual support and AI-assisted input are added.

## 🌐 Deployment

SlackSave produces a static Vite build and can be deployed to Netlify, Vercel, Cloudflare Pages or another static hosting provider.

### Netlify

Recommended settings:

```text
Build command: npm run build
Publish directory: dist
```

For client-side routing, configure the host to serve `index.html` as the fallback for application routes.

No backend server is required for the calculator.

## 🗺️ Roadmap

### Planned

- 💬 **AI natural-language savings input** — Let users describe income and expenses conversationally, extract structured data, confirm it, then save it to their account.
- 🌍 **Multilingual support** — English, Arabic, French, Norwegian, Finnish, Swedish, Danish and German.
- 💾 **Persistent savings plans** — Save user data to Supabase after the database architecture is ready.
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
   npm run build
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

Built with React, TypeScript, Vite and Tailwind CSS.
