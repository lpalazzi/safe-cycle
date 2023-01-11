import { NogoList } from 'models';
import { ID } from 'types';
import {
  INogoListReturnDTO,
  INogoListCreateDTO,
  INogoListUpdateDTO,
} from './interfaces/NogoList';
import { makeRequest } from './reqHelpers';

export class NogoListApi {
  private static baseUrl = '/nogoList';

  static async getAll() {
    const response = await makeRequest(`${this.baseUrl}/getAll`);
    const nogoListsReturn: INogoListReturnDTO[] = response.nogoLists;
    if (!nogoListsReturn) return [];
    const nogoLists = nogoListsReturn.map(
      (nogoListReturn) => new NogoList(nogoListReturn)
    );
    return nogoLists;
  }

  static async getAllForUser() {
    const response = await makeRequest(`${this.baseUrl}/getAllForUser`);
    const nogoListsReturn: INogoListReturnDTO[] = response.nogoLists;
    if (!nogoListsReturn) return [];
    const nogoLists = nogoListsReturn.map(
      (nogoListReturn) => new NogoList(nogoListReturn)
    );
    return nogoLists;
  }

  static async create(nogoList: INogoListCreateDTO) {
    const response = await makeRequest(`${this.baseUrl}/create`, 'POST', {
      nogoList,
    });
    const nogoListReturn: INogoListReturnDTO = response.nogoList;
    return new NogoList(nogoListReturn);
  }

  static async update(nogoListId: ID, nogoListUpdate: INogoListUpdateDTO) {
    const response = await makeRequest(
      `${this.baseUrl}/update/${nogoListId}`,
      'POST',
      {
        nogoListUpdate,
      }
    );
    const nogoListReturn: INogoListReturnDTO = response.updatedNogoList;
    return new NogoList(nogoListReturn);
  }

  static async delete(nogoListId: ID) {
    const response = await makeRequest(
      `${this.baseUrl}/delete/${nogoListId}`,
      'POST'
    );
    const deletedCount: number = response.deletedCount;
    return deletedCount;
  }
}
