import {useEffect, useState} from 'react';
import {now} from '../utils/now';

export type JSThreadStats = {
  delay: number; // event-loop delay in ms
  busy: boolean; // delay exceeded the threshold
};

const THRESHOLD_MS = 30;
const SAMPLE_INTERVAL_MS = 250;

const EMPTY: JSThreadStats = {delay: 0, busy: false};

/**
 * Monitors JS-thread responsiveness by measuring event-loop delay:
 *   start = now()  ->  setTimeout(0)  ->  delay = now() - start
 * A setTimeout(0) fires on the next event-loop turn; if the JS thread is busy,
 * it fires late, and that lateness IS the delay. delay > threshold => "JS busy".
 *
 * Pass enabled=false to stop sampling (zero overhead when hidden).
 */
export function useJSThread(
  enabled: boolean = true,
  threshold: number = THRESHOLD_MS,
): JSThreadStats {
  const [stats, setStats] = useState<JSThreadStats>(EMPTY);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const probe = () => {
      const start = now();
      setTimeout(() => {
        if (!active) {
          return;
        }
        const delay = Math.max(0, now() - start);
        setStats({delay: Math.round(delay), busy: delay > threshold});
        // Wait a beat before the next probe so we sample, not spin.
        timer = setTimeout(probe, SAMPLE_INTERVAL_MS);
      }, 0);
    };

    probe();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [enabled, threshold]);

  return stats;
}

export default useJSThread;
