import joi from 'joi';
import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import {
  INogoGroup,
  INogoGroupCreateDTO,
  INogoGroupReturnDTO,
  INogoGroupUpdateDTO,
} from 'interfaces';
import { NogoDao, NogoGroupDao } from 'daos';
import { NoID } from 'types';

@injectable()
export class NogoGroupService {
  constructor(private nogoGroupDao: NogoGroupDao, private nogoDao: NogoDao) {}

  async getById(id: mongoose.Types.ObjectId) {
    return await this.nogoGroupDao.getById(id);
  }

  async getByUserId(userId: mongoose.Types.ObjectId) {
    return await this.nogoGroupDao.get({ user: userId });
  }

  async getAll() {
    return await this.nogoGroupDao.get({});
  }

  async create(
    newNogoGroup: INogoGroupCreateDTO,
    userId: mongoose.Types.ObjectId
  ): Promise<{ nogoGroup: INogoGroupReturnDTO | null; error: string | null }> {
    try {
      const { error } = joi
        .object({
          name: joi.string().required(),
        })
        .required()
        .validate(newNogoGroup);

      if (error) {
        throw new Error(error.message);
      }

      const nogoGroupToCreate: NoID<INogoGroup> = {
        ...newNogoGroup,
        name: newNogoGroup.name.trim(),
        user: userId,
      };

      const nameIsTaken = await this.nogoGroupDao.exists({
        name: nogoGroupToCreate.name,
        user: nogoGroupToCreate.user,
      });
      if (nameIsTaken) {
        throw new Error(`Name \"${nogoGroupToCreate.name}\" is already taken`);
      }

      const nogoGroup = await this.nogoGroupDao.create(nogoGroupToCreate);

      return {
        nogoGroup,
        error: null,
      };
    } catch (err: any) {
      return {
        nogoGroup: null,
        error: err.message || 'Unhandled error',
      };
    }
  }

  async updateById(
    nogoGroupId: mongoose.Types.ObjectId,
    nogoGroupUpdate: INogoGroupUpdateDTO
  ): Promise<{
    updatedNogoGroup: INogoGroupReturnDTO | null;
    error: string | null;
  }> {
    const updateResult = await this.nogoGroupDao.updateById(
      nogoGroupId,
      nogoGroupUpdate
    );
    if (!updateResult.acknowledged) {
      return {
        updatedNogoGroup: null,
        error: 'Nogo Group was not modified',
      };
    }
    const updatedNogoGroup = await this.nogoGroupDao.getById(nogoGroupId);
    return {
      updatedNogoGroup,
      error: null,
    };
  }

  async deleteById(nogoGroupId: mongoose.Types.ObjectId): Promise<{
    nogoGroupDeleted: boolean;
    nogosDeleted: number;
  }> {
    const nogoGroupDeleteResult = await this.nogoGroupDao.deleteById(
      nogoGroupId
    );
    if (
      !nogoGroupDeleteResult.acknowledged ||
      nogoGroupDeleteResult.deletedCount < 1
    ) {
      return {
        nogoGroupDeleted: false,
        nogosDeleted: 0,
      };
    }
    const nogoDeleteResult = await this.nogoDao.deleteMany({
      nogoGroup: nogoGroupId,
    });

    return {
      nogoGroupDeleted: nogoGroupDeleteResult.deletedCount > 0,
      nogosDeleted: nogoDeleteResult.acknowledged
        ? nogoDeleteResult.deletedCount
        : 0,
    };
  }

  async doesUserOwnNogoGroup(
    nogoGroupId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const userIdOnNogoGroup = await this.nogoGroupDao.getUserIdOnList(
      nogoGroupId
    );
    return userId.equals(userIdOnNogoGroup);
  }
}
