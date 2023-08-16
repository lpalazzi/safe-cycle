import React from 'react';
import { Divider } from '@mantine/core';

import { RoutePreferences } from './content/RoutePreferences';
import { UserNogoGroups } from './content/UserNogoGroups';
import { WaypointsList } from './content/WaypointsList';
import { useGlobalContext } from 'contexts/globalContext';
import { UserRegions } from './content/UserRegions';

export const SidebarContent: React.FC = () => {
  const { loggedInUser, isNavbarCondensed, isMobileSize } = useGlobalContext();

  return (
    <>
      <WaypointsList />
      {!isMobileSize ? <Divider my='sm' /> : null}
      <RoutePreferences />
      {!isNavbarCondensed && loggedInUser?.settings?.privateNogosEnabled ? (
        <>
          <Divider my='sm' />
          <UserNogoGroups />
        </>
      ) : null}
      {!isNavbarCondensed && loggedInUser?.role === 'verified contributor' ? (
        <>
          <Divider my='sm' />
          <UserRegions />
        </>
      ) : null}
    </>
  );
};
