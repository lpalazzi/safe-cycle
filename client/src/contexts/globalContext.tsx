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
import {
  sortRegionsByCountryFunction,
  sortRegionsByLocationFunction,
  sortRegionsByNogoLengthFunction,
} from 'utils/sorting';
import { setAndroidStatusBar } from 'utils/device';

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
    setAndroidStatusBar();
    getStoredSelectedRegions().then(setSelectedRegions);
    getStoredSelectedNogoGroups().then(setSelectedNogoGroups);
    refreshRegions();
    refreshUserNogoGroups();
    countSiteVisits();
  }, []);

  const updateLoggedInUser = useCallback(async () => {
    const user = await UserApi.getActiveUser();
    setLoggedInUser(user);
  }, []);

  const toggleNavbar = useCallback(() => {
    setIsNavbarOpen(!isNavbarOpen);
  }, [isNavbarOpen]);

  const toggleNavMode = useCallback(() => {
    setIsNavModeOn(!isNavModeOn);
  }, [isNavModeOn]);

  const updateRouteOptions = useCallback(
    (update: Partial<RouteOptions>) => {
      setRouteOptions({
        ...routeOptions,
        ...update,
      });
    },
    [routeOptions]
  );

  const refreshRegions = useCallback(async () => {
    try {
      const fetchedRegions = await RegionApi.getAll();
      const newAlphaSortedRegions = [...fetchedRegions];
      newAlphaSortedRegions.sort(sortRegionsByCountryFunction);
      setRegions(newAlphaSortedRegions);

      // update nogo lengths
      newAlphaSortedRegions.forEach(async (region) => {
        const nogoLength = await region.getTotalNogoLength();
        setRegionLengths((prev) => ({
          ...prev,
          [region._id]: nogoLength,
        }));
      });
    } catch (error: any) {
      showNotification({
        title: 'Error fetching regions',
        message: error.message ?? 'Unhandled error',
        color: 'red',
      });
    }
  }, []);

  const getLocationSortedRegions = useCallback(
    (location: Location | null) => {
      if (location) {
        const locationSortedRegions = [...regions];
        locationSortedRegions.sort(
          sortRegionsByLocationFunction(location.latlng)
        );
        return locationSortedRegions;
      } else {
        return [];
      }
    },
    [regions]
  );

  const lengthSortedRegions = useMemo(() => {
    const sortedRegions = [...regions];
    sortedRegions.sort(sortRegionsByNogoLengthFunction(regionLengths));
    return sortedRegions;
  }, [regions, regionLengths]);

  const getLengthSortedRegions = useCallback(async () => {
    return lengthSortedRegions;
  }, [lengthSortedRegions]);

  const refreshUserNogoGroups = useCallback(async () => {
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
  }, [loggedInUser]);

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

  const clearSelectedNogoGroups = useCallback(() => {
    setSelectedNogoGroups([]);
  }, []);

  const clearSelectedRegions = useCallback(() => {
    setSelectedRegions([]);
  }, []);

  const handleSetEditingGroupOrRegion = useCallback(
    (groupOrRegion: NogoGroup | Region | null) => {
      setEditingGroupOrRegion(groupOrRegion);
      if (groupOrRegion) {
        setIsNavbarOpen(false);
      }
    },
    []
  );

  const logoutUser = useCallback(async () => {
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
  }, []);

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

const countSiteVisits = () => {
  var visited = Number(window.localStorage.getItem('visited'));
  if (isNaN(visited)) visited = 0;
  window.localStorage.setItem('visited', (visited + 1).toFixed(0));
};

const getStoredSelectedRegions = async () => {
  const stored = window.localStorage.getItem('selectedRegions');
  if (!stored || stored === '') return [];
  const allRegions = await RegionApi.getAll();
  const filteredStoredSelectedRegions = stored
    .split(',')
    .filter((selectedRegion) => {
      return !!allRegions.find((region) => region._id === selectedRegion);
    });
  return filteredStoredSelectedRegions;
};

const getStoredSelectedNogoGroups = async () => {
  const stored = window.localStorage.getItem('selectedNogoGroups');
  if (!stored || stored === '') return [];
  const userNogoGroups = await NogoGroupApi.getAllForUser();
  const filteredStoredSelectedNogoGroups = stored
    .split(',')
    .filter((selectedNogoGroup) => {
      return !!userNogoGroups.find(
        (nogoGroup) => nogoGroup._id === selectedNogoGroup
      );
    });
  return filteredStoredSelectedNogoGroups;
};
