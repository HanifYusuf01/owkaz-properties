import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WIDTH = 1440;
const HEIGHT = 360;
const CELL_W = 16;
const CELL_H = 20;

interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  lit: { x: number; y: number; teal: boolean; delay: number }[];
}

interface LayerSpec {
  key: 'back' | 'mid' | 'front';
  fill: string;
  minH: number;
  maxH: number;
  minCols: number;
  maxCols: number;
  litChance: number;
  seed: number;
}

const LAYERS: LayerSpec[] = [
  { key: 'back', fill: '#193a5e', minH: 6, maxH: 10, minCols: 3, maxCols: 6, litChance: 0, seed: 7 },
  { key: 'mid', fill: '#12304f', minH: 5, maxH: 8, minCols: 3, maxCols: 6, litChance: 0.07, seed: 21 },
  { key: 'front', fill: '#0a2036', minH: 3, maxH: 6, minCols: 3, maxCols: 7, litChance: 0.09, seed: 53 },
];

function random(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLayer(spec: LayerSpec): Building[] {
  const rand = random(spec.seed);
  const buildings: Building[] = [];
  let x = -CELL_W * Math.floor(rand() * 3);
  while (x < WIDTH) {
    const cols = spec.minCols + Math.floor(rand() * (spec.maxCols - spec.minCols + 1));
    const rows = spec.minH + Math.floor(rand() * (spec.maxH - spec.minH + 1));
    const w = cols * CELL_W;
    const h = rows * CELL_H;
    const y = HEIGHT - h;
    const lit: Building['lit'] = [];
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if (rand() < spec.litChance) {
          lit.push({ x: x + c * CELL_W + 4, y: y + r * CELL_H + 5, teal: rand() < 0.25, delay: rand() * 5 });
        }
      }
    }
    buildings.push({ x, y, w, h, lit });
    x += w + CELL_W * Math.floor(rand() * 2);
  }
  return buildings;
}

export const Skyline = () => {
  const root = useRef<SVGSVGElement>(null);
  const layers = useMemo(() => LAYERS.map((spec) => ({ spec, buildings: buildLayer(spec) })), []);

  useEffect(() => {
    const svg = root.current;
    const hero = svg?.parentElement;
    if (!svg || !hero) return;

    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
        intro
          .from('.sky-back .sky-building', { y: HEIGHT, duration: 1.4, stagger: { each: 0.03, from: 'center' } })
          .from('.sky-mid .sky-building', { y: HEIGHT, duration: 1.3, stagger: { each: 0.03, from: 'center' } }, 0.15)
          .from('.sky-front .sky-building', { y: HEIGHT, duration: 1.2, stagger: { each: 0.03, from: 'center' } }, 0.3)
          .from('.sky-lit', { opacity: 0, duration: 0.5, stagger: { each: 0.012, from: 'random' } }, 1.1);

        const drift = { back: 55, mid: 28, front: 0 };
        (Object.keys(drift) as (keyof typeof drift)[]).forEach((key) => {
          gsap.to(`.sky-${key}`, {
            y: drift[key],
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.5 },
          });
        });
      }, svg);
      return () => ctx.revert();
    });

    mm.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
      const sway = { back: 8, mid: 16, front: 28 };
      const movers = (Object.keys(sway) as (keyof typeof sway)[]).map((key) => ({
        key,
        to: gsap.quickTo(svg.querySelector(`.sky-${key}`), 'x', { duration: 0.9, ease: 'power3.out' }),
      }));
      const onMove = (e: PointerEvent) => {
        const bounds = hero.getBoundingClientRect();
        const ratio = (e.clientX - bounds.left) / bounds.width - 0.5;
        movers.forEach(({ key, to }) => to(-ratio * sway[key] * 2));
      };
      hero.addEventListener('pointermove', onMove);
      return () => hero.removeEventListener('pointermove', onMove);
    });

    return () => mm.revert();
  }, []);

  return (
    <svg
      ref={root}
      className="absolute inset-x-0 bottom-0 w-full pointer-events-none"
      style={{ height: 'clamp(150px, 17vw, 320px)' }}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="sky-windows" width={CELL_W} height={CELL_H} patternUnits="userSpaceOnUse">
          <rect x="4" y="5" width="7" height="10" rx="1" fill="rgba(255,255,255,0.07)" />
        </pattern>
      </defs>
      {layers.map(({ spec, buildings }) => (
        <g key={spec.key} className={`sky-${spec.key}`}>
          {buildings.map((b, i) => (
            <g key={i} className="sky-building">
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={spec.fill} />
              {spec.key !== 'back' && <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="url(#sky-windows)" />}
              {b.lit.map((w, j) => (
                <rect
                  key={j}
                  className="sky-lit"
                  x={w.x}
                  y={w.y}
                  width={7}
                  height={10}
                  rx={1}
                  fill={w.teal ? '#12A08E' : '#E5A84A'}
                  style={{ animationDelay: `${w.delay}s` }}
                />
              ))}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
};
