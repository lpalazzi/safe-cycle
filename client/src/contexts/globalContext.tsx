import React, { createContext, useContext, useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { NogoGroupApi, UserApi } from 'api';
import { NogoGroup, User } from 'models';
import { ID, RouteOptions } from 'types';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

type GlobalContextType =
  | {
      // states
      loggedInUser: User | null;
      isMobileSize: boolean;
      isNavbarOpen: boolean;
      isNavModeOn: boolean;
      selectedNogoGroups: ID[];
      editingNogoGroup: NogoGroup | null;
      routeOptions: RouteOptions;
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
      toggleNavMode: () => void;
      selectNogoGroup: (id: ID) => void;
      deselectNogoGroup: (id: ID) => void;
      setEditingNogoGroup: (nogoGroup: NogoGroup | null) => void;
      updateRouteOptions: (update: Partial<RouteOptions>) => void;
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
  const [editingNogoGroup, setEditingNogoGroup] = useState<NogoGroup | null>(
    null
  );
  const [routeOptions, setRouteOptions] = useState<RouteOptions>({});

  useEffect(() => {
    updateLoggedInUser();
    getStoredSelectedNogoGroups();
  }, []);

  const getStoredSelectedNogoGroups = async () => {
    const stored = window.localStorage.getItem('selectedNogoGroups');
    if (!stored || stored === '') return;
    const publicNogoGroups = await NogoGroupApi.getAllPublic();
    const userNogoGroups = await NogoGroupApi.getAllForUser();
    const filteredStoredSelectedNogoGroups = stored
      .split(',')
      .filter((selectedNogoGroup) => {
        return !![...publicNogoGroups, ...userNogoGroups].find(
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

  const handleSetEditingNogoGroup = (nogoGroup: NogoGroup | null) => {
    setEditingNogoGroup(nogoGroup);
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
        editingNogoGroup,
        routeOptions,
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
        toggleNavMode,
        selectNogoGroup,
        deselectNogoGroup,
        setEditingNogoGroup: handleSetEditingNogoGroup,
        updateRouteOptions,
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
