import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bath, BedDouble, Building2, ChevronDown, MapPin, Ruler } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { geoMercator, geoPath, GeoPermissibleObjects } from 'd3-geo';
import { useGetPropertiesQuery, useGetPropertiesStateCountsQuery, useGetPropertyPreviewQuery } from '../../features/properties/propertiesApi';
import { useGetContentQuery } from '../../features/content/contentApi';
import { useGetProjectByIdQuery } from '../../features/projects/projectsApi';
import { lgaKey, LgaFeature, loadNigeriaStates, loadStateLgas, StateFeature } from '../../utils/nigeriaGeo';
import { normalizeStateName } from '../../utils/nigeriaStateNames';
import { formatPrice } from '../../utils/format';
import { compactUnitSummary, priceBounds } from '../../utils/projectPricing';
import { getImageUrl } from '../../utils/imageUrl';

gsap.registerPlugin(ScrollTrigger);

const SIZE = 620;
const MARGIN = 40;
const NAV = 64;
const LABELS = ['Nigeria', 'State', 'LGA', 'Area', 'Property'];
const HOLD = 0.5;
const MOVE = 1;
const TOTAL = 6.5;
const STOP_TIMES = [0.25, 1.75, 3.25, 4.75, 6.25];
const LAST = LABELS.length - 1;
const DOT_GRID = 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)';

const LAYOUTS = {
  wide: { w: 960, h: 620, cx: 650, cy: 310 },
  narrow: { w: 620, h: 640, cx: 310, cy: 320 },
};

type Layout = (typeof LAYOUTS)['wide'];

const stepAt = (time: number) => (time < 1 ? 0 : time < 2.5 ? 1 : time < 4 ? 2 : time < 5.5 ? 3 : 4);
const railPosition = (time: number) => Math.min(1, Math.max(0, (time - STOP_TIMES[0]) / (STOP_TIMES[LAST] - STOP_TIMES[0])));

interface Destination {
  kind: 'property' | 'project';
  id: string;
  title: string;
  lga: string | null;
  place: string;
  image?: string;
  price: string | null;
  unitSummary: string | null;
  beds: number | null;
  baths: number | null;
  sqm: number | null;
  units: string | null;
  href: string;
  cta: string;
  moreLabel: string;
  moreHref: string;
}

interface View {
  k: number;
  x: number;
  y: number;
}

