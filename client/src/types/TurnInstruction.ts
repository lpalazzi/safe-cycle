import L from 'leaflet';

export type TurnCommand =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

export type TurnInstruction = {
  command: TurnCommand;
  latLng: L.LatLng;
  distanceAfter: number;
  roundaboutExit: number;
  streetName: string | null | Promise<string | null>;
};
