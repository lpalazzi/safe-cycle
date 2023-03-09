import L from 'leaflet';
import { ID, RouteOptions } from 'types';
import { User } from 'models';
import { TrackerApi } from 'api';
import { BrouterProperties } from './interfaces/Router';
import { makeRequest } from './reqHelpers';

export class RouterApi {
  private static baseUrl = '/router';

  static async generateRoute(
    waypoints: L.LatLng[],
    nogoGroupIds: ID[] = [],
    regionIds: ID[] = [],
    routeOptions: RouteOptions,
    user: User | null
  ) {
    const points: GeoJSON.Position[] = waypoints.map((waypoint) => [
      waypoint.lng,
      waypoint.lat,
    ]);
    const response = await makeRequest(
      `${this.baseUrl}/generateRoute`,
      'POST',
      {
        points,
        nogoGroupIds,
        regionIds,
        routeOptions,
      }
    );
    const route: GeoJSON.LineString = response.route;
    const properties: BrouterProperties = response.properties;
    TrackerApi.logRoute(
      waypoints,
      routeOptions,
      properties,
      user,
      nogoGroupIds
    );
    return { route, properties };
  }
}