const viewOn = (layout: Layout, px: number, py: number, k: number): View => ({ k, x: layout.cx - k * px, y: layout.cy - k * py });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const FrontDoorStory = () => {
  const navigate = useNavigate();
  const { data: stateCounts = [] } = useGetPropertiesStateCountsQuery();
  const { data: list } = useGetPropertiesQuery({ limit: 50 });
  const { data: spotlightContent, isLoading: spotlightContentLoading } = useGetContentQuery('spotlight');
  const spotlightProjectId = spotlightContent?.projectId ?? '';
  const spotlightId = spotlightProjectId ? '' : spotlightContent?.propertyId ?? '';
  const { data: spotlightProperty, isLoading: spotlightLoading } = useGetPropertyPreviewQuery(spotlightId, { skip: !spotlightId });
  const { data: spotlightProject, isLoading: spotlightProjectLoading } = useGetProjectByIdQuery(spotlightProjectId, { skip: !spotlightProjectId });
  const spotlightReady = !spotlightContentLoading && !(spotlightId && spotlightLoading) && !(spotlightProjectId && spotlightProjectLoading);
  const [features, setFeatures] = useState<StateFeature[] | null>(null);
  const [lgas, setLgas] = useState<{ key: string; features: LgaFeature[] } | null>(null);
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

  const base = useMemo(() => {
    if (!spotlightReady) return null;
    const listed = list?.data ?? [];
    const properties = spotlightProperty && !listed.some((p) => p.id === spotlightProperty.id) ? [spotlightProperty, ...listed] : listed;
    const projectKey = spotlightProject ? normalizeStateName(spotlightProject.state) : null;
    if (!features) return null;
    if (!(projectKey && features.some((f) => normalizeStateName(f.properties.shapeName) === projectKey)) && (stateCounts.length === 0 || properties.length === 0)) return null;

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
    const spotlightKey = spotlightProperty ? normalizeStateName(spotlightProperty.state) : null;
    const chosenProject = spotlightProject && projectKey && featureByKey.has(projectKey) ? spotlightProject : null;
    const chosen = !chosenProject && spotlightProperty && spotlightKey && featureByKey.has(spotlightKey) ? spotlightProperty : null;
    const keys = [...countByKey.keys()].filter((k) => featureByKey.has(k) && properties.some((p) => normalizeStateName(p.state) === k));
    if (keys.length === 0 && !chosen && !chosenProject) return null;
    const key = chosenProject ? projectKey! : chosen ? spotlightKey! : keys.sort((a, b) => rank(b) - rank(a))[0];

    const feature = featureByKey.get(key)!;
    const stateProps = properties.filter((p) => normalizeStateName(p.state) === key);
    const displayState = key === 'fct' ? 'Abuja (FCT)' : chosenProject?.state ?? stateProps[0].state;

    const pins = stateProps
      .filter(located)
      .map((p) => {
        const xy = projection([Number(p.longitude), Number(p.latitude)]);
        return xy ? { id: p.id, x: xy[0], y: xy[1] } : null;
      })
      .filter((p): p is { id: string; x: number; y: number } => p !== null);

    const featuredProperty = chosenProject
      ? null
      : chosen ??
        stateProps.find((p) => located(p) && p.images?.length) ?? stateProps.find((p) => p.featured && p.images?.length) ?? stateProps.find((p) => p.images?.length) ?? stateProps[0];
    const featuredPin = featuredProperty ? pins.find((p) => p.id === featuredProperty.id) ?? null : null;

    // What the story lands on, whether that is a property or a project.
    const featured: Destination = chosenProject
      ? {
          kind: 'project',
          id: chosenProject.id,
          title: chosenProject.name,
          lga: chosenProject.lga,
          place: [chosenProject.location, chosenProject.lga].filter(Boolean).join(', '),
          image: chosenProject.images?.[0],
          price: priceBounds(chosenProject).from ? `From ${formatPrice(priceBounds(chosenProject).from!)}` : null,
          unitSummary: compactUnitSummary(chosenProject, 3),
          beds: null,
          baths: null,
          sqm: null,
          units: chosenProject.totalUnits > 0 ? `${chosenProject.availableUnits} of ${chosenProject.totalUnits} units available` : null,
          href: `/projects/${chosenProject.id}`,
          cta: 'View project',
          moreLabel: 'All projects',
          moreHref: '/projects',
        }
      : {
          kind: 'property',
          id: featuredProperty!.id,
          title: featuredProperty!.title,
          lga: featuredProperty!.lga,
          place: `${featuredProperty!.area}, ${featuredProperty!.lga}`,
          image: featuredProperty!.images?.[0],
          price: formatPrice(featuredProperty!.price),
          unitSummary: null,
          beds: featuredProperty!.beds ?? null,
          baths: featuredProperty!.baths ?? null,
          sqm: featuredProperty!.sqm ?? null,
          units: null,
          href: `/properties/${featuredProperty!.id}`,
          cta: 'View property',
          moreLabel: `More in ${displayState.replace(' (FCT)', '')}`,
          moreHref: `/properties?search=${encodeURIComponent(displayState === 'Abuja (FCT)' ? 'FCT' : displayState)}`,
        };

    const [[x0, y0], [x1, y1]] = pathGen.bounds(feature as unknown as GeoPermissibleObjects);
    const k1 = Math.min((SIZE * 0.62) / (x1 - x0), (SIZE * 0.62) / (y1 - y0));

    return {
      pathGen,
      paths: features.map((f) => ({
        name: f.properties.shapeName,
        key: normalizeStateName(f.properties.shapeName),
        d: pathGen(f as unknown as GeoPermissibleObjects) ?? '',
      })),
      chosenKey: key,
      displayState,
      stateCount: countByKey.get(key) ?? stateProps.length,
      stateHasListings: (countByKey.get(key) ?? stateProps.length) > 0,
      total,
      statesWithListings: countByKey.size,
      countByKey,
      stateProps,
      pins,
      featured,
      featuredPin,
      centre: { x: (x0 + x1) / 2, y: (y0 + y1) / 2 },
      k1,
    };
  }, [features, stateCounts, list, spotlightReady, spotlightProperty, spotlightProject]);

  const chosenKey = base?.chosenKey;
  useEffect(() => {
    if (!chosenKey) return;
    let cancelled = false;
    loadStateLgas(chosenKey)
      .then((loaded) => {
        if (!cancelled) setLgas({ key: chosenKey, features: loaded });
      })
      .catch(() => {
        if (!cancelled) setLgas({ key: chosenKey, features: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [chosenKey]);

  const story = useMemo(() => {
    if (!base || !lgas || lgas.key !== base.chosenKey) return null;
    const { pathGen, centre, k1, stateProps, pins, featured, featuredPin } = base;

    const items = lgas.features.map((f) => {
      const geometry = f as unknown as GeoPermissibleObjects;
      const [[bx0, by0], [bx1, by1]] = pathGen.bounds(geometry);
      const [lx, ly] = pathGen.centroid(geometry);
      return {
        name: f.properties.name,
        key: lgaKey(f.properties.name),
        d: pathGen(geometry) ?? '',
        w: bx1 - bx0,
        h: by1 - by0,
        cx: lx,
        cy: ly,
      };
    });

    const countByLga = new Map<string, number>();
    stateProps.forEach((p) => countByLga.set(lgaKey(p.lga), (countByLga.get(lgaKey(p.lga)) ?? 0) + 1));
    const chosenLga = items.find((i) => i.key === lgaKey(featured.lga)) ?? null;

    const lgaProps = chosenLga ? stateProps.filter((p) => lgaKey(p.lga) === chosenLga.key) : stateProps;
    const areaCounts = new Map<string, number>();
    lgaProps.forEach((p) => areaCounts.set(p.area, (areaCounts.get(p.area) ?? 0) + 1));
    const areas = [...areaCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
    const lgaPropIds = new Set(lgaProps.map((p) => p.id));
    const lgaPins = pins.filter((p) => lgaPropIds.has(p.id));

    const view0: View = { k: 1, x: layout.cx - SIZE / 2, y: layout.cy - SIZE / 2 };
    const view1 = viewOn(layout, centre.x, centre.y, k1);
    const view2 = chosenLga
      ? viewOn(layout, lerp(centre.x, chosenLga.cx, 0.55), lerp(centre.y, chosenLga.cy, 0.55), k1 * 1.5)
      : viewOn(layout, centre.x, centre.y, k1 * 1.15);
    let view3: View;
    if (chosenLga) {
      const k = Math.min((SIZE * 0.55) / Math.max(chosenLga.w, 1), (SIZE * 0.55) / Math.max(chosenLga.h, 1));
      view3 = viewOn(layout, chosenLga.cx, chosenLga.cy, Math.min(k, k1 * 30));
    } else {
      const source = lgaPins.length ? lgaPins : pins;
      const pc = source.length
        ? { x: source.reduce((s, p) => s + p.x, 0) / source.length, y: source.reduce((s, p) => s + p.y, 0) / source.length }
        : centre;
      view3 = viewOn(layout, pc.x, pc.y, k1 * (source.length ? 2.6 : 1.4));
    }
    const view4 = featuredPin ? viewOn(layout, featuredPin.x, featuredPin.y, view3.k * 1.8) : view3;

    return {
      ...base,
      lgaItems: items.map((i) => ({
        ...i,
        chosen: i === chosenLga,
        count: countByLga.get(i.key) ?? 0,
        showLabel: i === chosenLga || (i.w * view2.k >= i.name.length * 6 + 10 && (!chosenLga || Math.hypot(i.cx - chosenLga.cx, i.cy - chosenLga.cy) * view2.k >= 80)),
      })),
      lgaTotal: items.length,
      lgaWithListings: items.filter((i) => countByLga.has(i.key)).length,
      chosenLga,
      chosenLgaCount: chosenLga ? countByLga.get(chosenLga.key) ?? 0 : 0,
      areas,
      views: [view0, view1, view2, view3, view4],
    };
  }, [base, lgas, layout]);

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

    const q = gsap.utils.selector(wrap);
    const [v0, v1, v2, v3, v4] = story.views;
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
      gsap.set([pinGroup, chips, info, ...q('[data-callout]'), ...q('[data-lga-layer]'), ...q('[data-lga-label]')], { opacity: 0 });
      gsap.set(photo, { clipPath: `circle(0% at ${origin})` });
      const tl = gsap.timeline({ paused: !scrollTrigger, defaults: { ease: 'power2.inOut' }, scrollTrigger, onUpdate: syncFixed });
      tl.to(group, { x: v1.x, y: v1.y, scale: v1.k, duration: MOVE }, HOLD)
        .to(q('[data-dim]'), { opacity: 0.1, duration: MOVE }, HOLD)
        .to(q('[data-callout="state"]'), { opacity: 1, duration: 0.4 }, 1.3)
        .to(q('[data-callout="state"]'), { opacity: 0, duration: 0.4 }, 2.2)
        .to(q('[data-lga-layer]'), { opacity: 1, duration: 0.7 }, 1.9)
        .to(group, { x: v2.x, y: v2.y, scale: v2.k, duration: MOVE }, 2)
        .to(q('[data-lga-label]'), { opacity: 1, duration: 0.5, stagger: 0.015 }, 2.7)
        .to(q('[data-callout="lga"]'), { opacity: 1, duration: 0.4 }, 3)
        .to(group, { x: v3.x, y: v3.y, scale: v3.k, duration: MOVE }, 3.5)
        .to(q('[data-lga-dim]'), { opacity: 0.22, duration: MOVE }, 3.5)
        .to(q('[data-lga-label]'), { opacity: 0, duration: 0.4 }, 3.5)
        .to(q('[data-callout="lga"]'), { opacity: 0, duration: 0.4 }, 3.5)
        .to(pinGroup, { opacity: 1, duration: 0.6 }, 4.2)
        .to(chips, { opacity: 1, duration: 0.6 }, 4.3)
        .to(group, { x: v4.x, y: v4.y, scale: v4.k, duration: MOVE }, 5)
        .to(chips, { opacity: 0, duration: 0.4 }, 5)
        .to(intro, { opacity: 0, y: -16, duration: 0.4 }, 5.1)
        .to(photo, { clipPath: `circle(150% at ${origin})`, duration: 0.95, ease: 'power2.inOut' }, 5.2)
        .fromTo(info, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 5.7)
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
        gsap.set(
          [group, pinGroup, chips, photo, intro, info, ...q('[data-callout]'), ...q('[data-lga-layer]'), ...q('[data-lga-label]'), ...q('[data-lga-dim]'), ...q('[data-dim]')],
          { clearProps: 'all' },
        );
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', () => {
      const tl = build();
      tl.time(STOP_TIMES[LAST]);
      paintRail(STOP_TIMES[LAST]);
      setStep(LAST);
      syncFixed();
      return () => {
        tl.kill();
        tlRef.current = null;
      };
    });

    return () => mm.revert();
  }, [story, layout]);

  const goTo = (target: number) => {
    const next = Math.max(0, Math.min(LAST, target));
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

  const { displayState, stateCount, total, statesWithListings, areas, featured, chosenLga, lgaTotal, lgaWithListings } = story;
  const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
  const lgaName = chosenLga?.name;
  const introStep = Math.min(step, 3);
  const copy = [
    {
      title: 'All of Nigeria, one place to look',
      body: `${plural(total, 'verified listing', 'verified listings')} across ${plural(statesWithListings, 'state', 'states')}. The glowing ones have homes on Owkaz right now.`,
    },
    { title: displayState, body: `${plural(stateCount, 'listing', 'listings')} here at the moment.` },
    {
      title: lgaName ?? 'Local government areas',
      body: lgaTotal
        ? `${displayState} has ${plural(lgaTotal, 'local government area', 'local government areas')}. ${lgaWithListings.toLocaleString()} ${lgaWithListings === 1 ? 'has' : 'have'} listings on Owkaz.`
        : `Browse the local government areas inside ${displayState}.`,
    },
    {
      title: 'Down to the neighbourhood',
      body: areas.length
        ? `Browse areas${lgaName ? ` in ${lgaName}` : ''} such as ${areas.slice(0, 3).map((a) => a.name).join(', ')}.`
        : `Browse the neighbourhoods inside ${lgaName ?? displayState}.`,
    },
  ][introStep];
  const labels = LABELS.map((label, i) => (i === LAST && featured.kind === 'project' ? 'Project' : label));
  const lgaPillWidth = chosenLga ? Math.max(120, chosenLga.name.length * 9.2 + 56) : 0;

  return (
    <section
      ref={wrapRef}
      aria-label="From Nigeria to your front door"
      className="relative bg-navy"
      style={reduced ? { height: `calc(100svh - ${NAV}px)` } : { height: '520vh' }}
    >
      <div className={reduced ? 'relative h-full overflow-hidden' : 'sticky overflow-hidden'} style={reduced ? undefined : { top: NAV, height: `calc(100svh - ${NAV}px)` }}>
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `${DOT_GRID}, radial-gradient(ellipse 60% 70% at ${(layout.cx / layout.w) * 100}% 50%, rgba(18,160,142,0.22), transparent 70%)`, backgroundSize: '26px 26px, 100% 100%' }}
        />

        {/* Below lg the map and photo live in their own pane above the text, so nothing is drawn behind the copy. */}
        <div className="absolute inset-x-0 top-12 bottom-[20rem] overflow-hidden lg:inset-0">
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
                  fill={chosen ? 'rgba(229,168,74,0.14)' : hasListings ? 'rgba(18,160,142,0.75)' : '#15375b'}
                  stroke={chosen ? '#E5A84A' : '#0B2540'}
                  strokeWidth={chosen ? 2 : 1}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
              );
            })}

            <g data-lga-layer>
              {story.lgaItems.map((l) => (
                <path
                  key={l.name}
                  d={l.d}
                  data-lga-dim={l.chosen ? undefined : ''}
                  fill={l.chosen ? 'rgba(229,168,74,0.4)' : l.count > 0 ? 'rgba(18,160,142,0.55)' : 'rgba(255,255,255,0.03)'}
                  stroke={l.chosen ? '#E5A84A' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={l.chosen ? 2 : 1}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                />
              ))}
              {story.lgaItems
                .filter((l) => l.showLabel && !l.chosen)
                .map((l) => (
                  <g key={l.name} data-fixed data-lga-label data-x={l.cx} data-y={l.cy}>
                    <text textAnchor="middle" y={4} fontSize={11} fontWeight={500} fill="rgba(255,255,255,0.85)" stroke="#0B2540" strokeWidth={3} paintOrder="stroke" fontFamily="Inter, sans-serif">
                      {l.name}
                    </text>
                  </g>
                ))}
            </g>

            <g data-fixed data-callout="state" data-x={story.centre.x} data-y={story.centre.y} aria-hidden="true">
              <g transform="translate(0 -34)">
                <rect x={-78} y={-16} width={156} height={32} rx={16} fill="#ffffff" />
                <text textAnchor="middle" y={5} fontSize={13} fontWeight={600} fill="#0B2540" fontFamily="Inter, sans-serif">
                  {displayState} · {stateCount}
                </text>
              </g>
              <circle r={5} fill="#E5A84A" />
            </g>

            {chosenLga && (
              <g data-fixed data-callout="lga" data-x={chosenLga.cx} data-y={chosenLga.cy} aria-hidden="true">
                <g transform="translate(0 -30)">
                  <rect x={-lgaPillWidth / 2} y={-16} width={lgaPillWidth} height={32} rx={16} fill="#ffffff" />
                  <text textAnchor="middle" y={5} fontSize={13} fontWeight={600} fill="#0B2540" fontFamily="Inter, sans-serif">
                    {chosenLga.name} · {story.chosenLgaCount}
                  </text>
                </g>
                <circle r={5} fill="#E5A84A" />
              </g>
            )}

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

        <div className="hidden lg:block absolute inset-0 z-[5] pointer-events-none lg:bg-gradient-to-r lg:from-navy/90 lg:via-navy/50 lg:via-35% lg:to-transparent lg:to-60%" />

        <div ref={photoRef} className="absolute inset-0 z-10 pointer-events-none">
          {featured.image && <img src={getImageUrl(featured.image)} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/10 lg:from-navy lg:via-navy/55 lg:to-navy/10" />
        </div>
        </div>

        <div className="lg:hidden absolute inset-x-0 bottom-0 h-[20rem] z-[15] bg-navy border-t border-white/10" />

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

        <div ref={introRef} className="absolute z-20 left-5 right-5 sm:left-8 bottom-24 sm:bottom-32 lg:max-w-md">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {labels[introStep]}
          </span>
          <div key={introStep} className="step-in">
            <h2 className="font-display text-2xl sm:text-5xl text-white mt-3 sm:mt-4 leading-[1.1]">{copy.title}</h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mt-2 sm:mt-3 max-w-md">{copy.body}</p>
          </div>
          {step === 0 && (
            <div className="mt-3 sm:mt-6 inline-flex items-center gap-2 text-xs text-white/55">
              Scroll to explore <ChevronDown size={14} className="animate-bounce" />
            </div>
          )}
        </div>

        <div ref={chipsRef} className="hidden lg:flex absolute z-20 right-8 bottom-32 flex-wrap gap-2 justify-end max-w-sm">
          {areas.slice(0, 5).map((a) => (
            <span key={a.name} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 text-xs font-medium text-white">
              <MapPin size={12} className="text-gold-light" />
              {a.name}
              <span className="text-white/50">{a.n}</span>
            </span>
          ))}
        </div>

        <div ref={infoRef} className={`absolute z-20 left-5 right-5 sm:left-8 bottom-24 sm:bottom-32 lg:max-w-xl ${step === LAST ? '' : 'pointer-events-none'}`}>
          <div className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-light">
            Now showing in {lgaName ? `${lgaName}, ` : ''}{displayState}
          </div>
          <h3 className="font-display text-2xl sm:text-5xl text-white sm:mt-3 leading-[1.1]">{featured.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-white/75 mt-2 sm:mt-3">
            <MapPin size={14} /> {featured.place || displayState}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3 sm:mt-4">
            {featured.price && <div className="font-display text-2xl sm:text-3xl text-gold-light">{featured.price}</div>}
            {featured.unitSummary && <div className="basis-full text-sm text-white/80 -mt-1">{featured.unitSummary}</div>}
            <div className="flex items-center gap-4 text-sm text-white/80">
              {featured.units && (
                <span className="inline-flex items-center gap-1.5"><Building2 size={16} /> {featured.units}</span>
              )}
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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={() => navigate(featured.href)}
              className="px-4 sm:px-6 py-3 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              {featured.cta}
            </button>
            <button
              type="button"
              onClick={() => navigate(featured.moreHref)}
              className="px-4 sm:px-6 py-3 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              {featured.moreLabel}
            </button>
          </div>
        </div>

        <div className="absolute z-20 left-4 sm:left-8 bottom-1 text-[9px] text-white/35">Boundaries: geoBoundaries (CC BY 4.0)</div>

        <div ref={railRef} className="absolute z-20 left-5 right-[4.5rem] sm:left-8 sm:right-[10.5rem] bottom-5" style={{ '--p': 0 } as CSSProperties}>
          <div className="relative mx-5 sm:mx-10">
            <div className="relative h-px bg-white/25">
              <div className="absolute left-0 top-0 h-px bg-gold" style={{ width: 'calc(var(--p) * 100%)' }} />
              {labels.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to ${label}`}
                  aria-current={i === step}
                  className="absolute top-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: `${(i / LAST) * 100}%` }}
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
              {labels.map((label, i) => (
                <span
                  key={label}
                  className={`absolute -translate-x-1/2 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] whitespace-nowrap transition-colors ${
                    i === step ? 'text-white' : 'text-white/45 hidden sm:block'
                  }`}
                  style={{ left: `${(i / LAST) * 100}%` }}
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
