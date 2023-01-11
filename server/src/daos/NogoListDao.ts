import mongoose from 'mongoose';
import { BaseDao } from './BaseDao';
import { INogoList, INogoListReturnDTO } from 'interfaces';
import { NogoListModel } from 'models';

export class NogoListDao extends BaseDao<INogoList, INogoListReturnDTO> {
  constructor() {
    const populate = {
      path: 'user',
      select: '-_id name',
    };
    super(NogoListModel, populate);
  }

  async getUserIdOnList(nogoListId: mongoose.Types.ObjectId) {
    const nogoList = await this.model
      .findById(nogoListId)
      .select('user')
      .lean();
    if (!nogoList) {
      throw new Error('Nogo List not found');
    }
    return nogoList.user;
  }
}
