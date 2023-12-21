import mongoose from 'mongoose';
import geojsonWithin from '@turf/boolean-within';
import { inject, injectable } from 'tsyringe';
import { NoID } from 'types';
import { NogoDao, RegionDao } from 'daos';
import { IRegion, IRegionCreateDTO } from 'interfaces';
import { UserService } from 'services';
import { getLengthForLineString } from 'utils/geo';

@injectable()
export class RegionService {
  constructor(
    private regionDao: RegionDao,
    private nogoDao: NogoDao,
    @inject('UserService') private userService: UserService
  ) {}

  async getAll(userId?: mongoose.Types.ObjectId) {
    const allRegions = await this.regionDao.get({});
    const admin = userId ? await this.userService.isUserAdmin(userId) : false;
    // if admin, return all regions
    if (admin) return allRegions;
    // else, return only regions with nogoLength >= 5km, or where user is a contributor
    return allRegions.filter((region) => {
      if (region.nogoLength && region.nogoLength >= 5000) return true;
      return (
        !!userId &&
        !!region.contributors.find((contributor) =>
          contributor._id.equals(userId)
        )
      );
    });
  }

  async existsById(regionId: mongoose.Types.ObjectId) {
    return this.regionDao.exists({ _id: regionId });
  }

  async existsWithName(name: string) {
    return this.regionDao.exists({ name });
  }

  async isLineStringInRegion(
    lineString: GeoJSON.LineString,
    regionId: mongoose.Types.ObjectId
  ) {
    const region = await this.regionDao.getById(regionId);
    if (!region) return false;
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
    const regionToCreate: NoID<IRegion> = {
      ...newRegion,
      name: newRegion.name.trim(),
      contributors: [],
      nogoLength: 0,
    };

    const nameIsTaken = await this.existsWithName(regionToCreate.name);
    if (nameIsTaken)
      throw new Error(`Name \"${regionToCreate.name}\" is already taken`);

    return this.regionDao.create(regionToCreate);
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

  async addToNogoLength(regionId: mongoose.Types.ObjectId, nogoLength: number) {
    const region = await this.regionDao.getById(regionId);
    const update = await this.regionDao.updateById(regionId, {
      nogoLength: (region?.nogoLength || 0) + nogoLength,
    });
    return update.acknowledged && update.modifiedCount === 1;
  }

  async subtractFromNogoLength(
    regionId: mongoose.Types.ObjectId,
    nogoLength: number
  ) {
    const region = await this.regionDao.getById(regionId);
    const newNogoLength = (region?.nogoLength || 0) - nogoLength;
    const update = await this.regionDao.updateById(regionId, {
      nogoLength: newNogoLength < 0 ? 0 : newNogoLength,
    });
    return update.acknowledged && update.modifiedCount === 1;
  }

  async refreshNogoLengthForRegion(regionId: mongoose.Types.ObjectId) {
    const nogos = await this.nogoDao.get({ region: regionId });
    const nogoLength = nogos
      .map((nogo) => getLengthForLineString(nogo.lineString))
      .reduce((partialSum, a) => partialSum + a, 0);
    const update = await this.regionDao.updateById(regionId, { nogoLength });
    return update.acknowledged && update.modifiedCount === 1;
  }

  async refreshAllNogoLengths() {
    const regions = await this.regionDao.get({});
    const updates = await Promise.all(
      regions.map(async (region) => this.refreshNogoLengthForRegion(region._id))
    );
    return updates.every((update) => update);
  }
}
