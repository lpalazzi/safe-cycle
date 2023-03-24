import mongoose from 'mongoose';
import joi from 'joi';
import geojsonWithin from '@turf/boolean-within';
import { injectable } from 'tsyringe';
import { NoID } from 'types';
import { RegionDao } from 'daos';
import { IRegion, IRegionCreateDTO } from 'interfaces';

@injectable()
export class RegionService {
  constructor(private regionDao: RegionDao) {}

  async getAll() {
    return this.regionDao.get({});
  }

  async existsById(regionId: mongoose.Types.ObjectId) {
    return this.regionDao.exists({ _id: regionId });
  }

  async isLineStringInRegion(
    lineString: GeoJSON.LineString,
    regionId: mongoose.Types.ObjectId
  ) {
    const region = await this.regionDao.getById(regionId);
    if (!region) {
      throw new Error(`No region found for regionId=${regionId}`);
    }
    return geojsonWithin(lineString, region.polygon);
  }

  async isUserContributorOnRegion(
    userId: mongoose.Types.ObjectId,
    regionId: mongoose.Types.ObjectId
  ) {
    const contributors = await this.regionDao.getContributorIdsOnRegion(
      regionId
    );
    return !!contributors.find((contributorId) => contributorId.equals(userId));
  }

  async create(newRegion: IRegionCreateDTO) {
    try {
      const { error } = joi
        .object({
          name: joi.string().required(),
          polygon: joi.geojson().polygon().required(),
        })
        .required()
        .validate(newRegion);

      if (error) {
        throw new Error(error.message);
      }

      const regionToCreate: NoID<IRegion> = {
        ...newRegion,
        contributors: [],
      };

      const nameIsTaken = await this.regionDao.exists({
        name: regionToCreate.name,
      });
      if (nameIsTaken) {
        throw new Error(`Name \"${regionToCreate.name}\" is already taken`);
      }

      const region = await this.regionDao.create(regionToCreate);

      return {
        region,
        error: null,
      };
    } catch (err: any) {
      return {
        region: null,
        error: err.message || 'Unhandled error',
      };
    }
  }

  async addContributorToRegion(
    regionId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const contributors = await this.regionDao.getContributorIdsOnRegion(
      regionId
    );
    if (!!contributors.find((contributor) => contributor._id.equals(userId))) {
      throw new Error('User is already a contributor on this region');
    }
    contributors.push(userId);
    const updateResult = await this.regionDao.updateById(regionId, {
      contributors,
    });
    return updateResult.acknowledged && updateResult.modifiedCount === 1;
  }

  async removeContributorFromRegion(
    regionId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ) {
    const contributors = await this.regionDao.getContributorIdsOnRegion(
      regionId
    );
    const index = contributors.findIndex((contributor) =>
      contributor._id.equals(userId)
    );
    if (index < 0) {
      return true;
    }
    contributors.splice(index, 1);
    const updateResult = await this.regionDao.updateById(regionId, {
      contributors,
    });
    return updateResult.acknowledged && updateResult.modifiedCount === 1;
  }
}
