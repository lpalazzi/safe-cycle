import { Nogo } from 'models';
import { ID } from 'types';
import { INogoCreateDTO, INogoReturnDTO } from './interfaces/Nogo';
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

  static async create(
    waypoints: L.LatLng[],
    nogoGroupId: ID | undefined,
    regionId: ID | undefined
  ) {
    const nogoCreate: INogoCreateDTO = {
      points: [
        [waypoints[0].lng, waypoints[0].lat],
        [waypoints[1].lng, waypoints[1].lat],
      ],
      nogoGroup: nogoGroupId,
      region: regionId,
    };
    const response = await makeRequest(`${this.baseUrl}/create`, 'POST', {
      nogoCreate,
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
