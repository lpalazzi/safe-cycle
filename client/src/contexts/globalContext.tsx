import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { showNotification } from '@mantine/notifications';
import { NogoGroupApi, RegionApi, UserApi } from 'api';
import { NogoGroup, Region, User } from 'models';
import { ComfortLevel, ID, Location, RouteOptions } from 'types';
import { useMediaQuery } from '@mantine/hooks';

type GlobalContextType =
  | {
      // states
      loggedInUser: User | null;
      isMobileSize: boolean;
      isNavbarOpen: boolean;
      isNavModeOn: boolean;
      selectedNogoGroups: ID[];
      selectedRegions: ID[];
      editingGroupOrRegion: NogoGroup | Region | null;
      routeOptions: RouteOptions;
      selectedComfortLevel: ComfortLevel;
      showAlternateRoutes: boolean;
      regions: Region[];
      userNogoGroups: NogoGroup[];
      regionLengths: { [key: string]: number };
      isLoading: boolean;
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
      toggleNavMode: () => void;
      setSelectedNogoGroups: (nogoGroupIds: ID[]) => void;
      setSelectedRegions: (regionIds: ID[]) => void;
      clearSelectedNogoGroups: () => void;
      clearSelectedRegions: () => void;
      setEditingGroupOrRegion: (nogoGroup: NogoGroup | Region | null) => void;
      updateRouteOptions: (update: Partial<RouteOptions>) => void;
      setSelectedComfortLevel: (value: ComfortLevel) => void;
      setShowAlternateRoutes: (val: boolean) => void;
      refreshRegions: () => void;
      refreshUserNogoGroups: () => void;
      getLocationSortedRegions: (location: Location | null) => Region[];
      getLengthSortedRegions: () => Promise<Region[]>;
      setIsLoading: (val: boolean) => void;
    }
  | undefined;

const GlobalContext = createContext<GlobalContextType>(undefined);
GlobalContext.displayName = 'GlobalContext';

