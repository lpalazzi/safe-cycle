import React from 'react';
import { Divider, Navbar, ScrollArea } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarContent } from './SidebarContent';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { MapControls } from './MapControls';

export const Sidebar: React.FC = () => {
  const { loggedInUser, isMobileSize, isNavbarOpen, isNavbarCondensed } =
    useGlobalContext();

  return (
    <>
      <Navbar
        p='md'
        hiddenBreakpoint='sm'
        hidden={!isMobileSize && !isNavbarOpen}
        width={{ sm: 400 }}
        height={isNavbarCondensed ? 'fit-content' : '100%'}
        style={isNavbarOpen ? {} : { display: 'none' }}
        bottom='unset'
        top={0}
      >
        <Navbar.Section>
          <SidebarHeader />
        </Navbar.Section>
        {!isMobileSize ? <Divider my='sm' /> : null}
        {isNavbarCondensed ? (
          <Navbar.Section>
            <SidebarContent />
          </Navbar.Section>
        ) : (
          <Navbar.Section
            grow
            component={ScrollArea}
            type='scroll'
            styles={{ scrollbar: { zIndex: 1 } }}
          >
            <SidebarContent />
          </Navbar.Section>
        )}
        {loggedInUser && !isNavbarCondensed ? (
          <>
            <Divider my='sm' />{' '}
            <Navbar.Section>
              <SidebarFooter />
            </Navbar.Section>
          </>
        ) : null}
      </Navbar>
      <MapControls />
    </>
  );
};
