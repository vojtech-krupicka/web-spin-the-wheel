/**
 * Draws the winner uniformly at random via the Web Crypto RNG, before any
 * animation runs — the animation is always reverse-engineered to land on
 * this result, never the other way around, so the visual outcome can never
 * diverge from the real one.
 */
export function pickWinnerIndex(entries: string[]): number {
  if (entries.length === 0) throw new Error("Cannot pick a winner from an empty list.");
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % entries.length;
}
