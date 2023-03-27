import axios from 'axios';
import { injectable } from 'tsyringe';
import config from 'config';
import { RouteOptions } from 'types';

@injectable()
export class RouterService {
  constructor() {}

  private brouterUrl = config.brouterUrl;

  private positionToString(position: GeoJSON.Position) {
    return position[0] + ',' + position[1];
  }

  private positionsToParamString(positions: GeoJSON.Position[]) {
    return positions.map(this.positionToString).join('|');
  }

  private async fetchRoute(
    lonlats: GeoJSON.Position[],
    nogoGroupIds: string[],
    regionIds: string[],
    profile:
      | 'safecycle'
      | 'safecycle-avoidMainRoads'
      | 'safecycle-avoidMainRoads-preferPaved'
      | 'safecycle-avoidMainRoads-preferCycleRoutes'
      | 'safecycle-avoidMainRoads-preferCycleRoutes-preferPaved'
      | 'safecycle-preferPaved'
      | 'safecycle-preferCycleRoutes'
      | 'safecycle-preferCycleRoutes-preferPaved'
      | 'all',
    alternativeidx: 0 | 1 | 2 | 3 = 0
  ) {
    const url = `${this.brouterUrl}?lonlats=${this.positionsToParamString(
      lonlats
    )}&nogoGroupIds=${nogoGroupIds.join('|')}&regionIds=${regionIds.join(
      '|'
    )}&profile=${profile}&alternativeidx=${alternativeidx}&format=geojson`;
    return axios
      .get(url, {
        insecureHTTPParser: true,
      })
      .then((res) => {
        const fc: GeoJSON.FeatureCollection = res.data;
        const route = fc.features[0].geometry as GeoJSON.LineString;
        const properties = fc.features[0].properties;
        return { route, properties };
      })
      .catch((error) => {
        if (
          String(error.response?.data).includes(
            'position not mapped in existing datafile'
          )
        ) {
          throw new Error(
            'One or more of your points are not close enough to a routable location. Please select another point.'
          );
        }
        console.log(error); // Log unhandled BRouter errors to console
        throw new Error(error.response?.data ?? 'BRouter error');
      });
  }

  async getRouteForNewNogo(lonlats: [GeoJSON.Position, GeoJSON.Position]) {
    const route = await this.fetchRoute(lonlats, [], [], 'all');
    return route;
  }

  async getRouteForUser(
    lonlats: GeoJSON.Position[],
    nogoGroupIds: string[],
    regionIds: string[],
    routeOptions: RouteOptions
  ) {
    const route = await this.fetchRoute(
      lonlats,
      nogoGroupIds,
      regionIds,
      `safecycle${routeOptions.avoidMainRoads ? '-avoidMainRoads' : ''}${
        routeOptions.stickToCycleRoutes ? '-preferCycleRoutes' : ''
      }${routeOptions.preferPaved ? '-preferPaved' : ''}`,
      routeOptions.alternativeidx
    );
    return route;
  }
}
