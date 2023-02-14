import React from 'react';
import { Divider } from '@mantine/core';

import { RoutePreferences } from './content/RoutePreferences';
import { UserNogoGroups } from './content/UserNogoGroups';
import { WaypointsList } from './content/WaypointsList';
import { useGlobalContext } from 'contexts/globalContext';
import { UserRegions } from './content/UserRegions';

export const SidebarContent: React.FC = () => {
  const { loggedInUser } = useGlobalContext();

  return (
    <>
      <WaypointsList />
      <Divider my='sm' />
      <RoutePreferences />
      <Divider my='sm' />
      <UserNogoGroups />
      {loggedInUser?.role === 'verified contributor' ? (
        <>
          <Divider my='sm' />
          <UserRegions />
        </>
      ) : null}
    </>
  );
};
