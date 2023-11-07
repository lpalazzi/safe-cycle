import React from 'react';
import { Divider } from '@mantine/core';

import { RoutePreferences } from './content/RoutePreferences';
import { WaypointsList } from './content/WaypointsList';
import { useGlobalContext } from 'contexts/globalContext';

export const SidebarContent: React.FC = () => {
  const { isMobileSize } = useGlobalContext();

  return (
    <>
      <WaypointsList />
      {!isMobileSize ? <Divider my='sm' /> : null}
      <RoutePreferences />
    </>
  );
};
