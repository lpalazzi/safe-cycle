import React, { createContext, useContext, useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { NogoGroupApi, RegionApi, UserApi } from 'api';
import { NogoGroup, Region, User } from 'models';
import { ComfortLevel, ID, RouteOptions } from 'types';
import { useMediaQuery } from '@mantine/hooks';
import { openModal } from '@mantine/modals';
import { AboutModal } from 'components/modals/AboutModal';
import { SurveyModal } from 'components/modals/SurveyModal';

type GlobalContextType =
  | {
      // states
      loggedInUser: User | null;
      isMobileSize: boolean;
      isNavbarOpen: boolean;
      isNavbarCondensed: boolean;
      isNavModeOn: boolean;
      selectedNogoGroups: ID[];
      selectedRegions: ID[];
      editingGroupOrRegion: NogoGroup | Region | null;
      routeOptions: RouteOptions;
      selectedComfortLevel: ComfortLevel;
      showAlternateRoutes: boolean;
      regions: Region[];
      showTour: boolean;
      isLoading: boolean;
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
      toggleNavbarExpanded: () => void;
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
      setShowTour: (val: boolean) => void;
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
  const [showTour, setShowTour] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [isNavbarExpanded, setIsNavbarExpanded] = useState(false);
  const [isNavModeOn, setIsNavModeOn] = useState(false);
  const [selectedNogoGroups, setSelectedNogoGroups] = useState<ID[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<ID[]>([]);
  const [editingGroupOrRegion, setEditingGroupOrRegion] = useState<
    NogoGroup | Region | null
  >(null);
  const [routeOptions, setRouteOptions] = useState<RouteOptions>({
    avoidNogos: false,
    shortest: false,
    preferBikeFriendly: true,
    preferCycleRoutes: true,
    surfacePreference: 'none',
  });
  const [selectedComfortLevel, setSelectedComfortLevel] =
    useState<ComfortLevel>('High');
  const [showAlternateRoutes, setShowAlternateRoutes] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateLoggedInUser();
    openInfoModalOnFirstVisit();
    openSurveyModalOnManyVisits();
    getStoredSelectedNogoGroups();
    refreshRegions();
  }, []);

  const openInfoModalOnFirstVisit = () => {
    var visited = Number(window.localStorage.getItem('visited'));
    if (isNaN(visited)) visited = 0;
    window.localStorage.setItem('visited', (visited + 1).toFixed(0));
    if (!visited) {
      const isMobileSize = window.matchMedia('(max-width: 767px)').matches; // useMediaQuery state is still undefined on initial load
      if (!isMobileSize) openModal(AboutModal('about', isMobileSize));
    }
  };

  const openSurveyModalOnManyVisits = () => {
    const surveyClicked =
      window.localStorage.getItem('surveyClicked') === 'true';
    if (surveyClicked) return;
    var timesSurveyModalShown = Number(
      window.localStorage.getItem('timesSurveyModalShown')
    );
    if (isNaN(timesSurveyModalShown)) timesSurveyModalShown = 0;
    const visited = Number(window.localStorage.getItem('visited'));
    if (isNaN(visited)) return;
    if (visited >= 10 && timesSurveyModalShown < 3) {
      openModal(SurveyModal);
      window.localStorage.setItem(
        'timesSurveyModalShown',
        (timesSurveyModalShown + 1).toFixed(0)
      );
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
    if (!isNavbarOpen) setIsNavbarExpanded(false);
  };

  const toggleNavbarExpanded = () => {
    setIsNavbarExpanded(!isNavbarExpanded);
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
        isNavbarCondensed: isMobileSize && !isNavbarExpanded,
        isNavModeOn,
        selectedNogoGroups,
        selectedRegions,
        editingGroupOrRegion,
        routeOptions,
        selectedComfortLevel,
        showAlternateRoutes,
        regions,
        showTour,
        isLoading,
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
        toggleNavbarExpanded,
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
        setShowTour,
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
