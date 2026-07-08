/**
 * High-resolution monotonic timestamp in milliseconds.
 * Uses performance.now() when available, falling back to Date.now().
 */
export const now = (): number => {
  const perf = (globalThis as {performance?: {now?: () => number}}).performance;
  return perf && typeof perf.now === 'function' ? perf.now() : Date.now();
};

export default now;
