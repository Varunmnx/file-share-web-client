import { FEATURE_CARDS_DATA } from "./landingData";
import ScrollReveal from "./ScrollReveal";

const DITHER_VIDEO_SRC = "/dither-heat-mirage-10s-1794822402057.webm";

export default function LandingCards() {
  return (
    <div className="lp-cards-section">
      <ScrollReveal className="lp-head" delay="0s"> 
        <h2 className="lp-head-h2">Share anything in seconds</h2>
        <p className="lp-head-p">
          End-to-end encrypted file transfers with zero setup and lightning-fast speeds.
        </p>
      </ScrollReveal>

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
              <video
                className="lp-card-video"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              >
                <source src={DITHER_VIDEO_SRC} type="video/webm" />
              </video>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
