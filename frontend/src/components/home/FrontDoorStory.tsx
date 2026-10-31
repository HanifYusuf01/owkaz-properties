import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bath, BedDouble, ChevronDown, MapPin, Ruler } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { geoMercator, geoPath, GeoPermissibleObjects } from 'd3-geo';
import { useGetPropertiesQuery, useGetPropertiesStateCountsQuery } from '../../features/properties/propertiesApi';
import { loadNigeriaStates, StateFeature } from '../../utils/nigeriaGeo';
import { normalizeStateName } from '../../utils/nigeriaStateNames';
import { formatPrice } from '../../utils/format';
import { getImageUrl } from '../../utils/imageUrl';

gsap.registerPlugin(ScrollTrigger);

const SIZE = 620;
const MARGIN = 40;
const NAV = 64;
const LABELS = ['Nigeria', 'State', 'Area', 'Property'];
const HOLD = 0.5;
const MOVE = 1;
const TOTAL = 5;
const STOP_TIMES = [0.25, 1.75, 3.25, 4.75];
const DOT_GRID = 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)';

const LAYOUTS = {
  wide: { w: 960, h: 620, cx: 650, cy: 310 },
  narrow: { w: 620, h: 800, cx: 310, cy: 290 },
};

const stepAt = (time: number) => (time < 1 ? 0 : time < 2.5 ? 1 : time < 4 ? 2 : 3);
const railPosition = (time: number) => Math.min(1, Math.max(0, (time - STOP_TIMES[0]) / (STOP_TIMES[3] - STOP_TIMES[0])));

interface View {
  k: number;
  x: number;
  y: number;
}

