import { useMemo, useState, type ChangeEvent } from "react";

type Currency = { code:string; symbol:string; name:string };

const currencies: Currency[] = [
  { code:"EUR", symbol:"€", name:"Euro" },
  { code:"NOK", symbol:"kr", name:"Norwegian krone" },
  { code:"SEK", symbol:"kr", name:"Swedish krona" },
  { code:"DKK", symbol:"kr", name:"Danish krone" },
  { code:"GBP", symbol:"£", name:"British pound" },
  { code:"USD", symbol:"$", name:"US dollar" },
  { code:"EGP", symbol:"E£", name:"Egyptian pound" },
  { code:"AED", symbol:"د.إ", name:"UAE dirham" },
  { code:"SAR", symbol:"﷼", name:"Saudi riyal" },
];

function App() {
  const [currencyCode,setCurrencyCode] = useState("EUR");
  const [income,setIncome] = useState("5000");
  const [expenses,setExpenses] = useState("3500");
  const [goal,setGoal] = useState("10000");
  const currency = currencies.find(c=>c.code===currencyCode) ?? currencies[0];

  const values = useMemo(() => {
    const i=Math.max(0,Number(income)||0), e=Math.max(0,Number(expenses)||0), g=Math.max(0,Number(goal)||0);
    const monthly=Math.max(0,i-e), yearly=monthly*12, rate=i?monthly/i*100:0;
    return { monthly, yearly, rate, goal:g, months:g&&monthly?Math.ceil(g/monthly):null };
  },[income,expenses,goal]);

  const numberInput=(setter:(v:string)=>void)=>(e:ChangeEvent<HTMLInputElement>)=>{
    if(/^\\d*(\\.\\d{0,2})?$/.test(e.target.value)) setter(e.target.value);
  };
  const money=(n:number)=>new Intl.NumberFormat(undefined,{style:"currency",currency:currency.code,maximumFractionDigits:0}).format(n);

  return <div className="min-h-screen bg-zinc-950 text-zinc-100">
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-lime-300 font-black text-zinc-950">S</div>
            <span className="text-xl font-extrabold tracking-tight">SlackSave</span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">Know what you keep. Build what you want.</p>
        </div>
        <label className="w-full sm:w-56">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">Currency</span>
          <select value={currencyCode} onChange={e=>setCurrencyCode(e.target.value)} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm outline-none focus:border-lime-300">
            {currencies.map(c=><option key={c.code} value={c.code}>{c.code} · {c.name}</option>)}
          </select>
        </label>
      </header>

      <section className="mb-5 overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/60 p-6 sm:p-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Your savings</p>
            <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] sm:text-7xl">{money(values.monthly)} <span className="text-lg font-medium tracking-normal text-zinc-500">/ month</span></h1>
            <p className="mt-4 text-sm text-zinc-500">You’re keeping <strong className="text-lime-300">{values.rate.toFixed(1)}%</strong> of your monthly income.</p>
          </div>
          <div className="rounded-2xl bg-lime-300 p-5 text-zinc-950 sm:min-w-48">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Yearly</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{money(values.yearly)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <div className="mb-7 flex items-start justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Inputs</p><h2 className="mt-1 text-xl font-bold tracking-tight">Your monthly numbers</h2></div>
            <span className="grid size-10 place-items-center rounded-xl bg-zinc-800 text-sm font-bold text-lime-300">{currency.symbol}</span>
          </div>
          <div className="space-y-5">
            {[["Monthly income",income,setIncome],["Monthly expenses",expenses,setExpenses],["Savings goal",goal,setGoal]].map(([label,value,setter],idx)=>
              <label key={String(label)} className="block">
                <span className="mb-2 block text-sm font-medium text-zinc-400">{String(label)} {idx===2&&<em className="not-italic text-zinc-600">optional</em>}</span>
                <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-3 transition focus-within:border-lime-300">
                  <span className="text-zinc-600">{currency.symbol}</span>
                  <input inputMode="decimal" value={String(value)} onChange={numberInput(setter as (v:string)=>void)} className="min-w-0 flex-1 bg-transparent px-3 py-3 text-lg font-bold outline-none" />
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Savings goal</p>
          {values.months ? <>
            <h2 className="mt-5 text-4xl font-black tracking-tight">{values.months} months</h2>
            <p className="mt-2 text-sm text-zinc-500">to reach {money(values.goal)}</p>
            <div className="mt-9 h-2 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-lime-300 transition-all" style={{width:`${Math.min(100,values.monthly/values.goal*100)}%`}} /></div>
            <div className="mt-5 flex justify-between text-xs"><span className="text-zinc-500">Monthly contribution</span><strong>{money(values.monthly)}</strong></div>
          </> : <div className="mt-5"><h2 className="text-3xl font-black">Set a goal</h2><p className="mt-2 text-sm text-zinc-500">Add a savings goal to see your timeline.</p></div>}
        </div>
      </section>

      <footer className="flex flex-col gap-2 px-1 pt-7 text-xs text-zinc-600 sm:flex-row sm:justify-between"><span>SlackSave</span><span>Calculations happen locally in your browser.</span></footer>
    </main>
  </div>;
}
export default App;