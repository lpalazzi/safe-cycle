import L from 'leaflet';
import { Nogo } from 'models';

export const getTotalLengthOfNogos = (nogos: Nogo[]) => {
  return nogos
    .map((nogo) => nogo.getLength())
    .reduce((partialSum, a) => partialSum + a, 0);
};

export const getBoundsForNogos = (nogos: Nogo[]) => {
  return L.latLngBounds(
    nogos
      .map((nogo) =>
        nogo.lineString.coordinates.map((coord) => L.latLng(coord[1], coord[0]))
      )
      .flat()
  );
};
