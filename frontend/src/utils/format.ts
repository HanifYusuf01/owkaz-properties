export const formatPrice = (price: number): string => {
  return '₦' + Number(price).toLocaleString('en-NG');
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatNumber = (n: number): string => {
  return Number(n).toLocaleString();
};

export const formatCompactPrice = (n: number): string => {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return `₦${n}`;
};
