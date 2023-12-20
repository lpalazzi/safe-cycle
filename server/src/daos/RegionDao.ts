import mongoose from 'mongoose';
import { RegionModel } from 'models';
import { IRegion, IRegionHydrated, IRegionReturnDTO } from 'interfaces';
import { BaseDao } from './BaseDao';
import { NoID } from 'types';

export class RegionDao extends BaseDao<
  IRegionHydrated,
  IRegionReturnDTO,
  NoID<IRegion>
> {
  constructor() {
    const populate = {
      path: 'contributors',
      select: '_id name role contributorProfile',
    };
    super(RegionModel, populate);
  }

  async get(query: mongoose.FilterQuery<IRegionHydrated>) {
    const q = this.model.find(query);
    if (this.populate) q.populate(this.populate);
    const documents = await q.exec();
    const returnDocuments: IRegionReturnDTO[] = await Promise.all(
      documents.map(async (document) => {
        const nogoLength = await document.nogoLength;
        return {
          ...document.toJSON(),
          nogoLength,
        };
      })
    );
    return returnDocuments;
  }

  async getOne(query: mongoose.FilterQuery<IRegionHydrated>) {
    const q = this.model.findOne(query);
    if (this.populate) q.populate(this.populate);
    const document = await q.exec();
    const returnDocument: IRegionReturnDTO | null = document
      ? {
          ...document.toJSON(),
          nogoLength: await document.nogoLength,
        }
      : null;
    return returnDocument;
  }

  async getById(id: mongoose.Types.ObjectId) {
    const q = this.model.findById(id);
    if (this.populate) q.populate(this.populate);
    const document = await q.exec();
    const returnDocument: IRegionReturnDTO | null = document
      ? {
          ...document.toJSON(),
          nogoLength: await document.nogoLength,
        }
      : null;
    return returnDocument;
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
