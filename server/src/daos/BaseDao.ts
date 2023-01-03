import mongoose from 'mongoose';
import { NoID } from 'types';

export class BaseDao<Interface, ReturnInterface = Interface> {
  constructor(protected model: mongoose.Model<Interface>) {}

  async get(query: mongoose.FilterQuery<Interface>) {
    const documents: ReturnInterface[] = await this.model.find(query).lean();
    return documents;
  }

  async getOne(query: mongoose.FilterQuery<Interface>) {
    const document: ReturnInterface | null = await this.model
      .findOne(query)
      .lean();
    return document;
  }

  async getById(id: mongoose.Types.ObjectId) {
    const document: ReturnInterface | null = await this.model
      .findById(id)
      .lean();
    return document;
  }

  async exists(query: mongoose.FilterQuery<Interface>) {
    const exists = await this.model.exists(query).exec();
    return !!exists;
  }

  async create(newDocument: NoID<Interface>) {
    const createdDocument = await this.model.create(newDocument);
    return this.getById(createdDocument._id);
  }
}