type GlobalContextProviderType = {
  children?: React.ReactNode;
};
export const GlobalContextProvider: React.FC<GlobalContextProviderType> = (
  props
) => {
  const isMobileSize = useMediaQuery('(max-width: 767px)');
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [isNavModeOn, setIsNavModeOn] = useState(false);
  const [selectedNogoGroups, setSelectedNogoGroups] = useState<ID[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<ID[]>([]);
  const [editingGroupOrRegion, setEditingGroupOrRegion] = useState<
    NogoGroup | Region | null
  >(null);
  const [routeOptions, setRouteOptions] = useState<RouteOptions>({
    shortest: false,
    preferBikeFriendly: true,
    preferCycleRoutes: true,
    surfacePreference: 'none',
  });
  const [selectedComfortLevel, setSelectedComfortLevel] =
    useState<ComfortLevel>('High');
  const [showAlternateRoutes, setShowAlternateRoutes] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [userNogoGroups, setUserNogoGroups] = useState<NogoGroup[]>([]);
  const [regionLengths, setRegionLengths] = useState<{ [key: string]: number }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateLoggedInUser();
    countSiteVisits();
    getStoredSelectedRegions();
    getStoredSelectedNogoGroups();
    refreshRegions();
    refreshUserNogoGroups();
  }, []);

  const countSiteVisits = () => {
    var visited = Number(window.localStorage.getItem('visited'));
    if (isNaN(visited)) visited = 0;
    window.localStorage.setItem('visited', (visited + 1).toFixed(0));
  };

  const getStoredSelectedNogoGroups = async () => {
    const stored = window.localStorage.getItem('selectedNogoGroups');
    if (!stored || stored === '') return;
    const userNogoGroups = await NogoGroupApi.getAllForUser();
    const filteredStoredSelectedNogoGroups = stored
      .split(',')
      .filter((selectedNogoGroup) => {
        return !!userNogoGroups.find(
          (nogoGroup) => nogoGroup._id === selectedNogoGroup
        );
      });
    setSelectedNogoGroups(filteredStoredSelectedNogoGroups);
  };

  const getStoredSelectedRegions = async () => {
    const stored = window.localStorage.getItem('selectedRegions');
    if (!stored || stored === '') return;
    const allRegions = await RegionApi.getAll();
    const filteredStoredSelectedRegions = stored
      .split(',')
      .filter((selectedRegion) => {
        return !!allRegions.find((region) => region._id === selectedRegion);
      });
    setSelectedRegions(filteredStoredSelectedRegions);
  };

  const updateLoggedInUser = async () => {
    const user = await UserApi.getActiveUser();
    setLoggedInUser(user);
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const toggleNavMode = () => {
    setIsNavModeOn(!isNavModeOn);
  };

  const updateRouteOptions = (update: Partial<RouteOptions>) => {
    setRouteOptions({
      ...routeOptions,
      ...update,
    });
  };

  const refreshRegions = useCallback(async () => {
    try {
      const fetchedRegions = await RegionApi.getAll();
      const alphaSortFunction = (a: Region, b: Region) => {
        const compareRegion = (
          a.iso31662?.nameWithCountry || 'zzz'
        ).localeCompare(b.iso31662?.nameWithCountry || 'zzz');
        if (compareRegion === 0) {
          return a.name.localeCompare(b.name);
        }
        return compareRegion;
      };
      const newAlphaSortedRegions = [...fetchedRegions];
      newAlphaSortedRegions.sort(alphaSortFunction);
      setRegions(newAlphaSortedRegions);
    } catch (error: any) {
      showNotification({
        title: 'Error fetching regions',
        message: error.message ?? 'Unhandled error',
        color: 'red',
      });
    }
  }, []);

  useEffect(() => {
    regions.forEach((region) => {
      region.getTotalNogoLength().then((length) => {
        setRegionLengths((prev) => ({
          ...prev,
          [region._id]: length,
        }));
      });
    });
  }, [regions]);

  const getLocationSortedRegions = useCallback(
    (location: Location | null) => {
      if (location) {
        const locationSortFunction = (a: Region, b: Region) => {
          const isInA = a.isLatLngInside(location.latlng);
          const isInB = b.isLatLngInside(location.latlng);
          const aDistance = isInA ? 0 : a.getDistanceTo(location.latlng);
          const bDistance = isInB ? 0 : b.getDistanceTo(location.latlng);
          return aDistance - bDistance;
        };
        const locationSortedRegions = [...regions];
        locationSortedRegions.sort(locationSortFunction);

        return locationSortedRegions;
      } else {
        return [];
      }
    },
    [regions]
  );

  const lengthSortedRegions = useMemo(async () => {
    const regionsWithLengths = await Promise.all(
      regions.map(async (region) => {
        return {
          region,
          length: await region.getTotalNogoLength(),
        };
      })
    );
    const sortFunction = (
      a: { region: Region; length: number },
      b: { region: Region; length: number }
    ) => b.length - a.length;
    regionsWithLengths.sort(sortFunction);
    const sortedRegions = regionsWithLengths.map((obj) => obj.region);
    return sortedRegions;
  }, [regions]);

  const getLengthSortedRegions = useCallback(async () => {
    return lengthSortedRegions;
  }, [lengthSortedRegions]);

  const refreshUserNogoGroups = async () => {
    try {
      if (!loggedInUser) {
        setUserNogoGroups([]);
      } else {
        const fetchedUserNogoGroups = await NogoGroupApi.getAllForUser();
        setUserNogoGroups(fetchedUserNogoGroups);
      }
    } catch (error: any) {
      showNotification({
        title: 'Error fetching nogo groups',
        message: error.message ?? 'Unhandled error',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    refreshUserNogoGroups();
  }, [loggedInUser]);

  useEffect(() => {
    window.localStorage.setItem(
      'selectedNogoGroups',
      selectedNogoGroups.join()
    );
  }, [selectedNogoGroups]);

  useEffect(() => {
    window.localStorage.setItem('selectedRegions', selectedRegions.join());
  }, [selectedRegions]);

  const clearSelectedNogoGroups = () => {
    setSelectedNogoGroups([]);
  };

  const clearSelectedRegions = () => {
    setSelectedRegions([]);
  };

  const handleSetEditingGroupOrRegion = (
    groupOrRegion: NogoGroup | Region | null
  ) => {
    setEditingGroupOrRegion(groupOrRegion);
    if (groupOrRegion) {
      setIsNavbarOpen(false);
    }
  };

  const logoutUser = async () => {
    try {
      await UserApi.logout();
    } catch (error: any) {
      showNotification({
        title: 'Error signing out user',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
    updateLoggedInUser();
  };

  return (
    <GlobalContext.Provider
      value={{
        loggedInUser,
        isMobileSize,
        isNavbarOpen,
        isNavModeOn,
        selectedNogoGroups,
        selectedRegions,
        editingGroupOrRegion,
        routeOptions,
        selectedComfortLevel,
        showAlternateRoutes,
        regions,
        userNogoGroups,
        regionLengths,
        isLoading,
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
        toggleNavMode,
        setSelectedNogoGroups,
        setSelectedRegions,
        clearSelectedNogoGroups,
        clearSelectedRegions,
        setEditingGroupOrRegion: handleSetEditingGroupOrRegion,
        updateRouteOptions,
        setSelectedComfortLevel,
        setShowAlternateRoutes,
        refreshRegions,
        refreshUserNogoGroups,
        getLocationSortedRegions,
        getLengthSortedRegions,
        setIsLoading,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be inside a GlobalContextProvider');
  }
  return context;
};
