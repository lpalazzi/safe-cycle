import { Nogo } from 'models';
import { ID } from 'types';
import { INogoReturnDTO, INogoCreateDTO } from './interfaces/Nogo';
import { makeRequest } from './reqHelpers';
import { RouterApi } from './RouterApi';

export class NogoApi {
  private static baseUrl = '/nogo';

  static async getAllByList(nogoListId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/getAllByList/${nogoListId}`
    );
    const nogosReturn: INogoReturnDTO[] = response.nogos;
    if (!nogosReturn) return [];
    const nogos = nogosReturn.map((nogoReturn) => new Nogo(nogoReturn));
    return nogos;
  }

  static async create(waypoints: L.LatLng[], nogoListId: ID) {
    const nogoRoute = await RouterApi.generateRoute(waypoints, [], true);
    const nogo: INogoCreateDTO = {
      nogoList: nogoListId,
      lineString: nogoRoute.route,
    };
    const response = await makeRequest(`${this.baseUrl}/create`, 'POST', {
      nogo,
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
