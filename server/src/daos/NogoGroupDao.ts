import mongoose from 'mongoose';
import { BaseDao } from './BaseDao';
import { INogoGroup, INogoGroupReturnDTO } from 'interfaces';
import { NogoGroupModel } from 'models';

export class NogoGroupDao extends BaseDao<INogoGroup, INogoGroupReturnDTO> {
  constructor() {
    super(NogoGroupModel);
  }

  async getUserIdOnList(nogoGroupId: mongoose.Types.ObjectId) {
    const nogoGroup = await this.model
      .findById(nogoGroupId)
      .select('user')
      .lean();
    if (!nogoGroup) {
      throw new Error('Nogo Group not found');
    }
    return nogoGroup.user;
  }
}
