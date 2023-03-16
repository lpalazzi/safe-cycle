import { NogoGroup } from 'models';
import { ID } from 'types';
import {
  INogoGroupReturnDTO,
  INogoGroupCreateDTO,
  INogoGroupUpdateDTO,
} from './interfaces/NogoGroup';
import { makeRequest } from './reqHelpers';

export class NogoGroupApi {
  private static baseUrl = '/nogoGroup';

  static async getAll() {
    const response = await makeRequest(`${this.baseUrl}/getAll`);
    const nogoGroupsReturn: INogoGroupReturnDTO[] = response.nogoGroups;
    if (!nogoGroupsReturn) return [];
    const nogoGroups = nogoGroupsReturn.map(
      (nogoGroupReturn) => new NogoGroup(nogoGroupReturn)
    );
    return nogoGroups;
  }

  static async getAllForUser() {
    const response = await makeRequest(`${this.baseUrl}/getAllForUser`);
    const nogoGroupsReturn: INogoGroupReturnDTO[] = response.nogoGroups;
    if (!nogoGroupsReturn) return [];
    const nogoGroups = nogoGroupsReturn.map(
      (nogoGroupReturn) => new NogoGroup(nogoGroupReturn)
    );
    return nogoGroups;
  }

  static async create(nogoGroup: INogoGroupCreateDTO) {
    const response = await makeRequest(`${this.baseUrl}/create`, 'POST', {
      nogoGroup,
    });
    const nogoGroupReturn: INogoGroupReturnDTO = response.nogoGroup;
    return new NogoGroup(nogoGroupReturn);
  }

  static async update(nogoGroupId: ID, nogoGroupUpdate: INogoGroupUpdateDTO) {
    const response = await makeRequest(
      `${this.baseUrl}/update/${nogoGroupId}`,
      'POST',
      {
        nogoGroupUpdate,
      }
    );
    return !!response.success;
  }

  static async delete(nogoGroupId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/delete/${nogoGroupId}`,
      'DELETE'
    );
    const deleteResult: {
      nogoGroupDeleted: boolean;
      nogosDeleted: number;
    } = response.deleteResult;

    return deleteResult;
  }
}
