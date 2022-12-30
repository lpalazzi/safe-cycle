import joi from 'joi';
import { injectable } from 'tsyringe';
import { INogoList, INogoListCreateDTO, INogoListReturnDTO } from 'interfaces';
import { NogoListDao } from 'daos';
import mongoose from 'mongoose';
import { NoID } from 'types';

@injectable()
export class NogoListService {
  constructor(private nogoListDao: NogoListDao) {}

  async getById(id: mongoose.Types.ObjectId) {
    return await this.nogoListDao.getById(id);
  }

  async getByUserId(userId: mongoose.Types.ObjectId) {
    return await this.nogoListDao.get({ user: userId });
  }

  async getAll() {
    return await this.nogoListDao.get({});
  }

  async create(
    newNogoList: INogoListCreateDTO,
    userId: mongoose.Types.ObjectId
  ): Promise<{ nogoList: INogoListReturnDTO | null; error: string | null }> {
    try {
      const { error } = joi
        .object({
          name: joi.string().required(),
        })
        .required()
        .validate(newNogoList);

      if (error) {
        throw new Error(error.message);
      }

      const nogoListToCreate: NoID<INogoList> = {
        ...newNogoList,
        name: newNogoList.name.trim(),
        user: userId,
      };

      const nameIsTaken = await this.nogoListDao.exists({
        name: nogoListToCreate.name,
        user: nogoListToCreate.user,
      });
      if (nameIsTaken) {
        throw new Error(`Name \"${nogoListToCreate.name}\" is already taken`);
      }

      const createdNogoList = await this.nogoListDao.create(nogoListToCreate);
      const nogoList = await this.getById(createdNogoList._id);

      return {
        nogoList,
        error: null,
      };
    } catch (err: any) {
      return {
        nogoList: null,
        error: err.message || 'Unhandled error',
      };
    }
  }
}
