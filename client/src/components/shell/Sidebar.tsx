import React from 'react';
import { ActionIcon, Navbar } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarContent } from './SidebarContent';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { IconMenu2 } from '@tabler/icons';

export const Sidebar: React.FC = () => {
  const { isNavbarOpen, toggleNavbar } = useGlobalContext();
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
    <ActionIcon
      onClick={() => toggleNavbar()}
      size='xl'
      variant='default'
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
      }}
    >
      <IconMenu2 color='black' size={32} />
    </ActionIcon>
  );
};
