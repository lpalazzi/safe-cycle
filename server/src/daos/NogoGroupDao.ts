import mongoose from 'mongoose';
import { BaseDao } from './BaseDao';
import {
  INogoGroup,
  INogoGroupHydrated,
  INogoGroupReturnDTO,
} from 'interfaces';
import { NogoGroupModel } from 'models';
import { NoID } from 'types';

export class NogoGroupDao extends BaseDao<
  INogoGroupHydrated,
  INogoGroupReturnDTO,
  NoID<INogoGroup>
> {
  constructor() {
    const populate = {
      path: 'user',
      select: '_id name',
    };
    super(NogoGroupModel, populate);
  }

  async get(query: mongoose.FilterQuery<INogoGroupHydrated>) {
    const q = this.model.find(query);
    if (this.populate) q.populate(this.populate);
    const documents = await q.exec();
    const returnDocuments: INogoGroupReturnDTO[] = await Promise.all(
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

  async getOne(query: mongoose.FilterQuery<INogoGroupHydrated>) {
    const q = this.model.findOne(query);
    if (this.populate) q.populate(this.populate);
    const document = await q.exec();
    const returnDocument: INogoGroupReturnDTO | null = document
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
    const returnDocument: INogoGroupReturnDTO | null = document
      ? {
          ...document.toJSON(),
          nogoLength: await document.nogoLength,
        }
      : null;
    return returnDocument;
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
