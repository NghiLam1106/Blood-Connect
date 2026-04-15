function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dlon / 2) *
    Math.sin(dlon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}
