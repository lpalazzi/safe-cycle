import React from 'react';
import { Navbar, ScrollArea } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarHeader } from './SidebarHeader';
import { MapControls } from './MapControls';
import { WaypointsList } from './content/WaypointsList';
import { RoutePreferences } from './content/RoutePreferences';

export const Sidebar: React.FC = () => {
  const { isMobileSize, isNavbarOpen } = useGlobalContext();

  return (
    <>
      <Navbar
        p='md'
        hiddenBreakpoint='sm'
        hidden={!isMobileSize && !isNavbarOpen}
        width={{ sm: 400 }}
        height={'fit-content'}
        style={isNavbarOpen ? {} : { display: 'none' }}
        bottom='unset'
        top={0}
        styles={{ root: { borderRadius: '0 0 0.5rem 0.5rem' } }}
      >
        <ScrollArea.Autosize mah='80dvh' type='scroll'>
          <Navbar.Section>
            <SidebarHeader />
          </Navbar.Section>
          <Navbar.Section>
            <>
              <WaypointsList />
              <RoutePreferences />
            </>
          </Navbar.Section>
        </ScrollArea.Autosize>
      </Navbar>
      <MapControls />
    </>
  );
};
