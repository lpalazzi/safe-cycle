import L from 'leaflet';
import along from '@turf/along';
import { IReverseGeocodeResult } from 'api/interfaces/Geocoding';
import { distanceBetweenCoords } from 'utils/geojson';

export class TurnInstruction {
  public command;
  public latLng;
  public distanceAfter;
  public roundaboutExit;
  public streetName: string | null;
  public streetLatLng;

  constructor(
    voiceHint: [number, number, number, number, number],
    lineString: GeoJSON.LineString
  ) {
    this.command = voiceHint[1] as TurnCommand;
    this.roundaboutExit = voiceHint[2];
    this.distanceAfter = voiceHint[3];
    this.streetName = null;
    const position = lineString.coordinates[voiceHint[0]];
    this.latLng = new L.LatLng(position[1], position[0]);
    const nextPosition = lineString.coordinates[voiceHint[0] + 1];
    const streetPosition = along(
      { type: 'LineString', coordinates: [position, nextPosition] },
      0.01 // gets point 10m along
    ).geometry.coordinates;
    this.streetLatLng = new L.LatLng(streetPosition[1], streetPosition[0]);
  }

  public setStreetName(reverseResult: IReverseGeocodeResult | null) {
    if (
      reverseResult &&
      distanceBetweenCoords(
        this.streetLatLng.lng,
        this.streetLatLng.lat,
        reverseResult.position.longitude,
        reverseResult.position.latitude
      ) < 5
    )
      this.streetName = reverseResult.address.road ?? null;
    else this.streetName = null;
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
