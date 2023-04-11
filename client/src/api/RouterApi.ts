import L from 'leaflet';
import { ID, RouteOptions } from 'types';
import { User } from 'models';
import { TrackerApi } from 'api';
import { RouteData } from 'api/interfaces/Router';
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
    const routes: RouteData[] = response.routes;
    TrackerApi.logRoute(
      waypoints,
      routeOptions,
      routes[0].properties,
      user,
      nogoGroupIds
    );
    return routes;
  }
}
