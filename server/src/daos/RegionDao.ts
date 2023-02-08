import { BaseDao } from './BaseDao';
import { IRegion } from 'interfaces';
import { RegionModel } from 'models';

export class RegionDao extends BaseDao<IRegion> {
  constructor() {
    const populate = {
      path: 'contributors',
      select: 'name role -_id',
    };
    super(RegionModel, populate);
  }
}
