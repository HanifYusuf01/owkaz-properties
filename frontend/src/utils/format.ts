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
