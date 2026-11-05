import { useEffect, useRef, useCallback } from "react";

/**
 * Animated dot grid canvas with morphing circle/square shape.
 * Ported from the DotForge embed specification.
 */
export default function DotGridCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fg = [56, 89, 217];
    const bg = [0, 0, 0];

    function rgbStr(c: number[]) {
      return `rgb(${c[0]},${c[1]},${c[2]})`;
    }
    function rgbaStr(c: number[], a: number) {
      return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    }

    let t = 0;

    function render() {
      t += 0.016;

      const w = canvas!.width;
      const h = canvas!.height;
      const intensity = 50;
      const scale = 4;

      ctx!.fillStyle = rgbStr(bg);
      ctx!.fillRect(0, 0, w, h);

      const gap = Math.max(8, scale * 4);
      const cols = Math.floor(w / gap);
      const rows = Math.floor(h / gap);
      const baseSize = 1.5;
      const maxSize = gap * 0.4;
      const amp = intensity / 50;

      const cx = w / 2;
      const cy = h / 2;
      const shapePhase = t * 0.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = gap / 2 + c * gap;
          const y = gap / 2 + r * gap;

          const dx = (x - cx) / w;
          const dy = (y - cy) / h;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const squareness = Math.sin(shapePhase * 2) * 0.5 + 0.5;
          const circleTest = dist;
          const squareTest = Math.max(Math.abs(dx), Math.abs(dy));
          const shapeTest =
            circleTest * (1 - squareness) + squareTest * squareness;

          const shapeR = 0.25 + Math.sin(shapePhase) * 0.1;
          const inside = shapeTest < shapeR;

          const wave = Math.sin(dist * 20 - t * 3) * 0.5 + 0.5;

          let size: number;
          if (inside) {
            size = baseSize + (maxSize - baseSize) * wave * amp;
          } else {
            size = baseSize + wave * 1 * amp;
          }

          const alpha = inside ? 0.8 + wave * 0.2 : 0.3;

          ctx!.beginPath();
          ctx!.arc(x, y, size, 0, Math.PI * 2);
          ctx!.fillStyle = rgbaStr(fg, alpha);
          ctx!.fill();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    render();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size the canvas to match its CSS layout size for crisp rendering
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

