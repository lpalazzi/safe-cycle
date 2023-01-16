import React from 'react';
import { ActionIcon, Button, Divider, Navbar, ScrollArea } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarContent } from './SidebarContent';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { IconMap2, IconMenu2 } from '@tabler/icons';

export const Sidebar: React.FC = () => {
  const { isMobileSize, isNavbarOpen, toggleNavbar } = useGlobalContext();
  return isNavbarOpen ? (
    <Navbar
      p='md'
      hiddenBreakpoint='sm'
      hidden={!isNavbarOpen}
      width={{ sm: 400 }}
      height={'100%'}
    >
      <Navbar.Section>
        <SidebarHeader />
      </Navbar.Section>
      <Divider my='sm' />
      <Navbar.Section grow component={ScrollArea}>
        <SidebarContent />
      </Navbar.Section>
      {isMobileSize ? (
        <Button
          fullWidth
          size='lg'
          leftIcon={<IconMap2 size={18} />}
          onClick={toggleNavbar}
          mt='sm'
        >
          View map
        </Button>
      ) : null}
      <Divider my='sm' />
      <Navbar.Section>
        <SidebarFooter />
      </Navbar.Section>
    </Navbar>
  ) : (
    <ActionIcon
      onClick={() => toggleNavbar()}
      size='xl'
      variant='default'
      style={
        isMobileSize
          ? {
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 10,
            }
          : {
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 10,
            }
      }
    >
      <IconMenu2 color='black' size={32} />
    </ActionIcon>
  );
};
