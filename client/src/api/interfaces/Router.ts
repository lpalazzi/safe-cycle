import { TurnCommand } from 'types';

export interface RouteData {
  lineString: GeoJSON.LineString;
  properties: BrouterProperties;
}

export interface BrouterProperties {
  cost: string;
  creator: string;
  'filtered ascend': '1';
  messages: string[][];
  name: string;
  'plain-ascend': string;
  times: number[];
  'total-energy': string;
  'total-time': string;
  'track-length': string;
  voicehints: [number, TurnCommand, number, number, number][];
}
