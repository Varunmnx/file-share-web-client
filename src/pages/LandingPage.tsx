import { lazy, Suspense } from "react";
import "./LandingPage.css";
import {
  LandingNav,
  LandingHero,
  LandingStats,
} from "../components/landing";

// Lazy-loaded below-the-fold landing sections
const LandingCards    = lazy(() => import("../components/landing/LandingCards"));
const LandingFeatures = lazy(() => import("../components/landing/LandingFeatures"));
const LandingSteps    = lazy(() => import("../components/landing/LandingSteps"));
const LandingFaq      = lazy(() => import("../components/landing/LandingFaq"));
const LandingCta      = lazy(() => import("../components/landing/LandingCta"));
const LandingFooter   = lazy(() => import("../components/landing/LandingFooter"));

export default function LandingPage() {
  return (
    <div className="lp-root">
      {/* Liquid glass navigation */}
      <LandingNav />

      {/* Main landing content */}
      <main>
        {/* Hero section with video background & CTA */}
        <LandingHero />

        {/* Dynamic statistics and infinite marquee */}
        <LandingStats />

        {/* Feature cards, feature spotlights, workflow steps, FAQ, and final CTA */}
        <section id="how" className="lp-section">
          <Suspense fallback={<div style={{ minHeight: 200 }} />}>
            <LandingCards />
            <LandingFeatures />
            <LandingSteps />
            <LandingFaq />
            <LandingCta />
          </Suspense>
        </section>
      </main>

      {/* Footer with store link and legal */}
      <Suspense fallback={null}>
        <LandingFooter />
      </Suspense>
    </div>
  );
}
