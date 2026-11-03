import { Project, UnitType } from '../features/projects/projectsApi';
import { formatCompactPrice, formatPrice } from './format';

export const listedUnitTypes = (project: Pick<Project, 'unitTypes'>): UnitType[] =>
  (project.unitTypes ?? []).filter((u) => u.name && Number(u.price) > 0);

/** Lowest and highest price for a project, from its unit types when it has them. */
export const priceBounds = (project: Pick<Project, 'unitTypes' | 'priceFrom' | 'priceTo'>) => {
  const prices = listedUnitTypes(project).map((u) => Number(u.price));
  if (prices.length > 0) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { from: min, to: max > min ? max : null };
  }
  return { from: project.priceFrom ?? null, to: project.priceTo ?? null };
};

export const formatPriceRange = (project: Pick<Project, 'unitTypes' | 'priceFrom' | 'priceTo'>): string | null => {
  const { from, to } = priceBounds(project);
  if (!from) return null;
  return to ? `${formatPrice(from)} to ${formatPrice(to)}` : formatPrice(from);
};

/** "3 Bedroom ₦180M, 4 Bedroom ₦240M" for tight spaces. */
export const compactUnitSummary = (project: Pick<Project, 'unitTypes'>, max = 3): string | null => {
  const units = listedUnitTypes(project);
  if (units.length === 0) return null;
  const shown = units.slice(0, max).map((u) => `${u.name} ${formatCompactPrice(Number(u.price))}`);
  return units.length > max ? `${shown.join(' · ')} · +${units.length - max} more` : shown.join(' · ');
};
