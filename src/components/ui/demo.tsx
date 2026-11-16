"use client";

import { RouteGlobe, type GlobeTheme } from "@/components/ui/route-globe";

const PAPER: GlobeTheme = {
  ground: "#f3efe6",
  land: "#3b4a63",
  arc: "#d9480f",
  glow: "rgb(59 74 99 / 0.12)",
  text: "#1b1a17",
  muted: "#7a7366",
};

export default function Demo() {
  return (
    <div
      className="relative h-screen min-h-full w-full"
      style={{ background: PAPER.ground, color: PAPER.text }}
    >
      <RouteGlobe theme={PAPER} className="!absolute inset-0" />
      <div className="pointer-events-none absolute left-6 top-6">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.16em]"
          style={{ color: PAPER.muted }}
        >
          From Muscat · 10 routes
        </p>
        <p className="mt-2 text-[1.5rem] font-semibold tracking-[-0.02em]">
          Where we fly this winter
        </p>
      </div>
    </div>
  );
}

