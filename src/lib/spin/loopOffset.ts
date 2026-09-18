/**
 * Shared math for the two "scrolling reel" visualizations (Cylinder, Carousel):
 * given the current pixel offset, always move strictly forward to the next
 * loop boundary plus the requested extra cycles plus the target's own
 * position, so the animation never runs backward between spins.
 */
export function nextLoopTarget(
  currentOffset: number,
  loopLength: number,
  extraCycles: number,
  targetIndexInLoop: number,
  unit: number,
): number {
  const loopSize = loopLength * unit;
  if (loopSize === 0) return 0;
  const base = Math.ceil(currentOffset / loopSize) * loopSize;
  return base + extraCycles * loopSize + targetIndexInLoop * unit;
}

/** Wraps an offset back into [0, loopSize) — call only while idle, paired with a transition-less style reset. */
export function normalizeOffset(offset: number, loopLength: number, unit: number): number {
  const loopSize = loopLength * unit;
  if (loopSize === 0) return 0;
  return ((offset % loopSize) + loopSize) % loopSize;
}
