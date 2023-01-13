import joi from 'joi';
import mongoose from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { INogoCreateDTO, INogoReturnDTO } from 'interfaces';
import { NogoDao } from 'daos';
import { NogoGroupService } from 'services';

@injectable()
export class NogoService {
  constructor(
    private nogoDao: NogoDao,
    @inject('NogoGroupService') private nogoGroupService: NogoGroupService
  ) {}

  async getAllByList(nogoGroupId: mongoose.Types.ObjectId) {
    return this.nogoDao.get({ nogoGroup: nogoGroupId });
  }

  async deleteById(nogoId: mongoose.Types.ObjectId) {
    return this.nogoDao.deleteById(nogoId);
  }

  async canUserUpdateNogo(
    nogoId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const nogo = await this.nogoDao.getById(nogoId);
    if (!nogo) {
      throw new Error('Nogo not found');
    }
    return this.nogoGroupService.doesUserOwnNogoGroup(nogo.nogoGroup, userId);
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
        nogoGroup: joi.objectId().required(),
        lineString: joi.geojson().lineString().required(),
      })
      .required()
      .validate(newNogo);

    if (error) {
      throw new Error(error.message);
    }
  }
}
