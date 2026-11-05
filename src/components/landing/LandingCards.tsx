import { FEATURE_CARDS_DATA } from "./landingData";
import ScrollReveal from "./ScrollReveal";

export default function LandingCards() {
  return (
    <div className="lp-cards">
      {FEATURE_CARDS_DATA.map((card, i) => (
        <ScrollReveal
          key={card.title}
          as="article"
          className={`lp-card${card.flip ? " lp-card--flip" : ""}`}
          delay={`${(i % 3) * 0.12}s`}
        >
          <div className="lp-card-txt">
            {card.title}
            <small className="lp-card-small">{card.sub}</small>
          </div>
          <div className="lp-card-art">
            <img src={card.imgSrc} alt={card.imgAlt ?? ""} loading="lazy" />
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}

