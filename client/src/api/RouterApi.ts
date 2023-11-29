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
    const wrappedWaypoints = waypoints.map((waypoint) => waypoint.wrap());
    const points: GeoJSON.Position[] = wrappedWaypoints.map((waypoint) => [
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
      wrappedWaypoints,
      routeOptions,
      routes[0].properties,
      user,
      nogoGroupIds,
      regionIds
    );
    return routes;
  }

  static async downloadGPX(
    waypoints: L.LatLng[],
    nogoGroupIds: ID[] = [],
    regionIds: ID[] = [],
    routeOptions: RouteOptions,
    user: User | null,
    alternativeIdx: number
  ) {
    const points: GeoJSON.Position[] = waypoints.map((waypoint) => [
      waypoint.wrap().lng,
      waypoint.wrap().lat,
    ]);
    const response = await makeRequest(`${this.baseUrl}/downloadGPX`, 'POST', {
      points,
      nogoGroupIds,
      regionIds,
      routeOptions,
      alternativeIdx,
    });
    const gpx = (response.gpx as string)
      .replace(/creator="BRouter.*/i, 'creator="SafeCycle" version="1.0">')
      .replace(/<name>brouter_safecycle.*/i, '<name>safecycle</name>');
    const link = document.createElement('a');
    link.href = `data:text/plain;chatset=utf-8,${encodeURIComponent(gpx)}`;
    link.download = 'route.gpx';
    link.click();
    link.remove();
  }
}
