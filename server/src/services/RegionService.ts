import mongoose from 'mongoose';
import geojsonWithin from '@turf/boolean-within';
import { injectable } from 'tsyringe';
import { RegionDao } from 'daos';

@injectable()
export class RegionService {
  constructor(private regionDao: RegionDao) {}

  async getAll() {
    return this.regionDao.get({});
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
}
