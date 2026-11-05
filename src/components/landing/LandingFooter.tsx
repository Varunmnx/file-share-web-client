import { Link } from "react-router-dom";
import BrandLogo from "../BrandLogo";

export default function LandingFooter() {
  return (
    <footer className="lp-footer" id="get">
      <div className="lp-foot">
        <div className="lp-foot-brand">
          <a className="lp-brand lp-brand--footer" href="#">
            <span className="lp-logo" aria-hidden="true">
              <BrandLogo size={32} />
            </span>
            T Share
          </a>

          <a className="lp-play" href="#" aria-label="Get it on Google Play">
            <svg width="22" height="24" viewBox="0 0 26 28" aria-hidden="true">
              <path d="M1 1.5v25L14 14 1 1.5Z" fill="#00c3ff" />
              <path d="m1 1.5 13 12.5 4.5-4.5L3.5.4C2.5-.2 1.4.2 1 1.5Z" fill="#00f076" />
              <path d="M1 26.5c.4 1.3 1.5 1.7 2.5 1.1L18.5 18.5 14 14 1 26.5Z" fill="#ff3a44" />
              <path d="m18.5 9.5-4.5 4.5 4.5 4.5 5.7-3.2c1.5-.9 1.5-2.7 0-3.6l-5.7-2.2Z" fill="#ffd400" />
            </svg>
            <div>
              <span className="lp-play-label">GET IT ON</span>
              <b className="lp-play-name">Google Play</b>
            </div>
          </a>
        </div>

        <nav className="lp-foot-cols" aria-label="Footer">
          <div className="lp-foot-col">
            <h3 className="lp-foot-heading">Product</h3>
            <a href="#how">Features</a>
            <a href="#steps">How it works</a>
            <Link to="/login">Get started</Link>
          </div>

          <div className="lp-foot-col">
            <h3 className="lp-foot-heading">Company</h3>
            <a href="#">About us</a>
            <a href="#">Contact us</a>
          </div>

          <div className="lp-foot-col">
            <h3 className="lp-foot-heading">Legal</h3>
            <a href="#">Privacy policy</a>
            <a href="#">Terms of service</a>
          </div>
        </nav>
      </div>

      <div className="lp-foot-bar">
        <p className="lp-foot-copy">
          © {new Date().getFullYear()} T Share. All rights reserved.
        </p>

        <div className="lp-socials">
          <a href="#" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
            </svg>
          </a>
          <a href="#" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
