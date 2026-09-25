# StackSave

> A fast, privacy-friendly savings calculator built with React, TypeScript, Vite, and Tailwind CSS.

StackSave helps you understand how much money you save each month and year, measure your savings rate, and estimate how long it will take to reach a savings goal.

All calculations are performed locally in the browser. No account, database, or backend is required.

## ✨ Features

- **Multiple currencies** — Choose from EUR, NOK, SEK, DKK, GBP, USD, EGP, AED, and SAR.
- **Monthly savings calculation** — Automatically calculates income minus expenses.
- **Yearly savings projection** — Converts monthly savings into an annual estimate.
- **Savings rate** — Shows what percentage of monthly income is being saved.
- **Savings goals** — Enter a target amount and estimate the number of months required to reach it.
- **Progress indicator** — Visualises the relationship between your monthly contribution and your goal.
- **Responsive design** — Optimised for desktop, tablet, and mobile screens.
- **Privacy-first** — Financial inputs stay in the browser and are not sent to a server.
- **No backend required** — The application is entirely client-side.

## 🛠 Tech Stack

| Technology | Purpose |
| --- | --- |
| React | User interface |
| TypeScript | Type safety and maintainability |
| Vite | Development server and production build |
| Tailwind CSS | Styling and responsive UI |
| Intl.NumberFormat | Currency formatting |

## 📁 Project Structure

```text
StackSave/
├── src/
│   ├── App.tsx          # Main application and calculator logic
│   ├── index.css        # Tailwind CSS entry point and global styles
│   └── main.tsx         # React application entry point
├── index.html           # HTML entry point
├── package.json         # Dependencies and npm scripts
├── tsconfig.json        # TypeScript project configuration
├── tsconfig.app.json    # Application TypeScript configuration
├── tsconfig.node.json   # Vite/Node TypeScript configuration
├── vite.config.ts       # Vite and Tailwind configuration
└── README.md            # Project documentation
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 20 or newer
- npm 10 or newer
- Git

You can verify your versions with:

```bash
node --version
npm --version
git --version
```

### Installation

Clone the repository:

```bash
git clone https://github.com/heshamelmasry77/StackSave.git
cd StackSave
```

Install dependencies:

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite will provide a local development URL, normally:

```text
http://localhost:5173
```

Open the URL in your browser.

## 📦 Production Build

Create an optimised production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated production files are placed in the `dist/` directory.

## 🧮 How the Calculator Works

### Monthly savings

StackSave calculates monthly savings as:

```text
Monthly savings = Monthly income - Monthly expenses
```

If expenses are greater than income, savings are displayed as `0` rather than a negative savings amount.

### Yearly savings

```text
Yearly savings = Monthly savings × 12
```

This is a simple projection assuming the monthly income and expenses remain unchanged.

### Savings rate

```text
Savings rate = (Monthly savings ÷ Monthly income) × 100
```

If no income is entered, the savings rate is `0%`.

### Time to savings goal

When a savings goal is provided:

```text
Months to goal = Ceiling(Savings goal ÷ Monthly savings)
```

The estimate assumes the same monthly savings contribution continues throughout the period.

## 💱 Supported Currencies

The current currency list includes:

- EUR — Euro
- NOK — Norwegian krone
- SEK — Swedish krona
- DKK — Danish krone
- GBP — British pound
- USD — US dollar
- EGP — Egyptian pound
- AED — UAE dirham
- SAR — Saudi riyal

Currency formatting uses the browser's built-in `Intl.NumberFormat` API.

> **Important:** Changing the currency changes how values are displayed. StackSave does not currently perform exchange-rate conversion.

## 🔒 Privacy

StackSave is designed to keep the calculator simple and private.

- No user account is required.
- No financial data is submitted to an API.
- No database is used.
- Calculations happen in the browser.
- Income, expenses, and goals are held in local application state.

Because the application currently does not persist data, refreshing the page resets the entered values.

## 🎨 Design

StackSave uses a dark, minimal interface with:

- Tailwind CSS utility classes
- Responsive layouts
- High-contrast financial figures
- Lime accent colour for important savings information
- Mobile-first responsive behaviour

The design intentionally keeps the calculator focused on the most important question:

> **How much are you actually keeping?**

## 🧑‍💻 Development

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |

### Adding a currency

Currencies are defined in `src/App.tsx`.

Add a new entry to the `currencies` array:

```ts
{
  code: "CAD",
  symbol: "$",
  name: "Canadian dollar"
}
```

The formatter will automatically use the currency code through `Intl.NumberFormat`.

### Adding new calculator features

Calculator values are derived in the `useMemo` block in `src/App.tsx`.

For larger future features, consider separating the calculator logic into dedicated modules, for example:

```text
src/
├── components/
├── hooks/
├── lib/
├── types/
└── App.tsx
```

## 🌐 Deployment

StackSave is a static frontend application and can be deployed to services such as:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Any static hosting provider that supports a Vite build

The production command is:

```bash
npm run build
```

Deploy the resulting `dist/` directory according to your hosting provider's instructions.

## 🔮 Roadmap

Potential future improvements include:

- Persistent savings plans
- LocalStorage support
- Multiple savings goals
- Expense categories
- Monthly history and charts
- Custom currency support
- Currency exchange-rate conversion
- Export to CSV/PDF
- Budget vs. actual tracking
- Dark/light theme selection
- PWA/offline support
- Automated savings recommendations

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/my-feature
```

3. Make your changes.
4. Verify the production build:

```bash
npm run build
```

5. Commit your changes:

```bash
git commit -m "Add my feature"
```

6. Push the branch and open a pull request.

Please keep changes focused and maintain the existing TypeScript and Tailwind conventions.

## 📄 License

This project is distributed under the license included in the repository's `LICENSE` file.

## 👤 Author

**Hesham El Masry**

GitHub: https://github.com/heshamelmasry77

---

Built with React, TypeScript, Vite, and Tailwind CSS.
