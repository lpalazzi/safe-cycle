import { BaseDao } from './BaseDao';
import { INogo, INogoReturnDTO } from 'interfaces';
import { NogoModel } from 'models';

export class NogoDao extends BaseDao<INogo, INogoReturnDTO> {
  constructor() {
    super(NogoModel);
  }
}
