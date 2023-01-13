import React, { createContext, useContext, useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { UserApi } from 'api';
import { NogoGroup, User } from 'models';
import { ID } from 'types';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

type GlobalContextType =
  | {
      // states
      loggedInUser: User | null;
      isMobileSize: boolean;
      isNavbarOpen: boolean;
      selectedNogoGroups: ID[];
      editingNogoGroup: NogoGroup | null;
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
      selectNogoGroup: (id: ID) => void;
      deselectNogoGroup: (id: ID) => void;
      setEditingNogoGroup: (nogoGroup: NogoGroup | null) => void;
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
  const [selectedNogoGroups, setSelectedNogoGroups] = useState<ID[]>([]);
  const [editingNogoGroup, setEditingNogoGroup] = useState<NogoGroup | null>(
    null
  );

  useEffect(() => {
    updateLoggedInUser();
  }, []);

  const updateLoggedInUser = async () => {
    const user = await UserApi.getActiveUser();
    setLoggedInUser(user);
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const selectNogoGroup = (id: ID) => {
    if (selectedNogoGroups.includes(id)) {
      return;
    }
    const newSelectedNogoGroups = [...selectedNogoGroups];
    newSelectedNogoGroups.push(id);
    setSelectedNogoGroups(newSelectedNogoGroups);
  };

  const handleSetEditingNogoGroup = (nogoGroup: NogoGroup | null) => {
    setEditingNogoGroup(nogoGroup);
    if (isMobileSize && nogoGroup) {
      setIsNavbarOpen(false);
    }
  };

  const deselectNogoGroup = (id: ID) => {
    const newSelectedNogoGroups = [...selectedNogoGroups].filter(
      (selectedNogoGroup) => selectedNogoGroup !== id
    );
    setSelectedNogoGroups(newSelectedNogoGroups);
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
        selectedNogoGroups,
        editingNogoGroup,
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
        selectNogoGroup,
        deselectNogoGroup,
        setEditingNogoGroup: handleSetEditingNogoGroup,
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
