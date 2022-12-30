import mongoose from 'mongoose';
import { NoID } from 'types';

export class BaseDao<Interface, IReturnInterface = Interface> {
  constructor(
    protected model: mongoose.Model<Interface>,
    protected returnProjection:
      | mongoose.ProjectionType<Interface>
      | undefined = undefined
  ) {}

  async get(query: mongoose.FilterQuery<Interface>) {
    const documents: IReturnInterface[] = await this.model
      .find(query, this.returnProjection)
      .lean();
    return documents;
  }

  async getOne(query: mongoose.FilterQuery<Interface>) {
    const document: IReturnInterface | null = await this.model
      .findOne(query, this.returnProjection)
      .lean();
    return document;
  }

  async getById(id: mongoose.Types.ObjectId) {
    const document: IReturnInterface | null = await this.model
      .findById(id, this.returnProjection)
      .lean();
    return document;
  }

  async exists(query: mongoose.FilterQuery<Interface>) {
    const exists = await this.model.exists(query).exec();
    return !!exists;
  }

  async create(newDocument: NoID<Interface>) {
    const createdDocument: Interface = (
      await this.model.create(newDocument)
    ).toObject();
    return createdDocument;
  }
}
