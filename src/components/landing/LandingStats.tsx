import { STATS_DATA, MARQUEE_TAGS } from "./landingData";
import StatItem from "./StatItem";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";

export default function LandingStats() {
  const { ref: statsRef, isInView: statsVisible } = useInView<HTMLDivElement>({
    threshold: 0.18,
    triggerOnce: true,
  });
  const reducedMotion = useReducedMotion();

  return (
    <div className="lp-strip">
      <div className="lp-stats" ref={statsRef}>
        {STATS_DATA.map((item) => (
          <StatItem
            key={item.label}
            count={item.count}
            suffix={item.suffix}
            label={item.label}
            active={statsVisible}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      <div className="lp-marquee-wrap" aria-hidden="true">
        <div className="lp-marquee">
          {/* Duplicated declaratively for seamless CSS infinite ticker loop */}
          {[...MARQUEE_TAGS, ...MARQUEE_TAGS].map((tag, idx) => (
            <span key={`${tag}-${idx}`} className="lp-marquee-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

