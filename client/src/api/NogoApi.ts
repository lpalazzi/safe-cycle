import { Nogo } from 'models';
import { ID } from 'types';
import { INogoReturnDTO } from './interfaces/Nogo';
import { makeRequest } from './reqHelpers';

export class NogoApi {
  private static baseUrl = '/nogo';

  static async getAllByGroup(groupId: ID, isRegion: boolean) {
    const response = await makeRequest(
      `${this.baseUrl}/getAllByGroup/${groupId}/${
        isRegion ? 'region' : 'nogogroup'
      }`
    );
    const nogosReturn: INogoReturnDTO[] = response.nogos;
    if (!nogosReturn) return [];
    const nogos = nogosReturn.map((nogoReturn) => new Nogo(nogoReturn));
    return nogos;
  }

  static async create(waypoints: L.LatLng[], groupId: ID, isOnRegion: boolean) {
    const points: GeoJSON.Position[] = waypoints.map((waypoint) => [
      waypoint.lng,
      waypoint.lat,
    ]);
    const response = await makeRequest(`${this.baseUrl}/create`, 'POST', {
      points,
      groupId,
      isOnRegion,
    });
    const nogoReturn: INogoReturnDTO = response.nogo;
    return new Nogo(nogoReturn);
  }

  static async transferNogosToRegion(nogoGroupId: ID, regionId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/transferNogosToRegion`,
      'POST',
      {
        nogoGroupId,
        regionId,
      }
    );
    const updateCount: number = response.updateCount;
    return updateCount;
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
