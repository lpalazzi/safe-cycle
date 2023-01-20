import L from 'leaflet';
import { ID, RouteOptions } from 'types';
import { BrouterProperties } from './interfaces/Router';
import { makeRequest } from './reqHelpers';

export class RouterApi {
  private static baseUrl = '/router';

  static async generateRoute(
    waypoints: L.LatLng[],
    nogoGroupIds: ID[] = [],
    isNogo: boolean = false,
    routeOptions?: RouteOptions
  ) {
    const points: GeoJSON.Position[] = waypoints.map((waypoint) => [
      waypoint.lng,
      waypoint.lat,
    ]);
    const response = await makeRequest(
      `${this.baseUrl}/generateRoute?alternativeidx=${
        routeOptions?.alternativeidx ?? 0
      }${isNogo ? '&isNogo=true' : ''}${
        routeOptions?.avoidUnpaved ? '&avoidUnpaved=true' : ''
      }`,
      'POST',
      {
        points,
        nogoGroupIds,
      }
    );
    const route: GeoJSON.LineString = response.route;
    const properties: BrouterProperties = response.properties;
    return { route, properties };
  }
}
