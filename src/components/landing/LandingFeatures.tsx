import { FEATURE_SPOTLIGHTS_DATA } from "./landingData";
import ScrollReveal from "./ScrollReveal";

export default function LandingFeatures() {
  return (
    <>
      {FEATURE_SPOTLIGHTS_DATA.map((feat) => (
        <ScrollReveal
          key={feat.title}
          className={`lp-feature${feat.reverse ? " lp-feature--rev" : ""}`}
          delay="0s"
        >
          <div className="lp-pic">
            <img
              src={feat.imgSrc}
              alt={feat.imgAlt}
              width={396}
              height={396}
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="lp-feature-h2">{feat.title}</h2>
            <p className="lp-feature-p">{feat.description}</p>
            <ul className="lp-feature-ul">
              {feat.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      ))}
    </>
  );
}

