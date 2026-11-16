export type Vec3 = [number, number, number];

/**
 * Convert longitude and latitude (in degrees) to a 3D unit vector.
 * +X = East, +Y = North, +Z = Facing camera at lon = 0
 */
export function toVec(lon: number, lat: number): Vec3 {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  return [
    cosPhi * Math.sin(lambda),
    Math.sin(phi),
    cosPhi * Math.cos(lambda),
  ];
}

/**
 * Rotate a 3D vector by yaw (around Y axis) and tilt (around X axis).
 */
export function rotate(v: Vec3, yaw: number, tilt: number): Vec3 {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = v[0] * cosY - v[2] * sinY;
  const y1 = v[1];
  const z1 = v[0] * sinY + v[2] * cosY;

  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const x2 = x1;
  const y2 = y1 * cosT - z1 * sinT;
  const z2 = y1 * sinT + z1 * cosT;

  return [x2, y2, z2];
}

/**
 * Spherical linear interpolation between two unit vectors.
 */
export function slerp(a: Vec3, b: Vec3, t: number): Vec3 {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  dot = Math.max(-1, Math.min(1, dot));
  const theta = Math.acos(dot);
  if (Math.abs(theta) < 1e-5) return a;
  const sinTheta = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sinTheta;
  const w2 = Math.sin(t * theta) / sinTheta;
  return [
    a[0] * w1 + b[0] * w2,
    a[1] * w1 + b[1] * w2,
    a[2] * w1 + b[2] * w2,
  ];
}

/**
 * Polygon-based landmass test for major global landmasses.
 */
function isPointInPoly(pt: [number, number], poly: [number, number][]): boolean {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Simplified continent bounds [lon, lat]
const LAND_POLYGONS: [number, number][][] = [
  // North America
  [
    [-168, 65], [-140, 70], [-100, 74], [-60, 60], [-55, 48], [-68, 44],
    [-76, 35], [-81, 25], [-97, 26], [-105, 20], [-88, 16], [-79, 8],
    [-84, 10], [-92, 16], [-106, 23], [-117, 32], [-124, 40], [-125, 50],
    [-140, 60], [-168, 65],
  ],
  // South America
  [
    [-78, 12], [-60, 8], [-50, -2], [-35, -6], [-38, -18], [-48, -28],
    [-56, -34], [-65, -42], [-68, -55], [-75, -50], [-72, -40], [-71, -30],
    [-76, -18], [-80, -5], [-78, 12],
  ],
  // Africa
  [
    [-17, 15], [-6, 36], [10, 37], [25, 32], [32, 31], [35, 28],
    [43, 12], [51, 11], [42, -5], [35, -20], [28, -33], [18, -34],
    [12, -18], [9, 4], [0, 6], [-15, 11], [-17, 15],
  ],
  // Eurasia
  [
    [-10, 36], [0, 44], [-4, 48], [8, 54], [12, 57], [28, 71],
    [60, 70], [100, 77], [140, 72], [170, 66], [160, 56], [142, 50],
    [130, 42], [122, 30], [108, 22], [102, 10], [98, 4], [80, 8],
    [70, 22], [58, 24], [44, 15], [35, 32], [28, 41], [14, 40],
    [2, 38], [-9, 38], [-10, 36],
  ],
  // Australia
  [
    [114, -22], [123, -15], [136, -12], [142, -11], [150, -23],
    [153, -28], [148, -38], [138, -35], [116, -35], [114, -22],
  ],
  // Greenland
  [
    [-52, 60], [-40, 65], [-20, 70], [-20, 82], [-60, 82], [-55, 74], [-52, 60],
  ],
  // Great Britain & Ireland
  [
    [-10, 51], [-5, 50], [2, 52], [0, 58], [-5, 59], [-8, 55], [-10, 51],
  ],
  // Japan
  [
    [130, 31], [132, 34], [140, 36], [142, 44], [145, 43], [139, 35], [130, 31],
  ],
  // Scandinavia
  [
    [5, 58], [12, 56], [18, 59], [24, 65], [28, 71], [15, 68], [5, 62], [5, 58],
  ],
  // India
  [
    [68, 24], [72, 19], [77, 8], [80, 13], [88, 22], [80, 28], [68, 24],
  ],
  // Arabian Peninsula
  [
    [35, 29], [40, 22], [44, 13], [54, 17], [59, 23], [56, 26], [48, 30], [35, 29],
  ],
  // Southeast Asia & Indonesia
  [
    [95, 6], [105, -7], [115, -8], [125, -9], [140, -3], [130, 2], [115, 6], [100, 7], [95, 6],
  ],
  // Madagascar
  [
    [44, -12], [50, -13], [48, -25], [44, -25], [44, -12],
  ],
];

export function isLand(lon: number, lat: number): boolean {
  for (const poly of LAND_POLYGONS) {
    if (isPointInPoly([lon, lat], poly)) return true;
  }
  return false;
}

/**
 * Generate Fibonacci sphere dots distributed on landmasses.
 */
export function landDots(targetSamples: number = 30000): Vec3[] {
  const dots: Vec3[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = (2 - goldenRatio) * (2 * Math.PI);

  for (let i = 0; i < targetSamples; i++) {
    const y = 1 - (i / (targetSamples - 1)) * 2; // -1 to 1
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    const lat = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
    const lon = (Math.atan2(x, z) * 180) / Math.PI;

    if (isLand(lon, lat)) {
      dots.push([x, y, z]);
    }
  }

  return dots;
}

/**
 * Render the globe sphere, atmosphere glow, and land dots to canvas.
 */
export function drawGlobe(
  ctx: CanvasRenderingContext2D,
  dots: Vec3[],
  view: { cx: number; cy: number; r: number; yaw: number; tilt: number },
  landColor: string,
  dotRadius: number,
  glowColor: string
): void {
  const { cx, cy, r, yaw, tilt } = view;

  // Atmosphere outer glow (only if glowColor is provided and not transparent)
  if (glowColor && glowColor !== "transparent") {
    const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.95, cx, cy, r * 1.18);
    glowGrad.addColorStop(0, glowColor);
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.18, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw land dots
  ctx.fillStyle = landColor;
  for (let i = 0; i < dots.length; i++) {
    const [x, y, z] = rotate(dots[i], yaw, tilt);
    if (z > 0) {
      const screenX = cx + x * r;
      const screenY = cy - y * r;
      const alpha = 0.2 + 0.8 * z;
      const size = Math.max(0.8, dotRadius * (0.8 + 0.2 * z));

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

