import L from 'leaflet';
import along from '@turf/along';
import { GeocodingApi } from 'api';
import { IReverseGeocodeResult } from 'api/interfaces/Geocoding';
import { distanceBetweenCoords } from 'utils/geojson';

export class TurnInstruction {
  public command;
  public latLng;
  public distanceAfter;
  public roundaboutExit;
  public streetFetched;

  private streetName: string | null;
  private streetNameExecutor;

  constructor(
    voiceHint: [number, number, number, number, number],
    lineString: GeoJSON.LineString
  ) {
    this.command = voiceHint[1] as TurnCommand;
    this.roundaboutExit = voiceHint[2];
    this.distanceAfter = voiceHint[3];
    this.streetName = null;
    this.streetFetched = false;
    const position = lineString.coordinates[voiceHint[0]];
    this.latLng = new L.LatLng(position[1], position[0]);
    const nextPosition = lineString.coordinates[voiceHint[0] + 1];
    const streetPosition = along(
      { type: 'LineString', coordinates: [position, nextPosition] },
      0.01 // gets point 10m along
    ).geometry.coordinates;
    const streetLatLng = new L.LatLng(streetPosition[1], streetPosition[0]);
    this.streetNameExecutor = async (
      resolve: (value: string | PromiseLike<string | null> | null) => void
    ) => {
      let tries = 0;
      let result: IReverseGeocodeResult | null = null;
      while (tries < 3 && !result) {
        tries++;
        try {
          result = await GeocodingApi.reverse(streetLatLng, 16);
        } catch (error) {
          result = null;
        }
      }
      this.streetFetched = true;
      if (
        result &&
        distanceBetweenCoords(
          streetLatLng.lng,
          streetLatLng.lat,
          result.position.longitude,
          result.position.latitude
        ) < 5
      ) {
        this.streetName = result.address.road ?? null;
        resolve(this.streetName);
      } else {
        resolve(null);
      }
    };
  }

  public async getStreetName() {
    if (this.streetFetched) return this.streetName;
    return new Promise<string | null>(this.streetNameExecutor);
  }
}

type TurnCommand =
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
