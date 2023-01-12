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
      selectedNogoLists: ID[];
      editingNogoList: ID | null;
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
      selectNogoList: (id: ID) => void;
      deselectNogoList: (id: ID) => void;
      setEditingNogoList: (id: ID | null) => void;
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
  const [selectedNogoLists, setSelectedNogoLists] = useState<ID[]>([]);
  const [editingNogoList, setEditingNogoList] = useState<ID | null>(null);

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

  const selectNogoList = (id: ID) => {
    if (selectedNogoLists.includes(id)) {
      return;
    }
    const newSelectedNogoLists = [...selectedNogoLists];
    newSelectedNogoLists.push(id);
    setSelectedNogoLists(newSelectedNogoLists);
  };

  const deselectNogoList = (id: ID) => {
    const newSelectedNogoLists = [...selectedNogoLists].filter(
      (selectedNogoList) => selectedNogoList !== id
    );
    setSelectedNogoLists(newSelectedNogoLists);
  };

  const logoutUser = async () => {
    try {
      const success = await UserApi.logout();
      if (success) {
        return;
      }
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
        selectedNogoLists,
        editingNogoList,
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
        selectNogoList,
        deselectNogoList,
        setEditingNogoList,
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
