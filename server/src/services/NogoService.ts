import joi from 'joi';
import mongoose from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { INogoCreateDTO, INogoReturnDTO } from 'interfaces';
import { NogoDao } from 'daos';
import { NogoGroupService, RegionService } from 'services';

@injectable()
export class NogoService {
  constructor(
    private nogoDao: NogoDao,
    @inject('NogoGroupService') private nogoGroupService: NogoGroupService,
    @inject('RegionService') private regionService: RegionService
  ) {}

  async getAllByGroup(groupId: mongoose.Types.ObjectId, isRegion?: boolean) {
    return this.nogoDao.get(
      isRegion ? { region: groupId } : { nogoGroup: groupId }
    );
  }

  async deleteById(nogoId: mongoose.Types.ObjectId) {
    return this.nogoDao.deleteById(nogoId);
  }

  async transferNogosToRegion(
    nogoGroupId: mongoose.Types.ObjectId,
    regionId: mongoose.Types.ObjectId
  ) {
    const updateResult = await this.nogoDao.updateMany(
      { nogoGroup: nogoGroupId },
      { $unset: { nogoGroup: 1 }, $set: { region: regionId } }
    );
    if (!updateResult.acknowledged) throw new Error('Transfer failed');
    return updateResult.modifiedCount;
  }

  async canUserUpdateNogo(
    nogoId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const nogo = await this.nogoDao.getById(nogoId);
    if (!nogo) throw new Error('Nogo not found');
    else if (nogo.region)
      return this.regionService.isUserContributorOnRegion(userId, nogo.region);
    else if (nogo.nogoGroup)
      return this.nogoGroupService.doesUserOwnNogoGroup(userId, nogo.nogoGroup);
    else return false;
  }

  async create(
    newNogo: INogoCreateDTO
  ): Promise<{ nogo: INogoReturnDTO | null; error: string | null }> {
    try {
      this.validateNewNogo(newNogo);
      const nogo = await this.nogoDao.create({
        ...newNogo,
        lineString: this.fixStraightLineString(newNogo.lineString),
      });

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

  private fixStraightLineString(lineString: GeoJSON.LineString) {
    // If a LineString is only 2 points (i.e., straight) it will not behave properly as a Nogo; BRouter won't avoid it if the route travels directly through the Nogo LineString end-to-end
    // This function adds a third point in the middle to create a slight bend in the line, which will trigger BRouter to properly avoid it
    if (lineString.coordinates.length === 2) {
      const newCoord: GeoJSON.Position = [
        (lineString.coordinates[0][0] + lineString.coordinates[1][0]) / 2 +
          10e-6,
        (lineString.coordinates[0][1] + lineString.coordinates[1][1]) / 2 +
          10e-6,
        (lineString.coordinates[0][2] + lineString.coordinates[1][2]) / 2,
      ];
      lineString.coordinates = [
        lineString.coordinates[0],
        newCoord,
        lineString.coordinates[1],
      ];
    }
    return lineString;
  }

  private validateNewNogo(newNogo: INogoCreateDTO) {
    const { error } = joi
      .object({
        lineString: joi.geojson().lineString().required(),
        nogoGroup: joi.objectId(),
        region: joi.objectId(),
      })
      .required()
      .validate(newNogo);

    if (error) {
      throw new Error(error.message);
    }
  }
}
