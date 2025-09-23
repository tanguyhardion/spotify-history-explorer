/**
 * Formats milliseconds into a human-readable duration string
 * @param ms - Duration in milliseconds
 * @returns Formatted string with all applicable units (e.g., "2y 3m 1d 5h 34m 12s", "1m 15d 2h 34m 12s", "2d 5h 34m 12s", "2h 34m 12s", "5m 30s", or "12s")
 */
export function formatMs(ms: number): string {
  if (ms < 0) return "0s";

  const msInSecond = 1000;
  const msInMinute = 60 * msInSecond;
  const msInHour = 60 * msInMinute;
  const msInDay = 24 * msInHour;
  const msInMonth = 30 * msInDay; // Approximate
  const msInYear = 365 * msInDay;

  const years = Math.floor(ms / msInYear);
  const months = Math.floor((ms % msInYear) / msInMonth);
  const days = Math.floor((ms % msInMonth) / msInDay);
  const hours = Math.floor((ms % msInDay) / msInHour);
  const minutes = Math.floor((ms % msInHour) / msInMinute);
  const seconds = Math.floor((ms % msInMinute) / msInSecond);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(" ") : "0s";
}

/**
 * Formats a number with appropriate locale-specific thousands separators
 * @param num - Number to format
 * @returns Formatted string with thousands separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if applicable
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
