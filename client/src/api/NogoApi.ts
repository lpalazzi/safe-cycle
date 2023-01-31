import { Nogo } from 'models';
import { ID } from 'types';
import { INogoReturnDTO } from './interfaces/Nogo';
import { makeRequest } from './reqHelpers';

export class NogoApi {
  private static baseUrl = '/nogo';

  static async getAllByList(nogoGroupId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/getAllByList/${nogoGroupId}`
    );
    const nogosReturn: INogoReturnDTO[] = response.nogos;
    if (!nogosReturn) return [];
    const nogos = nogosReturn.map((nogoReturn) => new Nogo(nogoReturn));
    return nogos;
  }

  static async create(waypoints: L.LatLng[], nogoGroupId: ID) {
    const points: GeoJSON.Position[] = waypoints.map((waypoint) => [
      waypoint.lng,
      waypoint.lat,
    ]);
    const response = await makeRequest(`${this.baseUrl}/create`, 'POST', {
      points,
      nogoGroupId,
    });
    const nogoReturn: INogoReturnDTO = response.nogo;
    return new Nogo(nogoReturn);
  }

  static async delete(nogoId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/delete/${nogoId}`,
      'DELETE'
    );
    const deletedCount: number = response.deletedCount;
    return deletedCount;
  }
}
