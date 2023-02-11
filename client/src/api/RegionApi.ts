import { Region } from 'models';
import { ID } from 'types';
import { IRegionCreateDTO, IRegionReturnDTO } from './interfaces/Region';
import { makeRequest } from './reqHelpers';

export class RegionApi {
  private static baseUrl = '/region';

  static async getAll() {
    const response = await makeRequest(`${this.baseUrl}/getAll`);
    const regionsReturn: IRegionReturnDTO[] = response.regions;
    if (!regionsReturn) return [];
    const regions = regionsReturn.map(
      (regionReturn) => new Region(regionReturn)
    );
    return regions;
  }

  static async create(region: IRegionCreateDTO) {
    const response = await makeRequest(`${this.baseUrl}/create`, 'POST', {
      region,
    });
    const regionReturn: IRegionReturnDTO = response.region;
    return new Region(regionReturn);
  }

  static async addContributorToRegion(regionId: ID, userId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/addContributorToRegion`,
      'POST',
      {
        regionId,
        userId,
      }
    );
    return !!response.success;
  }

  static async removeContributorFromRegion(regionId: ID, userId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/removeContributorFromRegion`,
      'POST',
      {
        regionId,
        userId,
      }
    );
    return !!response.success;
  }
}
