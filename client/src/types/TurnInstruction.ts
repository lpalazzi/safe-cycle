import L from 'leaflet';

export enum TurnCommands {
  'Continue' = 1,
  'Turn left',
  'Turn slightly left',
  'Turn sharply left',
  'Turn right',
  'Turn slightly right',
  'Turn sharply right',
  'Keep left',
  'Keep right',
  'U-turn',
  '180 degree u-turn',
  'Right U-turn',
  'Off route',
  'Roundabout',
  'Roundabout left',
  'Beeline routing',
}

export type TurnInstruction = {
  command: number;
  streetName: string;
  latLng: L.LatLng;
  distanceAfter: number;
  roundaboutExit: number;
};
