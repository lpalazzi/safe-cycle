import React, { createContext, useContext, useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { NogoGroupApi, RegionApi, UserApi } from 'api';
import { NogoGroup, Region, User } from 'models';
import { ID, RouteOptions } from 'types';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { openModal } from '@mantine/modals';
import { AboutModal } from 'components/modals/AboutModal';

type GlobalContextType =
  | {
      // states
      loggedInUser: User | null;
      isMobileSize: boolean;
      isNavbarOpen: boolean;
      isNavModeOn: boolean;
      selectedNogoGroups: ID[];
      editingGroupOrRegion: NogoGroup | Region | null;
      routeOptions: RouteOptions;
      regions: Region[];
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
      toggleNavMode: () => void;
      selectNogoGroup: (id: ID) => void;
      deselectNogoGroup: (id: ID) => void;
      clearSelectedNogoGroups: () => void;
      setEditingGroupOrRegion: (nogoGroup: NogoGroup | Region | null) => void;
      updateRouteOptions: (update: Partial<RouteOptions>) => void;
      refreshRegions: () => void;
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
  const theme = useMantineTheme();
  const isMobileSize = useMediaQuery(
    `(max-width: ${theme.breakpoints.sm - 1}px)`
  );
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(!isMobileSize);
  const [isNavModeOn, setIsNavModeOn] = useState(false);
  const [selectedNogoGroups, setSelectedNogoGroups] = useState<ID[]>([]);
  const [editingGroupOrRegion, setEditingGroupOrRegion] = useState<
    NogoGroup | Region | null
  >(null);
  const [routeOptions, setRouteOptions] = useState<RouteOptions>({
    avoidNogos: true,
    shortest: false,
    preferBikeFriendly: true,
    preferCycleRoutes: false,
    surfacePreference: 'preferPaved',
  });
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    updateLoggedInUser();
    openInfoModalOnFirstVisit();
    getStoredSelectedNogoGroups();
    refreshRegions();
  }, []);

  const openInfoModalOnFirstVisit = () => {
    const visited = window.localStorage.getItem('visited');
    if (!visited) {
      const isMobileSize = window.matchMedia(
        `(max-width: ${theme.breakpoints.sm - 1}px)`
      ).matches; // useMediaQuery state is still undefined on initial load
      window.localStorage.setItem('visited', '1');
      openModal(AboutModal('about', isMobileSize));
    }
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

  const refreshRegions = async () => {
    try {
      const fetchedRegions = await RegionApi.getAll();
      setRegions(fetchedRegions);
    } catch (error: any) {
      showNotification({
        title: 'Error fetching regions',
        message: error.message ?? 'Unhandled error',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    window.localStorage.setItem(
      'selectedNogoGroups',
      selectedNogoGroups.join()
    );
  }, [selectedNogoGroups]);

  const selectNogoGroup = (id: ID) => {
    if (selectedNogoGroups.includes(id)) {
      return;
    }
    const newSelectedNogoGroups = [...selectedNogoGroups];
    newSelectedNogoGroups.push(id);
    setSelectedNogoGroups(newSelectedNogoGroups);
  };

  const deselectNogoGroup = (id: ID) => {
    const newSelectedNogoGroups = [...selectedNogoGroups].filter(
      (selectedNogoGroup) => selectedNogoGroup !== id
    );
    setSelectedNogoGroups(newSelectedNogoGroups);
  };

  const clearSelectedNogoGroups = () => {
    setSelectedNogoGroups([]);
  };

  const handleSetEditingGroupOrRegion = (
    nogoGroup: NogoGroup | Region | null
  ) => {
    setEditingGroupOrRegion(nogoGroup);
    if (isMobileSize && nogoGroup) {
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
        editingGroupOrRegion,
        routeOptions,
        regions,
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
        toggleNavMode,
        selectNogoGroup,
        deselectNogoGroup,
        clearSelectedNogoGroups,
        setEditingGroupOrRegion: handleSetEditingGroupOrRegion,
        updateRouteOptions,
        refreshRegions,
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
