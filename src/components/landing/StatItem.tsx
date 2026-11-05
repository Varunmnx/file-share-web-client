import { useCounter } from "./useCounter";

interface StatItemProps {
  count: number;
  suffix: string;
  label: string;
  active: boolean;
  reducedMotion: boolean;
}

export default function StatItem({
  count,
  suffix,
  label,
  active,
  reducedMotion,
}: StatItemProps) {
  const animatedValue = useCounter(count, suffix, active, reducedMotion);

  return (
    <div>
      <b className="lp-stat-num">{animatedValue}</b>
      <span className="lp-stat-label">{label}</span>
    </div>
  );
}

