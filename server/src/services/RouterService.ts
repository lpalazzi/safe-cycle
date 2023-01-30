import config from 'config';
import { injectable } from 'tsyringe';
import axios from 'axios';

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

  // private nogosToParamString(nogos: INogo[]) {
  //   return nogos.reduce((accumulated, nogo, index) => {
  //     const trail = nogos.length - 1 === index ? '' : '|';
  //     return (accumulated +=
  //       nogo.lineString.coordinates.map(this.positionToString) + trail);
  //   }, '');
  // }

  private async fetchRoute(
    lonlats: GeoJSON.Position[],
    nogoGroupIds: string[],
    profile:
      | 'safecycle'
      | 'safecycle-avoidUnsafe'
      | 'safecycle-avoidUnpaved'
      | 'safecycle-avoidUnsafe-avoidUnpaved'
      | 'all',
    alternativeidx: 0 | 1 | 2 | 3 = 0
  ) {
    const url = `${this.brouterUrl}?lonlats=${this.positionsToParamString(
      lonlats
    )}&nogoGroupIds=${nogoGroupIds.join(
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

  async getRouteForNewNogo(lonlats: GeoJSON.Position[]) {
    const route = await this.fetchRoute(lonlats, [], 'all');
    return route;
  }

  async getRouteForUser(
    lonlats: GeoJSON.Position[],
    nogoGroupIds: string[],
    routeOptions?: {
      avoidUnsafe?: boolean;
      avoidUnpaved?: boolean;
      alternativeidx?: 0 | 1 | 2 | 3;
    }
  ) {
    const profile = (avoidUnsafe = false, avoidUnpaved = false) => {
      if (avoidUnsafe && avoidUnpaved)
        return 'safecycle-avoidUnsafe-avoidUnpaved';
      if (avoidUnsafe && !avoidUnpaved) return 'safecycle-avoidUnsafe';
      if (!avoidUnsafe && avoidUnpaved) return 'safecycle-avoidUnpaved';
      return 'safecycle';
    };
    const route = await this.fetchRoute(
      lonlats,
      nogoGroupIds,
      profile(routeOptions?.avoidUnsafe, routeOptions?.avoidUnpaved),
      routeOptions?.alternativeidx
    );
    return route;
  }
}
