import config from 'config';
import { injectable } from 'tsyringe';
import { INogo, INogoReturnDTO } from 'interfaces';

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

  private nogosToParamString(nogos: INogo[]) {
    return nogos.reduce((accumulated, nogo, index) => {
      const trail = nogos.length - 1 === index ? '' : '|';
      return (accumulated +=
        nogo.lineString.coordinates.map(this.positionToString) + trail);
    }, '');
  }

  private async fetchRoute(
    lonlats: GeoJSON.Position[],
    nogos: INogoReturnDTO[],
    profile: 'safecycle' | 'all'
  ) {
    const urlParams = new URLSearchParams({
      lonlats: this.positionsToParamString(lonlats),
      polylines: this.nogosToParamString(nogos),
      profile,
      format: 'geojson',
    });
    return fetch(this.brouterUrl + '?' + urlParams.toString())
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'BRouter error');
        }
        return res;
      })
      .then((res) => res.json() as any as GeoJSON.FeatureCollection);
  }

  async getRouteForNewNogo(lonlats: GeoJSON.Position[]) {
    const route = await this.fetchRoute(lonlats, [], 'all');
    return route;
  }

  async getRouteForUser(lonlats: GeoJSON.Position[], nogos: INogoReturnDTO[]) {
    const route = await this.fetchRoute(lonlats, nogos, 'safecycle');
    return route;
  }
}
