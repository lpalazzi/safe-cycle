import mongoose from 'mongoose';
import { NoID } from 'types';

export class BaseDao<Interface, ReturnInterface = Interface> {
  constructor(
    protected model: mongoose.Model<Interface>,
    protected populate: mongoose.PopulateOptions | undefined = undefined
  ) {}

  async get(query: mongoose.FilterQuery<Interface>) {
    const q = this.model.find(query);
    if (this.populate) q.populate(this.populate);
    const documents: ReturnInterface[] = await q.lean();
    return documents;
  }

  async getOne(query: mongoose.FilterQuery<Interface>) {
    const q = this.model.findOne(query);
    if (this.populate) q.populate(this.populate);
    const document: ReturnInterface | null = await q.lean();
    return document;
  }

  async getById(id: mongoose.Types.ObjectId) {
    const q = this.model.findById(id);
    if (this.populate) q.populate(this.populate);
    const document: ReturnInterface | null = await q.lean();
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

  async deleteById(id: mongoose.Types.ObjectId) {
    const deleteResult = await this.model.deleteOne({ _id: id });
    return deleteResult;
  }

  async deleteOne(query: mongoose.FilterQuery<Interface>) {
    const deleteResult = await this.model.deleteOne(query);
    return deleteResult;
  }

  async deleteMany(query: mongoose.FilterQuery<Interface>) {
    const deleteResult = await this.model.deleteMany(query);
    return deleteResult;
  }
}
