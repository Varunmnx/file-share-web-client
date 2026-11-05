import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../BrandLogo";

export default function LandingNav() {
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const stuck = window.scrollY > 40;
          setIsStuck((prev) => (prev !== stuck ? stuck : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav className={`lp-nav${isStuck ? " lp-nav--stuck" : ""}`} aria-label="Main navigation">
      <a className="lp-brand" href="#">
        <span className="lp-logo" aria-hidden="true">
          <BrandLogo size={36} />
        </span>
        T Share
      </a>
      <Link className="lp-signin" to="/login">
        Sign in
      </Link>
      <Link className="lp-btn" to="/login">
        Get started
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m4 2 4 4-4 4" />
        </svg>
      </Link>
    </nav>
  );
}

