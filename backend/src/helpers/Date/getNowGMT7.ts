const GMT7_OFFSET = 7 * 60 * 60 * 1000; // 7 hours in ms

/**
 * Returns the current Date object adjusted to GMT+7.
 */
export function getNowGMT7(): Date {
  return new Date(Date.now() + GMT7_OFFSET);
}

/**
 * Returns an ISO 8601 string representing the current time in GMT+7.
 * Format: "YYYY-MM-DDTHH:mm:ss.sss+07:00"
 */
export function getNowGMT7ISOString(): string {
  const now = new Date(Date.now() + GMT7_OFFSET);
  // Replace the trailing 'Z' with '+07:00'
  return now.toISOString().replace('Z', '+07:00');
}

/**
 * Converts any Date/string to a GMT+7 ISO string.
 */
export function toGMT7ISOString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const adjusted = new Date(d.getTime() + GMT7_OFFSET);
  return adjusted.toISOString().replace('Z', '+07:00');
}
