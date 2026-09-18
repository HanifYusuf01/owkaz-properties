/** Generates evenly-spaced, round-numbered price points between min and max for dropdown options. */
export function generatePriceSteps(min: number, max: number, targetSteps = 6): number[] {
  if (max <= min) return [];
  const range = max - min;
  const rawStep = range / targetSteps;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const niceResidual = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  const step = niceResidual * magnitude;

  const first = Math.ceil(min / step) * step;
  const steps: number[] = [];
  for (let v = first; v < max; v += step) steps.push(Math.round(v));
  return steps;
}
