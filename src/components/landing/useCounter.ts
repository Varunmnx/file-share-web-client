import { useEffect, useRef, useState } from "react";

export function useCounter(
  end: number,
  suffix: string,
  active: boolean,
  reducedMotion: boolean,
  duration = 1400
) {
  const [value, setValue] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!active || hasAnimated.current) return;
    hasAnimated.current = true;

    if (reducedMotion) {
      setValue(`${end}${suffix}`);
      return;
    }

    let rafId: number;
    const t0 = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - t0) / duration, 1);
      // Quartic ease-out: 1 - (1 - p)^4
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(end * ease);

      setValue(progress === 1 ? `${end}${suffix}` : `${currentVal}`);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [active, end, suffix, reducedMotion, duration]);

  return value;
}

