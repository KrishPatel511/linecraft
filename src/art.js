import { fbm } from './noise';

export const WIDTH = 800;
export const HEIGHT = 600;

export const DEFAULTS = {
  lines: 56,
  amplitude: 58,
  roughness: 6,
  detail: 3,
  spread: 46,
  slope: 0,
  perspective: 38,
  stroke: 1.5,
  resolution: 180,
  occlude: true,
  depthFade: true,
  seed: 7,
};

export const PALETTES = [
  { name: 'Ink', ink: '#1b1a2b', paper: '#f4f1ea' },
  { name: 'Midnight', ink: '#8be9fd', paper: '#12122a' },
  { name: 'Sunset', ink: '#ff5d8f', paper: '#2a1330' },
  { name: 'Mint', ink: '#0f5c4d', paper: '#dff7ec' },
  { name: 'Tiranga', ink: '#138808', paper: '#ffe9cf' },
  { name: 'Neon', ink: '#c6ff3d', paper: '#0b0b0f' },
];

/* One smooth SVG path (quadratic curves through the midpoints) from a list of [x, y]. */
const smoothPath = (pts) => {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return `${d}L${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
};

/**
 * Builds the ridge lines, back (top) to front (bottom), so a paper-coloured fill under each
 * line can hide the lines behind it.
 */
export const buildLines = (p, time = 0) => {
  const marginX = 70;
  const top = 90;
  const bottom = HEIGHT - 70;
  const usableW = WIDTH - marginX * 2;
  const cx = WIDTH / 2;
  const peakWidth = (p.spread / 100) * usableW * 0.65 + 40;
  const amp = (p.amplitude / 100) * 190;
  const freq = p.roughness / 5;
  const lines = [];

  for (let i = 0; i < p.lines; i += 1) {
    const t = p.lines === 1 ? 0 : i / (p.lines - 1);
    /* perspective squeezes the back lines closer together */
    const k = 1 + (p.perspective / 100) * 1.6;
    const y0 = top + (bottom - top) * (Math.pow(t, k));
    const pts = [];
    for (let s = 0; s <= p.resolution; s += 1) {
      const u = s / p.resolution;
      const x = marginX + u * usableW;
      const env = Math.exp(-(((x - cx) / peakWidth) ** 2));
      const n = fbm(u * freq * 3 + time * 0.35, t * 2.4 + time * 0.15, p.detail, p.seed);
      const edge = Math.sin(Math.PI * u); /* pins the line ends to the baseline */
      const lift = Math.max(0, n * 0.5 + 0.5) * env * edge * amp * (0.35 + 0.65 * t);
      pts.push([x, y0 - lift + ((x - cx) / usableW) * p.slope * 1.6 * (0.4 + t)]);
    }
    lines.push({ t, d: smoothPath(pts), first: pts[0], last: pts[pts.length - 1] });
  }
  return lines;
};

export const randomSeed = () => Math.floor(Math.random() * 100000);
