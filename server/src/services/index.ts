export * from './UserService';
export * from './NogoService';
export * from './NogoListService';

import { container } from 'tsyringe';
import * as services from 'services';
container.register('UserService', services.UserService);
container.register('NogoService', services.NogoService);
container.register('NogoListService', services.NogoListService);
