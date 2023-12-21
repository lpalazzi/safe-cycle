export * from './UserService';
export * from './NogoService';
export * from './NogoGroupService';
export * from './RouterService';
export * from './RegionService';
export * from './BingMapsService';
export * from './NominatimService';
export * from './EmailService';

import { container } from 'tsyringe';
import * as services from 'services';
container.register('UserService', services.UserService);
container.register('NogoService', services.NogoService);
container.register('NogoGroupService', services.NogoGroupService);
container.register('RouterService', services.RouterService);
container.register('RegionService', services.RegionService);
container.register('BingMapsService', services.BingMapsService);
container.register('NominatimService', services.NominatimService);
container.register('EmailService', services.EmailService);

// refreshes all nogoLength values in the database on startup (just in case)
const regionService = container.resolve(services.RegionService);
const nogoGroupService = container.resolve(services.NogoGroupService);
regionService.refreshAllNogoLengths();
nogoGroupService.refreshAllNogoLengths();
