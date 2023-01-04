export * from './UserService';
export * from './NogoService';
export * from './NogoListService';
export * from './RouterService';

import { container } from 'tsyringe';
import * as services from 'services';
container.register('UserService', services.UserService);
container.register('NogoService', services.NogoService);
container.register('NogoListService', services.NogoListService);
container.register('RouterService', services.RouterService);
