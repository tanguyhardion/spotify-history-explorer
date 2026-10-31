export const formatNumber = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const formatPercentage = (value: number) =>
  `${value.toFixed(1)}%`;

