import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "./useReducedMotion";

const SPARKLES = [
  { left: "30%", top: "36%", animationDelay: ".2s" },
  { left: "68%", top: "30%", animationDelay: "1.4s" },
  { left: "22%", top: "58%", animationDelay: "2.2s" },
  { left: "76%", top: "62%", animationDelay: ".8s" },
  { left: "50%", top: "22%", animationDelay: "2.8s" },
] as const;

export default function LandingHero() {
  const reducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && reducedMotion) {
      videoRef.current.pause();
    }
  }, [reducedMotion]);

  return (
    <header className="lp-hero">
      <video
        ref={videoRef}
        className="lp-beams"
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      {/* <div className="lp-dots" aria-hidden="true" /> */}
      {/* {SPARKLES.map((sp, idx) => (
        <i
          key={idx}
          className="lp-sp"
          style={{ left: sp.left, top: sp.top, animationDelay: sp.animationDelay }}
          aria-hidden="true"
        />
      ))} */}

      <div className="lp-hero-copy">
        {/* <div className="lp-chip">
          <i className="lp-chip-dot" />
          End-to-end encrypted by default
        </div> */}

        <h1 className="lp-h1">
          Share more files,<br />
          <span className="lp-sel">
            <i className="lp-sel-box" />
            securely and privately
          </span>
        </h1>

        <p className="lp-sub">
          Send anything to anyone in seconds. Your files stay encrypted from
          the moment they leave your device.
        </p>

        <div className="lp-cta-row">
          <Link className="lp-btn lp-btn--light" to="/login">
            Start sharing
          </Link>
          <a className="lp-ghost" href="#how">
            See how it works
          </a>
        </div>
      </div>
    </header>
  );
}

