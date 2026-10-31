import type { CSSProperties } from 'react';

export const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
