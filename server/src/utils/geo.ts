export const fixOutOfBoundsLat = (lat: number) => {
  if (lat > 90) return 90;
  if (lat < -90) return -90;
  return lat;
};

export const fixOutOfBoundsLon = (lon: number) => {
  if (lon > 180) return 180;
  if (lon < -180) return -180;
  return lon;
};
