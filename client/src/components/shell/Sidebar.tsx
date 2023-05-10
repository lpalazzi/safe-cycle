import React from 'react';
import { ActionIcon, Button, Divider, Navbar, ScrollArea } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarContent } from './SidebarContent';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { IconMap2, IconMenu2 } from '@tabler/icons-react';
import { TopRightButtons } from './TopRightButtons';

export const Sidebar: React.FC = () => {
  const { isMobileSize, isNavbarOpen, toggleNavbar } = useGlobalContext();
  return (
    <>
      <Navbar
        p='md'
        hiddenBreakpoint='sm'
        hidden={!isNavbarOpen}
        width={{ sm: 400 }}
        height={'100%'}
        style={isNavbarOpen ? {} : { display: 'none' }}
      >
        <Navbar.Section>
          <SidebarHeader />
        </Navbar.Section>
        <Divider my='sm' />
        <Navbar.Section
          grow
          component={ScrollArea}
          type='scroll'
          styles={{ scrollbar: { zIndex: 1 } }}
        >
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
      {isNavbarOpen || isMobileSize ? null : (
        <ActionIcon
          onClick={() => toggleNavbar()}
          size='xl'
          variant='default'
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 1,
          }}
        >
          <IconMenu2 color='black' size={32} />
        </ActionIcon>
      )}
      <TopRightButtons />
    </>
  );
};
