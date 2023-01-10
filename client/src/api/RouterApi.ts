import L from 'leaflet';
import { ID } from 'types';
import { BrouterProperties } from './interfaces/Router';
import { makeRequest } from './reqHelpers';

export class RouterApi {
  private static baseUrl = '/router';

  static async generateRoute(
    waypoints: L.LatLng[],
    nogoListIds: ID[] = [],
    isNogo: boolean = false
  ) {
    const points: GeoJSON.Position[] = waypoints.map((waypoint) => [
      waypoint.lng,
      waypoint.lat,
    ]);
    const response = await makeRequest(
      `${this.baseUrl}/generateRoute${isNogo ? '?isNogo=true' : ''}`,
      'POST',
      {
        points,
        nogoListIds,
      }
    );
    const route: GeoJSON.FeatureCollection = response.route;
    const properties: BrouterProperties = response.properties;
    return { route, properties };
  }
}
