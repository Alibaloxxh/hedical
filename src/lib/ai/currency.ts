const SYMBOLS: Record<string, string> = {
  USD: "$", INR: "₹", EUR: "€", GBP: "£", JPY: "¥",
  CAD: "CA$", AUD: "A$", CNY: "¥", BRL: "R$", KRW: "₩",
  MXN: "MX$", SGD: "S$", CHF: "CHF", NZD: "NZ$", SEK: "kr",
  NOK: "kr", DKK: "kr", RUB: "₽", ZAR: "R", TRY: "₺",
};

export function currencySymbol(code: string | null | undefined): string {
  if (code && SYMBOLS[code]) return SYMBOLS[code];
  return code || "$";
}
