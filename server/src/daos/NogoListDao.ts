import { injectable } from 'tsyringe';
import { BaseDao } from './BaseDao';
import { INogoList, INogoListReturnDTO } from 'interfaces';
import { NogoListModel } from 'models';

@injectable()
export class NogoListDao extends BaseDao<INogoList, INogoListReturnDTO> {
  constructor() {
    super(NogoListModel);
  }
}
