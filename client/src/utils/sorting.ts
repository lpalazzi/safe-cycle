import { LatLng } from 'leaflet';
import { Region } from 'models';

export const sortRegionsByLocationFunction = (location: LatLng) => {
  return (a: Region, b: Region) => {
    const isInA = a.isLatLngInside(location);
    const isInB = b.isLatLngInside(location);
    const aDistance = isInA ? 0 : a.getDistanceTo(location);
    const bDistance = isInB ? 0 : b.getDistanceTo(location);
    return aDistance - bDistance;
  };
};

export const sortRegionsByCountryFunction = (a: Region, b: Region) => {
  const compareRegion = (a.iso31662?.nameWithCountry || 'zzz').localeCompare(
    b.iso31662?.nameWithCountry || 'zzz'
  );
  if (compareRegion === 0) {
    return a.name.localeCompare(b.name);
  }
  return compareRegion;
};

export const sortRegionsByNogoLengthFunction = (regionLengths: {
  [key: string]: number;
}) => {
  return (a: Region, b: Region) => {
    const aLength = regionLengths[a._id] || 0;
    const bLength = regionLengths[b._id] || 0;
    return bLength - aLength;
  };
};
