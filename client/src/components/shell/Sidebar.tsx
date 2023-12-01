import React, { useState } from 'react';
import { Navbar, ScrollArea, Collapse } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarHeader } from './SidebarHeader';
import { MapControls } from './MapControls';
import { WaypointsList } from './content/WaypointsList';
import { RoutePreferences } from './content/RoutePreferences';
import { TurnInstructions } from './content/TurnInstructions';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar: React.FC = () => {
  const { isMobileSize, isNavbarOpen } = useGlobalContext();
  const [showTurnInstructions, setShowTurnInstructions] = useState(false);

  return (
    <>
      <Navbar
        px='md'
        py='xs'
        hiddenBreakpoint='sm'
        hidden={!isMobileSize && !isNavbarOpen}
        width={{ sm: 400 }}
        height={'fit-content'}
        bottom='unset'
        pos='relative'
        top={0}
        styles={
          isMobileSize
            ? { root: { borderRadius: '0 0 1rem 1rem' } }
            : { root: { borderRadius: '0 0 1rem 0' } }
        }
      >
        {isNavbarOpen && (
          <ScrollArea.Autosize mah='70dvh' type='scroll' mb='xs'>
            <Navbar.Section>
              <SidebarHeader />
            </Navbar.Section>
            <Navbar.Section>
              <>
                <WaypointsList />
                <RoutePreferences />
                <Collapse in={showTurnInstructions}>
                  <TurnInstructions show={showTurnInstructions} />
                </Collapse>
              </>
            </Navbar.Section>
          </ScrollArea.Autosize>
        )}
        <SidebarFooter setShowTurnInstructions={setShowTurnInstructions} />
      </Navbar>
      <MapControls />
    </>
  );
};
