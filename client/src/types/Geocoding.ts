import { LatLng } from 'leaflet';

export type GeocodeSearchResult = {
  label: string;
  latlng?: LatLng;
};
