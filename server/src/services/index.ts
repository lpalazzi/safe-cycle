export * from './UserService';
export * from './NogoService';
export * from './NogoGroupService';
export * from './RouterService';
export * from './RegionService';

import { container } from 'tsyringe';
import * as services from 'services';
container.register('UserService', services.UserService);
container.register('NogoService', services.NogoService);
container.register('NogoGroupService', services.NogoGroupService);
container.register('RouterService', services.RouterService);
container.register('RegionService', services.RegionService);
