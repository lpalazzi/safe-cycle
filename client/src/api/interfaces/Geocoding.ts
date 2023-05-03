export interface IGeocodeSearchResult {
  label: string;
  position?: {
    latitude: number;
    longitude: number;
  };
}

export interface IReverseGeocodeResult {
  label: string;
  address: {
    road?: string;
  };
  position: {
    latitude: number;
    longitude: number;
  };
}
