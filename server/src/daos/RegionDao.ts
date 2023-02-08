import { BaseDao } from './BaseDao';
import { IRegion } from 'interfaces';
import { RegionModel } from 'models';

export class RegionDao extends BaseDao<IRegion> {
  constructor() {
    super(RegionModel);
  }
}
