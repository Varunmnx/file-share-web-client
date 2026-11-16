import { useEffect, useRef } from "react";

/**
 * DitherHeatCanvas
 *
 * Renders an animated dithered heat-mirage effect using an ordered (Bayer) 8×8
 * dither matrix mapped over a layered sine-wave heat field.  The result is a
 * shimmering, pixelated "hot road" shimmer that sits as a canvas overlay.
 *
 * The canvas is transparent where heat is low, so the card image beneath
 * shows through naturally.  mix-blend-mode: screen on the canvas container
 * creates a glowing light effect instead of an opaque cover.
 */

// 8×8 Bayer ordered-dither matrix (values 0–63)
const BAYER8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
] as const;

// 4-level palette: [r, g, b, alpha (0-255)]
// Level 0 = fully transparent (skipped), levels 1-3 = increasing heat glow
const PALETTE: readonly [number, number, number, number][] = [
  [  0,   0,   0,   0],  // 0 – transparent (card bg shows through)
  [ 10,  18,  80, 180],  // 1 – deep indigo
  [ 56,  89, 217, 230],  // 2 – brand blue
  [ 60, 220, 190, 255],  // 3 – hot cyan bloom
];

const CELL = 5; // dither cell size in CSS pixels

type Props = { className?: string };

export default function DitherHeatCanvas({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.ceil(rect.width);
      canvas.height = Math.ceil(rect.height);
    };
    resize();

    const render = () => {
      t += 0.013;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / CELL);
      const rows = Math.ceil(h / CELL);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Normalised position [0, 1]
          const nx = col / cols;
          const ny = row / rows;

          // ── Heat field: three overlapping sine/cosine waves ──────────────
          const h1 = Math.sin(nx * 10 + t * 1.3) * Math.cos(ny * 7  - t * 0.9);
          const h2 = Math.sin(nx * 15 - t * 0.7  + ny * 5) * 0.6;
          const h3 = Math.cos(nx *  6 + ny * 12  + t * 1.1) * 0.5;
          // Map (-1..1) → (0..1) and bias toward the bottom of the card
          const raw   = (h1 + h2 + h3) / 2.1;         // roughly -1..1
          const v     = raw * 0.5 + 0.5;               // 0..1
          const bias  = Math.pow(ny, 0.55);            // bottom rows hotter
          const intensity = Math.max(0, Math.min(1, v * bias));

          // ── Bayer ordered dither ─────────────────────────────────────────
          const threshold = BAYER8[row % 8][col % 8] / 64; // 0..1
          // Map continuous intensity → discrete palette index via dithering
          const rawIdx     = intensity * (PALETTE.length - 1);
          const idx        = Math.floor(rawIdx + threshold - 0.5);
          const pidx       = Math.max(0, Math.min(PALETTE.length - 1, idx));

          const [r, g, b, a] = PALETTE[pidx];
          if (a === 0) continue; // transparent – skip drawing

          ctx.fillStyle = `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
          ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

