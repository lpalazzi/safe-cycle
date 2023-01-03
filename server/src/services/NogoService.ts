import joi from 'joi';
import mongoose from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { INogoCreateDTO, INogoReturnDTO } from 'interfaces';
import { NogoDao } from 'daos';
import { NogoListService } from 'services';

@injectable()
export class NogoService {
  constructor(
    private nogoDao: NogoDao,
    @inject('NogoListService') private nogoListService: NogoListService
  ) {}

  async getAllByList(nogoListId: mongoose.Types.ObjectId) {
    return await this.nogoDao.get({ nogoList: nogoListId });
  }

  async deleteByIds(nogoIds: mongoose.Types.ObjectId[]) {
    return await this.nogoDao.deleteMany({ _id: { $in: nogoIds } });
  }

  async canUserUpdateNogo(
    nogoId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const nogo = await this.nogoDao.getById(nogoId);
    if (!nogo) {
      throw new Error('Nogo not found');
    }
    return this.nogoListService.doesUserOwnNogoList(nogo.nogoList, userId);
  }

  async create(
    newNogo: INogoCreateDTO
  ): Promise<{ nogo: INogoReturnDTO | null; error: string | null }> {
    try {
      this.validateNewNogo(newNogo);
      const nogo = await this.nogoDao.create(newNogo);

      return {
        nogo,
        error: null,
      };
    } catch (err: any) {
      return {
        nogo: null,
        error: err.message || 'Unhandled error',
      };
    }
  }

  private validateNewNogo(newNogo: INogoCreateDTO) {
    const { error } = joi
      .object({
        nogoList: joi.objectId().required(),
        lineString: joi.geojson.lineString().required(),
      })
      .required()
      .validate(newNogo);

    if (error) {
      throw new Error(error.message);
    }
  }
}
