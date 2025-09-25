export const formatNumber = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 0 });

export const formatPercentage = (value: number) =>
  `${value.toFixed(1)}%`;

export const formatMinutes = (ms: number) => {
  const minutes = ms / 1000 / 60;
  return `${minutes.toFixed(1)} min`;
};
