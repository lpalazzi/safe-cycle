import L from 'leaflet';
import { User } from 'models';
import { ID, RouteOptions } from 'types';
import { BrouterProperties } from './interfaces/Router';

export class TrackerApi {
  static logSignup(userId: ID) {
    umami.track('New user sign up', { data: { userId } });
  }

  static logRoute(
    waypoints: L.LatLng[],
    routeOptions: RouteOptions,
    properties: BrouterProperties,
    user: User | null,
    nogoGroupIds: ID[],
    regionIds: ID[]
  ) {
    umami.track('Route fetched', {
      data: {
        userId: user?._id,
        waypoints: waypoints.length,
        preferBikeFriendly: routeOptions.preferBikeFriendly ? 1 : 0,
        preferCycleRoutes: routeOptions.preferCycleRoutes ? 1 : 0,
        surfacePreference: routeOptions.surfacePreference ?? 'none',
        distance: Number(properties['track-length']),
        withPrivateNogos: nogoGroupIds.length > 0 ? 1 : 0,
        withRegionNogos: regionIds.length > 0 ? 1 : 0,
      },
    });
  }
}
