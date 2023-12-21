import mongoose from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { NogoDao } from 'daos';
import { NogoGroupService, RegionService } from 'services';
import { getLengthForLineString } from 'utils/geo';

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
    const nogo = await this.nogoDao.getById(nogoId);
    if (nogo && nogo.region)
      await this.regionService.subtractFromNogoLength(
        nogo.region,
        getLengthForLineString(nogo.lineString)
      );
    if (nogo && nogo.nogoGroup)
      await this.nogoGroupService.subtractFromNogoLength(
        nogo.nogoGroup,
        getLengthForLineString(nogo.lineString)
      );
    return this.nogoDao.deleteById(nogoId);
  }

  async transferNogosToRegion(
    nogoGroupId: mongoose.Types.ObjectId,
    regionId: mongoose.Types.ObjectId
  ) {
    if (!(await this.regionService.existsById(regionId)))
      throw new Error('Region does not exist');
    if (!(await this.nogoGroupService.existsById(nogoGroupId)))
      throw new Error('Nogo group does not exist');

    const updateResult = await this.nogoDao.updateMany(
      { nogoGroup: nogoGroupId },
      { $unset: { nogoGroup: 1 }, $set: { region: regionId } }
    );
    if (!updateResult.acknowledged) throw new Error('Transfer failed');
    this.regionService.refreshAllNogoLengths();
    this.nogoGroupService.refreshAllNogoLengths();
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
    route: GeoJSON.LineString,
    nogoGroupId?: mongoose.Types.ObjectId,
    regionId?: mongoose.Types.ObjectId
  ) {
    if (nogoGroupId && regionId)
      throw new Error('Only one of nogoGroupId or regionId can be provided');
    if (!nogoGroupId && !regionId)
      throw new Error('Either nogoGroupId or regionId must be provided');

    const routeIsOutsideRegion =
      regionId &&
      !(await this.regionService.isLineStringInRegion(route, regionId));
    if (routeIsOutsideRegion)
      throw new Error('Nogo is outside selected region');

    const lineString = this.fixStraightLineString(route);
    const nogo = await this.nogoDao.create({
      lineString,
      ...(nogoGroupId ? { nogoGroup: nogoGroupId } : { region: regionId }),
    });
    if (nogo && nogoGroupId)
      await this.nogoGroupService.addToNogoLength(
        nogoGroupId,
        getLengthForLineString(lineString)
      );
    else if (nogo && regionId)
      await this.regionService.addToNogoLength(
        regionId,
        getLengthForLineString(lineString)
      );
    return nogo;
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
      ];
      lineString.coordinates = [
        lineString.coordinates[0],
        newCoord,
        lineString.coordinates[1],
      ];
    }
    return lineString;
  }
}
