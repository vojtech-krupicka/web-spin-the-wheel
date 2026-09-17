/** Splits textarea content into a trimmed name list, preserving line order. Empty lines are dropped; duplicates are kept (they encode extra odds). */
export function parseNameList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function sortNames(names: string[], direction: "asc" | "desc" = "asc"): string[] {
  const sorted = [...names].sort((a, b) => a.localeCompare(b));
  return direction === "asc" ? sorted : sorted.reverse();
}

export function dedupeNames(names: string[]): string[] {
  return Array.from(new Set(names));
}

export function shuffleNames(names: string[]): string[] {
  const result = [...names];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
