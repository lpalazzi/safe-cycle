import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import {
  INogoGroup,
  INogoGroupCreateDTO,
  INogoGroupUpdateDTO,
} from 'interfaces';
import { NogoDao, NogoGroupDao } from 'daos';
import { NoID } from 'types';
import { getLengthForLineString } from 'utils/geo';

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

  async existsWithName(name: string, userId: mongoose.Types.ObjectId) {
    return this.nogoGroupDao.exists({ name, user: userId });
  }

  async create(
    newNogoGroup: INogoGroupCreateDTO,
    userId: mongoose.Types.ObjectId
  ) {
    const nogoGroupToCreate: NoID<INogoGroup> = {
      ...newNogoGroup,
      name: newNogoGroup.name.trim(),
      user: userId,
      nogoLength: 0,
    };

    const nameIsTaken = await this.existsWithName(
      nogoGroupToCreate.name,
      userId
    );
    if (nameIsTaken)
      throw new Error(`Name \"${nogoGroupToCreate.name}\" is already taken`);

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

  async addToNogoLength(
    nogoGroupId: mongoose.Types.ObjectId,
    nogoLength: number
  ) {
    const nogoGroup = await this.nogoGroupDao.getById(nogoGroupId);
    const update = await this.nogoGroupDao.updateById(nogoGroupId, {
      nogoLength: (nogoGroup?.nogoLength || 0) + nogoLength,
    });
    return update.acknowledged && update.modifiedCount === 1;
  }

  async subtractFromNogoLength(
    nogoGroupId: mongoose.Types.ObjectId,
    nogoLength: number
  ) {
    const nogoGroup = await this.nogoGroupDao.getById(nogoGroupId);
    const newNogoLength = (nogoGroup?.nogoLength || 0) - nogoLength;
    const update = await this.nogoGroupDao.updateById(nogoGroupId, {
      nogoLength: newNogoLength < 0 ? 0 : newNogoLength,
    });
    return update.acknowledged && update.modifiedCount === 1;
  }

  async refreshNogoLengthForNogoGroup(nogoGroupId: mongoose.Types.ObjectId) {
    const nogos = await this.nogoDao.get({ nogoGroup: nogoGroupId });
    const nogoLength = nogos
      .map((nogo) => getLengthForLineString(nogo.lineString))
      .reduce((partialSum, a) => partialSum + a, 0);
    const update = await this.nogoGroupDao.updateById(nogoGroupId, {
      nogoLength,
    });
    return update.acknowledged && update.modifiedCount === 1;
  }

  async refreshAllNogoLengths() {
    const nogoGroups = await this.nogoGroupDao.get({});
    const updates = await Promise.all(
      nogoGroups.map(async (nogoGroup) =>
        this.refreshNogoLengthForNogoGroup(nogoGroup._id)
      )
    );
    return updates.every((update) => update);
  }
}
