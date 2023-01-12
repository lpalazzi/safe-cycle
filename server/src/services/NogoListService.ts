import joi from 'joi';
import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import {
  INogoList,
  INogoListCreateDTO,
  INogoListReturnDTO,
  INogoListUpdateDTO,
} from 'interfaces';
import { NogoDao, NogoListDao } from 'daos';
import { NoID } from 'types';

@injectable()
export class NogoListService {
  constructor(private nogoListDao: NogoListDao, private nogoDao: NogoDao) {}

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

      const nogoList = await this.nogoListDao.create(nogoListToCreate);

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

  async updateById(
    nogoListId: mongoose.Types.ObjectId,
    nogoListUpdate: INogoListUpdateDTO
  ): Promise<{
    updatedNogoList: INogoListReturnDTO | null;
    error: string | null;
  }> {
    const updateResult = await this.nogoListDao.updateById(
      nogoListId,
      nogoListUpdate
    );
    if (!updateResult.acknowledged) {
      return {
        updatedNogoList: null,
        error: 'NOGO List was not modified',
      };
    }
    const updatedNogoList = await this.nogoListDao.getById(nogoListId);
    return {
      updatedNogoList,
      error: null,
    };
  }

  async deleteById(nogoListId: mongoose.Types.ObjectId): Promise<{
    nogoListDeleted: boolean;
    nogosDeleted: number;
  }> {
    const nogoListDeleteResult = await this.nogoListDao.deleteById(nogoListId);
    if (
      !nogoListDeleteResult.acknowledged ||
      nogoListDeleteResult.deletedCount < 1
    ) {
      return {
        nogoListDeleted: false,
        nogosDeleted: 0,
      };
    }
    const nogoDeleteResult = await this.nogoDao.deleteMany({
      nogoList: nogoListId,
    });

    return {
      nogoListDeleted: nogoListDeleteResult.deletedCount > 0,
      nogosDeleted: nogoDeleteResult.acknowledged
        ? nogoDeleteResult.deletedCount
        : 0,
    };
  }

  async doesUserOwnNogoList(
    nogoListId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const userIdOnNogoList = await this.nogoListDao.getUserIdOnList(nogoListId);
    return userId.equals(userIdOnNogoList);
  }
}
