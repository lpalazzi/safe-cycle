import L from 'leaflet';
import midpoint from '@turf/midpoint';
import { IReverseGeocodeResult } from 'api/interfaces/Geocoding';
import { GeocodingApi } from 'api';
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
    const nextPosition = lineString.coordinates[voiceHint[0] + 1];
    const mid = midpoint(position, nextPosition).geometry.coordinates;
    this.latLng = new L.LatLng(mid[1], mid[0]);
    this.streetNameExecutor = async (
      resolve: (value: string | PromiseLike<string | null> | null) => void
    ) => {
      let tries = 0;
      let result: IReverseGeocodeResult | null = null;
      while (tries < 3 && !result) {
        tries++;
        try {
          result = await GeocodingApi.reverse(this.latLng, 16);
        } catch (error) {
          result = null;
        }
      }
      this.streetFetched = true;
      if (
        result &&
        distanceBetweenCoords(
          this.latLng.lng,
          this.latLng.lat,
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
