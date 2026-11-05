import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";

export default function LandingCta() {
  return (
    <ScrollReveal className="lp-cta" delay="0s">
      <div className="lp-cta-grid" aria-hidden="true" />
      <h2 className="lp-cta-h2">Share more files, securely and privately.</h2>
      <Link to="/login" className="lp-cta-btn">
        Get started free
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 10.5 10.5 2.5M3.5 2.5h7v7" />
        </svg>
      </Link>
    </ScrollReveal>
  );
}
