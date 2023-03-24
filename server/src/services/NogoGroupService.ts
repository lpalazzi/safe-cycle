import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import {
  INogoGroup,
  INogoGroupCreateDTO,
  INogoGroupUpdateDTO,
} from 'interfaces';
import { NogoDao, NogoGroupDao } from 'daos';
import { NoID } from 'types';
import { BadRequestError } from 'api/errors';

@injectable()
export class NogoGroupService {
  constructor(private nogoGroupDao: NogoGroupDao, private nogoDao: NogoDao) {}

  async getAll() {
    return this.nogoGroupDao.get({});
  }

  async getByUserId(userId: mongoose.Types.ObjectId) {
    return this.nogoGroupDao.get({ user: userId });
  }

  async existsById(nogoGroupId: mongoose.Types.ObjectId) {
    return this.nogoGroupDao.exists({ _id: nogoGroupId });
  }

  async create(
    newNogoGroup: INogoGroupCreateDTO,
    userId: mongoose.Types.ObjectId
  ) {
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
      throw new BadRequestError(
        `Name \"${nogoGroupToCreate.name}\" is already taken`
      );
    }

    return this.nogoGroupDao.create(nogoGroupToCreate);
  }

  async updateById(
    nogoGroupId: mongoose.Types.ObjectId,
    nogoGroupUpdate: INogoGroupUpdateDTO
  ) {
    return this.nogoGroupDao.updateById(nogoGroupId, nogoGroupUpdate);
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
    userId: mongoose.Types.ObjectId,
    nogoGroupId: mongoose.Types.ObjectId
  ) {
    const userIdOnNogoGroup = await this.nogoGroupDao.getUserIdOnList(
      nogoGroupId
    );
    return userId.equals(userIdOnNogoGroup);
  }
}
