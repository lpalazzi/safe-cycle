import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import { BaseDao } from './BaseDao';
import { INogoList, INogoListReturnDTO } from 'interfaces';
import { NogoListModel } from 'models';

@injectable()
export class NogoListDao extends BaseDao<INogoList, INogoListReturnDTO> {
  constructor() {
    const populate: mongoose.PopulateOptions = {
      path: 'user',
      select: 'fullName',
    };
    super(NogoListModel, populate);
  }

  // async getById(id: mongoose.Types.ObjectId) {
  //   const document: INogoListReturnDTO | null = await this.model
  //     .findById(id)
  //     .lean();
  //   return document;
  // }

  // async getOne(query: mongoose.FilterQuery<INogoList>) {
  //   const document: INogoListReturnDTO | null = await this.model
  //     .findOne(query)
  //     .lean();
  //   return document;
  // }

  // async get(query: mongoose.FilterQuery<INogoList>) {
  //   const documents: INogoListReturnDTO[] = await this.model.find(query).lean();
  //   return documents;
  // }
}
