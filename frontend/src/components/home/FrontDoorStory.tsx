import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
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
const EDGE_FADE = 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent), linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)';
const NAV = 64;
const LABELS = ['Nigeria', 'State', 'Area', 'Property'];
const HOLD = 0.5;
const MOVE = 1;
const TOTAL = 5;
const STOP_TIMES = [0.25, 1.75, 3.25, 4.75];

const stepAt = (time: number) => (time < 1 ? 0 : time < 2.5 ? 1 : time < 4 ? 2 : 3);

interface View {
  k: number;
  x: number;
  y: number;
}

const viewOn = (cx: number, cy: number, k: number): View => ({ k, x: SIZE / 2 - k * cx, y: SIZE / 2 - k * cy });

export const FrontDoorStory = () => {
  const navigate = useNavigate();
  const { data: stateCounts = [] } = useGetPropertiesStateCountsQuery();
  const { data: list } = useGetPropertiesQuery({ limit: 50 });
  const [features, setFeatures] = useState<StateFeature[] | null>(null);
  const [step, setStep] = useState(0);

  const wrapRef = useRef<HTMLElement>(null);
  const mapRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const pinsRef = useRef<SVGGElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    let cancelled = false;
    loadNigeriaStates().then((loaded) => {
      if (!cancelled) setFeatures(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
    const view1 = viewOn(cx, cy, k1);
    const pc = pins.length
      ? { x: pins.reduce((s, p) => s + p.x, 0) / pins.length, y: pins.reduce((s, p) => s + p.y, 0) / pins.length }
      : { x: cx, y: cy };
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
      areas,
      views: [view1, view2, view3],
    };
  }, [features, stateCounts, list]);

  useEffect(() => {
    if (!story) return;
    const wrap = wrapRef.current;
    const group = groupRef.current;
    const pinGroup = pinsRef.current;
    const map = mapRef.current;
    const card = cardRef.current;
    const chips = chipsRef.current;
    if (!wrap || !group || !pinGroup || !map || !card || !chips) return;

    const [v1, v2, v3] = story.views;
    const syncPins = () => {
      const k = Number(gsap.getProperty(group, 'scale')) || 1;
      pinGroup.querySelectorAll('circle').forEach((c) => {
        const base = Number(c.getAttribute('data-r'));
        c.setAttribute('r', String(base / k));
        c.setAttribute('stroke-width', String(2 / k));
      });
    };

    const mm = gsap.matchMedia();
    const build = (scrollTrigger?: ScrollTrigger.Vars) => {
      gsap.set(group, { x: 0, y: 0, scale: 1, svgOrigin: '0 0' });
      gsap.set([pinGroup, chips, card], { opacity: 0 });
      const tl = gsap.timeline({ paused: !scrollTrigger, defaults: { ease: 'power2.inOut' }, scrollTrigger, onUpdate: syncPins });
      tl.to(group, { x: v1.x, y: v1.y, scale: v1.k, duration: MOVE }, HOLD)
        .to('[data-dim]', { opacity: 0.08, duration: MOVE }, HOLD)
        .to(group, { x: v2.x, y: v2.y, scale: v2.k, duration: MOVE }, HOLD + MOVE + HOLD)
        .to(pinGroup, { opacity: 1, duration: 0.6 }, 2.5)
        .to(chips, { opacity: 1, y: 0, duration: 0.6 }, 2.7)
        .to(group, { x: v3.x, y: v3.y, scale: v3.k, duration: MOVE }, 3.5)
        .to(chips, { opacity: 0, duration: 0.4 }, 3.5)
        .to(map, { opacity: 0.4, duration: MOVE }, 3.5)
        .fromTo(card, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 3.9)
        .to({}, { duration: 0.001 }, TOTAL - 0.001);
      tlRef.current = tl;
      return tl;
    };

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      build({
        trigger: wrap,
        start: `top top+=${NAV}`,
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => setStep((prev) => {
          const next = stepAt(self.progress * TOTAL);
          return next === prev ? prev : next;
        }),
      });
      return () => {
        tlRef.current?.kill();
        tlRef.current = null;
        gsap.set([group, pinGroup, chips, card, map, '[data-dim]'], { clearProps: 'all' });
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      const tl = build();
      tl.time(STOP_TIMES[3]);
      setStep(3);
      syncPins();
      return () => {
        tl.kill();
        tlRef.current = null;
      };
    });

    return () => mm.revert();
  }, [story]);

  const goTo = (target: number) => {
    const next = Math.max(0, Math.min(LABELS.length - 1, target));
    if (reduced) {
      tlRef.current?.time(STOP_TIMES[next]);
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
      title: 'All of Nigeria',
      body: `${plural(total, 'verified listing', 'verified listings')} across ${plural(statesWithListings, 'state', 'states')}. Highlighted states have homes on Owkaz right now.`,
    },
    { title: displayState, body: `${plural(stateCount, 'listing', 'listings')} in ${displayState} at the moment.` },
    {
      title: 'Find your area',
      body: areas.length
        ? `Browse neighbourhoods such as ${areas.slice(0, 3).map((a) => a.name).join(', ')}.`
        : `Browse the neighbourhoods inside ${displayState}.`,
    },
    { title: 'Open the front door', body: 'See the photos, price and full details, then send an enquiry to our team.' },
  ][step];

  return (
    <section
      ref={wrapRef}
      aria-label="From Nigeria to your front door"
      className="relative bg-white"
      style={reduced ? undefined : { height: '420vh' }}
    >
      <div className={reduced ? 'py-16' : 'sticky overflow-hidden'} style={reduced ? undefined : { top: NAV, height: `calc(100svh - ${NAV}px)` }}>
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center gap-3 lg:gap-12">
          <div className="pt-4 lg:pt-0 order-2 lg:order-1 pb-4 lg:pb-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" /> From Nigeria to your front door
            </div>
            <div key={step} className="step-in">
              <h2 className="font-display text-3xl sm:text-4xl text-navy mt-3 lg:mt-5">{copy.title}</h2>
              <p className="text-muted text-sm sm:text-base leading-relaxed mt-2 lg:mt-3 min-h-[3.5rem]">{copy.body}</p>
            </div>

            <ol className="hidden sm:block mt-6 space-y-2.5">
              {LABELS.map((label, i) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    className={`flex items-center gap-3 text-sm transition-colors ${i === step ? 'text-navy font-semibold' : i < step ? 'text-navy/70' : 'text-muted'}`}
                  >
                    <span className={`h-0.5 transition-all duration-300 ${i === step ? 'w-10 bg-gold' : i < step ? 'w-4 bg-gold' : 'w-4 bg-border'}`} />
                    {label}
                  </button>
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-3 mt-4 lg:mt-7">
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                aria-label="Previous step"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-navy hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => goTo(step + 1)}
                disabled={step === LABELS.length - 1}
                aria-label="Next step"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-navy hover:border-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight size={16} />
              </button>
              <span className="text-xs text-muted tabular-nums">{step + 1} / {LABELS.length}</span>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 flex-1 min-h-0 w-full lg:h-full flex items-center justify-center">
            <svg ref={mapRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full max-h-[70svh] lg:max-h-full select-none"
              style={{ WebkitMaskImage: EDGE_FADE, maskImage: EDGE_FADE, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }}
              aria-hidden="true"
              focusable="false"
            >
              <g ref={groupRef}>
                {story.paths.map((p) => {
                  const chosen = p.key === story.chosenKey;
                  const hasListings = (story.countByKey.get(p.key) ?? 0) > 0;
                  return (
                    <path
                      key={p.name}
                      d={p.d}
                      data-dim={chosen ? undefined : ''}
                      fill={chosen ? '#F3DDB1' : hasListings ? '#9ED6CD' : '#EEEAE2'}
                      stroke={chosen ? '#C8882A' : '#ffffff'}
                      strokeWidth={chosen ? 2 : 1}
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                  );
                })}
                <g ref={pinsRef}>
                  {story.pins.map((p) => (
                    <circle key={p.id} cx={p.x} cy={p.y} data-r={p.id === story.featuredPin?.id ? 9 : 6} r={6} fill="#C8882A" stroke="#ffffff" strokeWidth={2} />
                  ))}
                  {story.featuredPin && (
                    <circle cx={story.featuredPin.x} cy={story.featuredPin.y} data-r={16} r={16} fill="none" stroke="#C8882A" strokeWidth={2} opacity={0.5} />
                  )}
                </g>
              </g>
            </svg>

            <div ref={chipsRef} className="absolute left-0 right-0 bottom-2 flex flex-wrap gap-2 justify-center px-2" style={{ transform: 'translateY(12px)' }}>
              {areas.slice(0, 5).map((a) => (
                <span key={a.name} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border shadow-sm px-3 py-1.5 text-xs font-medium text-navy">
                  <MapPin size={12} className="text-gold" />
                  {a.name}
                  <span className="text-muted">{a.n}</span>
                </span>
              ))}
            </div>

            <div
              ref={cardRef}
              className={`absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl border border-border shadow-2xl overflow-hidden ${step === 3 ? '' : 'pointer-events-none'}`}
            >
              {featured.images?.[0] && (
                <img src={getImageUrl(featured.images[0])} alt={featured.title} className="w-full h-28 sm:h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="font-display text-base text-navy leading-snug line-clamp-2">{featured.title}</div>
                <div className="flex items-center gap-1 text-xs text-muted mt-1">
                  <MapPin size={12} /> {featured.area}, {displayState}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="font-display text-lg text-navy">{formatPrice(featured.price)}</div>
                  <button
                    type="button"
                    onClick={() => navigate(`/properties/${featured.id}`)}
                    className="px-4 py-2 rounded-lg bg-teal text-white text-xs font-semibold hover:bg-teal-light hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    View property
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
