import React from 'react';
import { Navbar } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarContent } from './SidebarContent';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';

export const Sidebar: React.FC = () => {
  const { isNavbarOpen } = useGlobalContext();
  return isNavbarOpen ? (
    <Navbar
      p='md'
      translate='yes'
      hiddenBreakpoint='sm'
      hidden={!isNavbarOpen}
      width={{ sm: 400 }}
    >
      <Navbar.Section>
        <SidebarHeader />
      </Navbar.Section>
      <Navbar.Section grow mt='md'>
        <SidebarContent />
      </Navbar.Section>
      <Navbar.Section>
        <SidebarFooter />
      </Navbar.Section>
    </Navbar>
  ) : (
    <></>
  );
};
