import React, { useEffect, useRef, useState } from 'react';
import { Artwork } from './Artwork';
import { DEFAULTS, PALETTES, WIDTH, HEIGHT, randomSeed } from './art';

const SLIDERS = [
  { key: 'lines', label: 'Lines', min: 12, max: 140, step: 1, hint: 'How many lines are stacked' },
  { key: 'amplitude', label: 'Peak height', min: 0, max: 100, step: 1, hint: 'How tall the ridges grow' },
  { key: 'roughness', label: 'Wobble', min: 1, max: 20, step: 0.5, hint: 'How many bumps per line' },
  { key: 'detail', label: 'Detail', min: 1, max: 5, step: 1, hint: 'Fine jitter on top of the shape' },
  { key: 'spread', label: 'Spread', min: 5, max: 100, step: 1, hint: 'Width of the central mountain' },
  { key: 'slope', label: 'Slope', min: -60, max: 60, step: 1, hint: 'Tilts everything left or right' },
  { key: 'perspective', label: 'Perspective', min: 0, max: 100, step: 1, hint: 'Squeezes the distant lines together' },
  { key: 'stroke', label: 'Line weight', min: 0.5, max: 4, step: 0.1, hint: 'Thickness of each line' },
];

const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const serialize = (svg) => new XMLSerializer().serializeToString(svg);

export default function App() {
  const [params, setParams] = useState(DEFAULTS);
  const [palette, setPalette] = useState(0);
  const [ink, setInk] = useState(PALETTES[0].ink);
  const [paper, setPaper] = useState(PALETTES[0].paper);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!playing) return undefined;
    let raf;
    let last = performance.now();
    let acc = 0;
    const loop = (now) => {
      acc += now - last;
      last = now;
      if (acc > 33) {
        setTime((t) => t + (acc / 1000) * 0.6);
        acc = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const set = (key, value) => setParams((p) => ({ ...p, [key]: value }));

  const pickPalette = (i) => {
    setPalette(i);
    setInk(PALETTES[i].ink);
    setPaper(PALETTES[i].paper);
  };

  const randomise = () => {
    const r = (a, b) => Math.round((a + Math.random() * (b - a)) * 10) / 10;
    setParams((p) => ({
      ...p,
      seed: randomSeed(),
      lines: Math.round(r(30, 100)),
      amplitude: Math.round(r(30, 90)),
      roughness: r(3, 14),
      detail: Math.round(r(1, 4)),
      spread: Math.round(r(20, 80)),
      slope: Math.round(r(-30, 30)),
      perspective: Math.round(r(10, 70)),
    }));
    pickPalette(Math.floor(Math.random() * PALETTES.length));
  };

  const reset = () => {
    setParams(DEFAULTS);
    pickPalette(0);
    setTime(0);
    setPlaying(false);
  };

  const exportSvg = () => {
    downloadBlob(new Blob([serialize(svgRef.current)], { type: 'image/svg+xml' }), `linecraft-${params.seed}.svg`);
  };

  const exportPng = () => {
    const url = URL.createObjectURL(new Blob([serialize(svgRef.current)], { type: 'image/svg+xml' }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = WIDTH * 3;
      canvas.height = HEIGHT * 3;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => downloadBlob(b, `linecraft-${params.seed}.png`), 'image/png');
    };
    img.src = url;
  };

  return (
    <div className="app">
      <header className="top">
        <a className="brand" href="/" aria-label="Linecraft home">
          <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="9" fill="var(--brand)" />
            <path d="M5 11q5.5-5 11 0t11 0M5 17.5q5.5-7 11 0t11 0M5 24q5.5-5 11 0t11 0" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          </svg>
          <span>Linecraft</span>
        </a>
        <p className="tag">A generative art machine. Drag the sliders, make something weird.</p>
      </header>

      <main className="stage">
        <section className="canvas-wrap" aria-label="Artwork preview">
          <div className="paper">
            <Artwork ref={svgRef} params={params} ink={ink} paper={paper} time={time} />
          </div>
          <div className="actions">
            <button className="btn primary" onClick={randomise}>
              <span aria-hidden="true">🎲</span> Surprise me
            </button>
            <button className={`btn ${playing ? 'active' : ''}`} onClick={() => setPlaying(!playing)} aria-pressed={playing}>
              {playing ? '❚❚ Pause' : '▶ Animate'}
            </button>
            <button className="btn" onClick={exportSvg}>Download SVG</button>
            <button className="btn" onClick={exportPng}>Download PNG</button>
          </div>
        </section>

        <aside className="panel" aria-label="Controls">
          <h2>Shape</h2>
          {SLIDERS.map((s) => (
            <label key={s.key} className="slider">
              <span className="row">
                <span className="name">{s.label}</span>
                <output>{Number(params[s.key]).toFixed(s.step < 1 ? 1 : 0)}</output>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={params[s.key]}
                onChange={(e) => set(s.key, Number(e.target.value))}
                aria-describedby={`hint-${s.key}`}
              />
              <span className="hint" id={`hint-${s.key}`}>{s.hint}</span>
            </label>
          ))}

          <h2>Look</h2>
          <div className="swatches" role="group" aria-label="Colour palettes">
            {PALETTES.map((p, i) => (
              <button
                key={p.name}
                className={`swatch ${palette === i ? 'on' : ''}`}
                style={{ background: p.paper, color: p.ink }}
                onClick={() => pickPalette(i)}
                aria-pressed={palette === i}
                title={p.name}
              >
                <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true"><path d="M1 11q5-9 10 0t10 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
          <div className="colors">
            <label>Line <input type="color" value={ink} onChange={(e) => setInk(e.target.value)} /></label>
            <label>Paper <input type="color" value={paper} onChange={(e) => setPaper(e.target.value)} /></label>
          </div>
          <label className="check">
            <input type="checkbox" checked={params.occlude} onChange={(e) => set('occlude', e.target.checked)} />
            Hide lines behind the ridges
          </label>
          <label className="check">
            <input type="checkbox" checked={params.depthFade} onChange={(e) => set('depthFade', e.target.checked)} />
            Fade distant lines
          </label>

          <div className="seed">
            <span>Seed</span>
            <code>{params.seed}</code>
            <button className="btn small" onClick={() => set('seed', randomSeed())}>New</button>
            <button className="btn small ghost" onClick={reset}>Reset</button>
          </div>
        </aside>
      </main>

      <footer className="foot">
        <p>© 2026–present Krish Patel. All Rights Reserved.</p>
        <p className="small">Everything you make here is yours to keep. The Linecraft software, design and code are not licensed for copying or reuse.</p>
      </footer>
    </div>
  );
}