export const FrontDoorStory = () => {
  const navigate = useNavigate();
  const { data: stateCounts = [] } = useGetPropertiesStateCountsQuery();
  const { data: list } = useGetPropertiesQuery({ limit: 50 });
  const [features, setFeatures] = useState<StateFeature[] | null>(null);
  const [step, setStep] = useState(0);
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches);

  const wrapRef = useRef<HTMLElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const pinsRef = useRef<SVGGElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setWide(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadNigeriaStates().then((loaded) => {
      if (!cancelled) setFeatures(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const layout = wide ? LAYOUTS.wide : LAYOUTS.narrow;

  const story = useMemo(() => {
    const properties = list?.data ?? [];
    if (!features || stateCounts.length === 0 || properties.length === 0) return null;

    const countByKey = new Map<string, number>();
    for (const { state, count } of stateCounts) {
      const key = normalizeStateName(state);
      countByKey.set(key, (countByKey.get(key) ?? 0) + count);
    }
    const total = [...countByKey.values()].reduce((a, b) => a + b, 0);

    const projection = geoMercator().fitExtent(
      [[MARGIN, MARGIN], [SIZE - MARGIN, SIZE - MARGIN]],
      { type: 'FeatureCollection', features } as unknown as GeoPermissibleObjects,
    );
    const pathGen = geoPath(projection);
    const featureByKey = new Map(features.map((f) => [normalizeStateName(f.properties.shapeName), f]));

    const located = (p: (typeof properties)[number]) => p.latitude != null && p.longitude != null;
    const rank = (key: string) =>
      (countByKey.get(key) ?? 0) * 100 + properties.filter((p) => normalizeStateName(p.state) === key && located(p)).length;
    const keys = [...countByKey.keys()].filter((k) => featureByKey.has(k) && properties.some((p) => normalizeStateName(p.state) === k));
    if (keys.length === 0) return null;
    const key = keys.sort((a, b) => rank(b) - rank(a))[0];

    const feature = featureByKey.get(key)!;
    const stateProps = properties.filter((p) => normalizeStateName(p.state) === key);
    const displayState = key === 'fct' ? 'Abuja (FCT)' : stateProps[0].state;

    const pins = stateProps
      .filter(located)
      .map((p) => {
        const xy = projection([Number(p.longitude), Number(p.latitude)]);
        return xy ? { id: p.id, x: xy[0], y: xy[1] } : null;
      })
      .filter((p): p is { id: string; x: number; y: number } => p !== null);

    const featured =
      stateProps.find((p) => located(p) && p.images?.length) ?? stateProps.find((p) => p.featured && p.images?.length) ?? stateProps.find((p) => p.images?.length) ?? stateProps[0];
    const featuredPin = pins.find((p) => p.id === featured.id) ?? null;

    const [[x0, y0], [x1, y1]] = pathGen.bounds(feature as unknown as GeoPermissibleObjects);
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const k1 = Math.min((SIZE * 0.62) / (x1 - x0), (SIZE * 0.62) / (y1 - y0));
    const viewOn = (px: number, py: number, k: number): View => ({ k, x: layout.cx - k * px, y: layout.cy - k * py });
    const pc = pins.length
      ? { x: pins.reduce((s, p) => s + p.x, 0) / pins.length, y: pins.reduce((s, p) => s + p.y, 0) / pins.length }
      : { x: cx, y: cy };
    const view0: View = { k: 1, x: layout.cx - SIZE / 2, y: layout.cy - SIZE / 2 };
    const view1 = viewOn(cx, cy, k1);
    const view2 = viewOn(pc.x, pc.y, k1 * (pins.length ? 2.6 : 1.4));
    const view3 = featuredPin ? viewOn(featuredPin.x, featuredPin.y, k1 * 3.4) : view2;

    const areaCounts = new Map<string, number>();
    stateProps.forEach((p) => areaCounts.set(p.area, (areaCounts.get(p.area) ?? 0) + 1));
    const areas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));

    return {
      paths: features.map((f) => ({
        name: f.properties.shapeName,
        key: normalizeStateName(f.properties.shapeName),
        d: pathGen(f as unknown as GeoPermissibleObjects) ?? '',
      })),
      chosenKey: key,
      displayState,
      stateCount: countByKey.get(key) ?? stateProps.length,
      total,
      statesWithListings: countByKey.size,
      countByKey,
      pins,
      featured,
      featuredPin,
      centre: { x: cx, y: cy },
      areas,
      views: [view0, view1, view2, view3],
    };
  }, [features, stateCounts, list, layout]);

  useEffect(() => {
    if (!story) return;
    const wrap = wrapRef.current;
    const group = groupRef.current;
    const pinGroup = pinsRef.current;
    const chips = chipsRef.current;
    const photo = photoRef.current;
    const intro = introRef.current;
    const info = infoRef.current;
    const rail = railRef.current;
    if (!wrap || !group || !pinGroup || !chips || !photo || !intro || !info || !rail) return;

    const [v0, v1, v2, v3] = story.views;
    const origin = `${(layout.cx / layout.w) * 100}% ${(layout.cy / layout.h) * 100}%`;
    const paintRail = (time: number) => rail.style.setProperty('--p', String(railPosition(time)));
    const syncFixed = () => {
      const k = Number(gsap.getProperty(group, 'scale')) || 1;
      group.querySelectorAll<SVGGElement>('[data-fixed]').forEach((el) => {
        el.setAttribute('transform', `translate(${el.dataset.x} ${el.dataset.y}) scale(${1 / k})`);
      });
    };

    const mm = gsap.matchMedia();
    const build = (scrollTrigger?: ScrollTrigger.Vars) => {
      gsap.set(group, { x: v0.x, y: v0.y, scale: 1, svgOrigin: '0 0' });
      gsap.set([pinGroup, chips, info, '[data-callout]'], { opacity: 0 });
      gsap.set(photo, { clipPath: `circle(0% at ${origin})` });
      const tl = gsap.timeline({ paused: !scrollTrigger, defaults: { ease: 'power2.inOut' }, scrollTrigger, onUpdate: syncFixed });
      tl.to(group, { x: v1.x, y: v1.y, scale: v1.k, duration: MOVE }, HOLD)
        .to('[data-dim]', { opacity: 0.1, duration: MOVE }, HOLD)
        .to('[data-callout]', { opacity: 1, duration: 0.4 }, 1.3)
        .to('[data-callout]', { opacity: 0, duration: 0.4 }, 2.4)
        .to(group, { x: v2.x, y: v2.y, scale: v2.k, duration: MOVE }, 2)
        .to(pinGroup, { opacity: 1, duration: 0.6 }, 2.5)
        .to(chips, { opacity: 1, duration: 0.6 }, 2.7)
        .to(group, { x: v3.x, y: v3.y, scale: v3.k, duration: MOVE }, 3.5)
        .to(chips, { opacity: 0, duration: 0.4 }, 3.5)
        .to(intro, { opacity: 0, y: -16, duration: 0.4 }, 3.6)
        .to(photo, { clipPath: `circle(150% at ${origin})`, duration: 0.95, ease: 'power2.inOut' }, 3.7)
        .fromTo(info, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 4.2)
        .to({}, { duration: 0.001 }, TOTAL - 0.001);
      syncFixed();
      tlRef.current = tl;
      return tl;
    };

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      build({
        trigger: wrap,
        start: `top top+=${NAV}`,
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          const time = self.progress * TOTAL;
          paintRail(time);
          const next = stepAt(time);
          setStep((prev) => (prev === next ? prev : next));
        },
      });
      return () => {
        tlRef.current?.kill();
        tlRef.current = null;
        gsap.set([group, pinGroup, chips, photo, intro, info, '[data-callout]', '[data-dim]'], { clearProps: 'all' });
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      const tl = build();
      tl.time(STOP_TIMES[3]);
      paintRail(STOP_TIMES[3]);
      setStep(3);
      syncFixed();
      return () => {
        tl.kill();
        tlRef.current = null;
      };
    });

    return () => mm.revert();
  }, [story, layout]);

  const goTo = (target: number) => {
    const next = Math.max(0, Math.min(LABELS.length - 1, target));
    if (reduced) {
      tlRef.current?.time(STOP_TIMES[next]);
      railRef.current?.style.setProperty('--p', String(railPosition(STOP_TIMES[next])));
      setStep(next);
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;
    const start = wrap.getBoundingClientRect().top + window.scrollY - NAV;
    const distance = wrap.offsetHeight - window.innerHeight + NAV;
    window.scrollTo({ top: start + (STOP_TIMES[next] / TOTAL) * distance, behavior: 'smooth' });
  };

  if (!story) return null;

  const { displayState, stateCount, total, statesWithListings, areas, featured } = story;
  const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
  const copy = [
    {
      title: 'All of Nigeria, one place to look',
      body: `${plural(total, 'verified listing', 'verified listings')} across ${plural(statesWithListings, 'state', 'states')}. The glowing ones have homes on Owkaz right now.`,
    },
    { title: displayState, body: `${plural(stateCount, 'listing', 'listings')} here at the moment.` },
    {
      title: 'Down to the neighbourhood',
      body: areas.length
        ? `Browse areas such as ${areas.slice(0, 3).map((a) => a.name).join(', ')}.`
        : `Browse the neighbourhoods inside ${displayState}.`,
    },
    { title: 'Open the front door', body: '' },
  ][Math.min(step, 2)];

  return (
    <section
      ref={wrapRef}
      aria-label="From Nigeria to your front door"
      className="relative bg-navy"
      style={reduced ? { height: `calc(100svh - ${NAV}px)` } : { height: '420vh' }}
    >
      <div className={reduced ? 'relative h-full overflow-hidden' : 'sticky overflow-hidden'} style={reduced ? undefined : { top: NAV, height: `calc(100svh - ${NAV}px)` }}>
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `${DOT_GRID}, radial-gradient(ellipse 60% 70% at ${(layout.cx / layout.w) * 100}% 50%, rgba(18,160,142,0.22), transparent 70%)`, backgroundSize: '26px 26px, 100% 100%' }}
        />

        <svg viewBox={`0 0 ${layout.w} ${layout.h}`} className="absolute inset-0 w-full h-full select-none" aria-hidden="true" focusable="false">
          <g ref={groupRef}>
            {story.paths.map((p) => {
              const chosen = p.key === story.chosenKey;
              const hasListings = (story.countByKey.get(p.key) ?? 0) > 0;
              return (
                <path
                  key={p.name}
                  d={p.d}
                  data-dim={chosen ? undefined : ''}
                  fill={chosen ? 'rgba(229,168,74,0.2)' : hasListings ? 'rgba(18,160,142,0.75)' : '#15375b'}
                  stroke={chosen ? '#E5A84A' : '#0B2540'}
                  strokeWidth={chosen ? 2 : 1}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
              );
            })}
            <g data-fixed data-callout data-x={story.centre.x} data-y={story.centre.y} aria-hidden="true">
              <g transform="translate(0 -34)">
                <rect x={-78} y={-16} width={156} height={32} rx={16} fill="#ffffff" />
                <text textAnchor="middle" y={5} fontSize={13} fontWeight={600} fill="#0B2540" fontFamily="Inter, sans-serif">
                  {displayState} · {stateCount}
                </text>
              </g>
              <circle r={5} fill="#E5A84A" />
            </g>
            <g ref={pinsRef}>
              {story.pins.map((p) => (
                <g key={p.id} data-fixed data-x={p.x} data-y={p.y}>
                  {p.id === story.featuredPin?.id && <circle className="pin-ring" r={14} fill="none" stroke="#E5A84A" strokeWidth={2} />}
                  <circle r={p.id === story.featuredPin?.id ? 8 : 6} fill="#E5A84A" stroke="#0B2540" strokeWidth={2} />
                </g>
              ))}
            </g>
          </g>
        </svg>

        <div className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-t from-navy/90 via-navy/35 via-45% to-transparent lg:bg-gradient-to-r lg:from-navy/90 lg:via-navy/50 lg:via-35% lg:to-transparent lg:to-60%" />

        <div ref={photoRef} className="absolute inset-0 z-10 pointer-events-none">
          {featured.images?.[0] && <img src={getImageUrl(featured.images[0])} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-navy/10" />
        </div>

        <div className="absolute z-20 top-5 left-4 right-4 sm:left-8 sm:right-8 flex items-start justify-between gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-teal-light flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-light" /> From Nigeria to your front door
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 backdrop-blur border border-white/15 px-3.5 py-1.5 text-xs text-white/80">
            <span className="font-semibold text-white">{total.toLocaleString()}</span> listings
            <span className="text-white/30">/</span>
            <span className="font-semibold text-white">{statesWithListings}</span> {statesWithListings === 1 ? 'state' : 'states'}
          </div>
        </div>

        <div ref={introRef} className="absolute z-20 left-4 right-4 sm:left-8 bottom-28 sm:bottom-32 lg:max-w-md">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {LABELS[Math.min(step, 2)]}
          </span>
          <div key={Math.min(step, 2)} className="step-in">
            <h2 className="font-display text-3xl sm:text-5xl text-white mt-4 leading-[1.05]">{copy.title}</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mt-3 max-w-md">{copy.body}</p>
          </div>
          {step === 0 && (
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/55">
              Scroll to explore <ChevronDown size={14} className="animate-bounce" />
            </div>
          )}
        </div>

        <div ref={chipsRef} className="absolute z-20 right-4 sm:right-8 bottom-28 sm:bottom-32 left-4 sm:left-auto flex flex-wrap gap-2 sm:justify-end sm:max-w-sm">
          {areas.slice(0, 5).map((a) => (
            <span key={a.name} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 text-xs font-medium text-white">
              <MapPin size={12} className="text-gold-light" />
              {a.name}
              <span className="text-white/50">{a.n}</span>
            </span>
          ))}
        </div>

        <div ref={infoRef} className={`absolute z-20 left-4 right-4 sm:left-8 bottom-28 sm:bottom-32 lg:max-w-xl ${step === 3 ? '' : 'pointer-events-none'}`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-light">Now showing in {displayState}</div>
          <h3 className="font-display text-3xl sm:text-5xl text-white mt-3 leading-[1.05]">{featured.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-white/75 mt-3">
            <MapPin size={14} /> {featured.area}, {featured.lga}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
            <div className="font-display text-3xl text-gold-light">{formatPrice(featured.price)}</div>
            <div className="flex items-center gap-4 text-sm text-white/80">
              {featured.beds != null && (
                <span className="inline-flex items-center gap-1.5"><BedDouble size={16} /> {featured.beds}</span>
              )}
              {featured.baths != null && (
                <span className="inline-flex items-center gap-1.5"><Bath size={16} /> {featured.baths}</span>
              )}
              {featured.sqm != null && (
                <span className="inline-flex items-center gap-1.5"><Ruler size={16} /> {featured.sqm} m²</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate(`/properties/${featured.id}`)}
              className="px-6 py-3 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              View property
            </button>
            <button
              type="button"
              onClick={() => navigate(`/properties?search=${encodeURIComponent(displayState === 'Abuja (FCT)' ? 'FCT' : displayState)}`)}
              className="px-6 py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              More in {displayState}
            </button>
          </div>
        </div>

        <div ref={railRef} className="absolute z-20 left-4 right-[10.5rem] sm:left-8 bottom-5" style={{ '--p': 0 } as CSSProperties}>
          <div className="relative mx-5 sm:mx-10">
            <div className="relative h-px bg-white/25">
              <div className="absolute left-0 top-0 h-px bg-gold" style={{ width: 'calc(var(--p) * 100%)' }} />
              {LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${label}`}
                  aria-current={i === step}
                  className="absolute top-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: `${(i / (LABELS.length - 1)) * 100}%` }}
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      i === step ? 'w-3.5 h-3.5 bg-gold ring-4 ring-gold/25' : i < step ? 'w-2.5 h-2.5 bg-gold' : 'w-2.5 h-2.5 bg-navy border border-white/50'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="relative h-6 mt-3">
              {LABELS.map((label, i) => (
                <span
                  key={label}
                  className={`absolute -translate-x-1/2 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] whitespace-nowrap transition-colors ${
                    i === step ? 'text-white' : 'text-white/45 hidden sm:block'
                  }`}
                  style={{ left: `${(i / (LABELS.length - 1)) * 100}%` }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
