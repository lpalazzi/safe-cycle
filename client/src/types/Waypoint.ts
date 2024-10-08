import { LatLng } from 'leaflet';

export type Waypoint = {
  latlng: LatLng;
  label: string | Promise<string | null>;
};
