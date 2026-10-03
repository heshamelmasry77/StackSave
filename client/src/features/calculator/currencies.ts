export type Currency = { code: string; symbol: string; name: string; flag: string };

export const currencies: Currency[] = [
  { code:"EUR", symbol:"€", name:"Euro", flag:"🇪🇺" },
  { code:"USD", symbol:"$", name:"US Dollar", flag:"🇺🇸" },
  { code:"GBP", symbol:"£", name:"British Pound", flag:"🇬🇧" },
  { code:"NOK", symbol:"kr", name:"Norwegian Krone", flag:"🇳🇴" },
  { code:"SEK", symbol:"kr", name:"Swedish Krona", flag:"🇸🇪" },
  { code:"DKK", symbol:"kr", name:"Danish Krone", flag:"🇩🇰" },
  { code:"CHF", symbol:"CHF", name:"Swiss Franc", flag:"🇨🇭" },
  { code:"CAD", symbol:"CA$", name:"Canadian Dollar", flag:"🇨🇦" },
  { code:"AUD", symbol:"A$", name:"Australian Dollar", flag:"🇦🇺" },
  { code:"NZD", symbol:"NZ$", name:"New Zealand Dollar", flag:"🇳🇿" },
  { code:"JPY", symbol:"¥", name:"Japanese Yen", flag:"🇯🇵" },
  { code:"CNY", symbol:"¥", name:"Chinese Yuan", flag:"🇨🇳" },
  { code:"INR", symbol:"₹", name:"Indian Rupee", flag:"🇮🇳" },
  { code:"EGP", symbol:"E£", name:"Egyptian Pound", flag:"🇪🇬" },
  { code:"AED", symbol:"د.إ", name:"UAE Dirham", flag:"🇦🇪" },
  { code:"SAR", symbol:"﷼", name:"Saudi Riyal", flag:"🇸🇦" },
  { code:"QAR", symbol:"﷼", name:"Qatari Riyal", flag:"🇶🇦" },
  { code:"KWD", symbol:"د.ك", name:"Kuwaiti Dinar", flag:"🇰🇼" },
  { code:"BHD", symbol:".د.ب", name:"Bahraini Dinar", flag:"🇧🇭" },
  { code:"PLN", symbol:"zł", name:"Polish Złoty", flag:"🇵🇱" },
  { code:"CZK", symbol:"Kč", name:"Czech Koruna", flag:"🇨🇿" },
];

export const findCurrency = (code: string) => currencies.find((c) => c.code === code) ?? currencies[0];
