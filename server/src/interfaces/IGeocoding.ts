import { Position } from 'types';

export interface IGeocodeSearchResult {
  label: string;
  position?: Position;
}

export interface IReverseGeocodeResult {
  label: string;
  address: {
    road?: string;
  };
  position: Position;
}
