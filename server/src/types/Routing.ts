export type RouteOptions = {
  shortest?: boolean;
  preferBikeFriendly?: boolean;
  preferCycleRoutes?: boolean;
  surfacePreference?: SurfacePreference;
};

export type SurfacePreference =
  | 'strictPaved'
  | 'preferPaved'
  | 'none'
  | 'preferUnpaved';
