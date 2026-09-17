export const QUOTES: string[] = [
  "Let fate spin the wheel.",
  "Every name has its moment.",
  "Decided in one revolution.",
  "No favorites, just physics.",
  "The wheel doesn't play favorites.",
  "Chance, made visible.",
  "Spin first, argue never.",
  "One press, one winner.",
  "Randomness you can watch.",
  "The odds are already written.",
  "Stop arguing. Start spinning.",
  "Built for tie-breakers.",
];

export function randomQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}
