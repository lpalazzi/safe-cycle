import mongoose from 'mongoose';
import { RegionModel } from 'models';
import { IRegion, IRegionReturnDTO } from 'interfaces';
import { BaseDao } from './BaseDao';

export class RegionDao extends BaseDao<IRegion, IRegionReturnDTO> {
  constructor() {
    const populate = {
      path: 'contributors',
      select: '_id name role',
    };
    super(RegionModel, populate);
  }

  async getContributorIdsOnRegion(regionId: mongoose.Types.ObjectId) {
    const region = await this.model
      .findById(regionId)
      .select('contributors')
      .lean();
    if (!region) {
      throw new Error(`Region not found with id=${regionId}`);
    }
    return region.contributors;
  }
}
