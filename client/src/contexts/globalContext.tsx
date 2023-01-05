import React, { createContext, useContext, useState, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { UserApi } from 'api';
import { User } from 'models';

type GlobalContextType =
  | {
      // states
      loggedInUser: User | null;
      isNavbarOpen: boolean;
      // functions
      updateLoggedInUser: () => void;
      logoutUser: () => void;
      toggleNavbar: () => void;
    }
  | undefined;

export const GlobalContext = createContext<GlobalContextType>(undefined);
GlobalContext.displayName = 'GlobalContext';

type GlobalContextProviderType = {
  children?: React.ReactNode;
};

export const GlobalContextProvider: React.FC<GlobalContextProviderType> = (
  props
) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);

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

  const logoutUser = async () => {
    try {
      const success = await UserApi.logout();
      if (success) {
        showNotification({
          message: 'You have successfully signed out',
        });
      }
    } catch (error: any) {
      showNotification({
        title: 'Logout error',
        message: error.message || 'Unknown error',
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
        updateLoggedInUser,
        logoutUser,
        toggleNavbar,
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
