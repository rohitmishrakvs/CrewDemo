import {useEffect, useRef, useState} from 'react';

export type FrameStats = {
  fps: number;
  dropped: number; // cumulative dropped frames while measuring
  p50: number; // median frame time (ms)
  p95: number; // 95th percentile frame time (ms)
  worst: number; // worst (longest) frame time (ms)
};

const TARGET_FPS = 60;
const FRAME_BUDGET = 1000 / TARGET_FPS; // ~16.67ms per frame at 60fps
const DROP_THRESHOLD = FRAME_BUDGET * 1.5; // beyond this, we blew the budget
const WINDOW = 120; // frame times retained for percentile math
const UPDATE_MS = 500; // throttle React state updates (keep the overlay cheap)

const EMPTY: FrameStats = {fps: 0, dropped: 0, p50: 0, p95: 0, worst: 0};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const rank = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[rank];
}

/**
 * Measures rendered FPS with requestAnimationFrame + the high-res frame
 * timestamp (performance.now based):  delta = now - previousFrame,
 * fps = 1000 / delta. Frame times are stored in a rolling window so we can
 * report percentiles (P50/P95), the worst frame, and dropped-frame count.
 *
 * Pass enabled=false to fully stop the loop (zero overhead when hidden).
 */
export function useFPS(enabled: boolean = true): FrameStats {
  const [stats, setStats] = useState<FrameStats>(EMPTY);

  const framesRef = useRef<number[]>([]);
  const droppedRef = useRef(0);
  const worstRef = useRef(0);
  const prevRef = useRef(0);
  const lastEmitRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // Fresh session each time measuring starts.
    framesRef.current = [];
    droppedRef.current = 0;
    worstRef.current = 0;
    prevRef.current = 0;
    lastEmitRef.current = 0;
    setStats(EMPTY);

    let raf = 0;
    let mounted = true;

    const tick = (t: number) => {
      if (!mounted) {
        return;
      }
      const prev = prevRef.current;
      if (prev !== 0) {
        const delta = t - prev; // frame time in ms
        const buf = framesRef.current;
        buf.push(delta);
        if (buf.length > WINDOW) {
          buf.shift();
        }
        if (delta > worstRef.current) {
          worstRef.current = delta;
        }
        if (delta > DROP_THRESHOLD) {
          // Approx. number of frame budgets missed during this long frame.
          droppedRef.current += Math.round(delta / FRAME_BUDGET) - 1;
        }
        if (t - lastEmitRef.current >= UPDATE_MS) {
          lastEmitRef.current = t;
          const sorted = buf.slice().sort((a, b) => a - b);
          const avg = buf.reduce((sum, d) => sum + d, 0) / buf.length;
          setStats({
            fps: Math.min(TARGET_FPS, Math.round(1000 / avg)),
            dropped: droppedRef.current,
            p50: Math.round(percentile(sorted, 50)),
            p95: Math.round(percentile(sorted, 95)),
            worst: Math.round(worstRef.current),
          });
        }
      }
      prevRef.current = t;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return stats;
}

export default useFPS;
