export type RouteOptions = {
  avoidNogos?: boolean;
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
