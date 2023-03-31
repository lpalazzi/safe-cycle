import L from 'leaflet';
import { User } from 'models';
import { ID, RouteOptions } from 'types';
import { BrouterProperties } from './interfaces/Router';

export class TrackerApi {
  private static website_id = 'bc04b117-4c24-466f-b007-e5ffc246aba0';

  private static logEvent(event_value: string, event_data: any) {
    try {
      umami.trackEvent(event_value, event_data, undefined, this.website_id);
    } catch (error: any) {
      console.error(error.message);
    }
  }

  static logSignup(userId: ID) {
    this.logEvent('New user sign up', { userId });
  }

  static logRoute(
    waypoints: L.LatLng[],
    routeOptions: RouteOptions,
    properties: BrouterProperties,
    user: User | null,
    nogoGroupIds: ID[]
  ) {
    this.logEvent('Route fetched', {
      userId: user?._id,
      waypoints: waypoints.length,
      avoidNogos: routeOptions.avoidNogos ? 1 : 0,
      preferBikeFriendly: routeOptions.preferBikeFriendly ? 1 : 0,
      preferCycleRoutes: routeOptions.preferCycleRoutes ? 1 : 0,
      surfacePreference: routeOptions.surfacePreference ?? 'none',
      alternativeidx: routeOptions.alternativeidx ?? 0,
      distance: Number(properties['track-length']),
      withPrivateNogos: nogoGroupIds.length > 0 ? 1 : 0,
    });
  }
}
