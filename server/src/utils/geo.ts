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

export const getLengthForLineString = (lineString: GeoJSON.LineString) => {
  if (lineString.coordinates.length < 2) return 0;
  var result = 0;
  for (var i = 1; i < lineString.coordinates.length; i++)
    result += distanceBetweenCoords(
      lineString.coordinates[i - 1][0],
      lineString.coordinates[i - 1][1],
      lineString.coordinates[i][0],
      lineString.coordinates[i][1]
    );
  return result;
};

/**
 * Calculate the approximate distance between two coordinates (lat/lon)
 * © Chris Veness, MIT-licensed,
 * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
 */
export const distanceBetweenCoords = (
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
) => {
  const R = 6371000;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const x = Δλ * Math.cos((φ1 + φ2) / 2);
  const y = φ2 - φ1;
  const d = Math.sqrt(x * x + y * y);
  return R * d; // in metres
};
