export type RouteOptions = {
  shortest?: boolean;
  preferBikeFriendly?: boolean;
  preferCycleRoutes?: boolean;
  surfacePreference?: SurfacePreference;
  alternativeidx?: 0 | 1 | 2 | 3;
};

export type SurfacePreference =
  | 'strictPaved'
  | 'preferPaved'
  | 'none'
  | 'preferUnpaved'
  | 'strictUnpaved';
