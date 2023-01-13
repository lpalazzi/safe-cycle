import React, { createContext, useContext, useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { UserApi } from 'api';
import { User } from 'models';
import { ID } from 'types';

type GlobalContextType =
  | {
      // states
      loggedInUser: User | null;
      isNavbarOpen: boolean;
      selectedNogoGroups: ID[];
      editingNogoGroup: ID | null;
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
      selectNogoGroup: (id: ID) => void;
      deselectNogoGroup: (id: ID) => void;
      setEditingNogoGroup: (id: ID | null) => void;
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
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [selectedNogoGroups, setSelectedNogoGroups] = useState<ID[]>([]);
  const [editingNogoGroup, setEditingNogoGroup] = useState<ID | null>(null);

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
        isNavbarOpen,
        selectedNogoGroups,
        editingNogoGroup,
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
        selectNogoGroup,
        deselectNogoGroup,
        setEditingNogoGroup,
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
