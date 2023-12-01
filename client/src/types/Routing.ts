export type RouteOptions = {
  shortest?: boolean;
  preferBikeFriendly?: boolean;
  preferCycleRoutes?: boolean;
  surfacePreference?: SurfacePreference;
  showAlternateRoutes?: boolean;
};

export type SurfacePreference =
  | 'strictPaved'
  | 'preferPaved'
  | 'none'
  | 'preferUnpaved';

export type ComfortLevel = 'Low' | 'Medium' | 'High' | 'Shortest' | 'Custom';
