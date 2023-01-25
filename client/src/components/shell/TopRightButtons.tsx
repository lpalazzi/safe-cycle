import React from 'react';
import { ActionIcon, Stack } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import {
  IconMenu2,
  IconNavigation,
  IconNavigationFilled,
} from '@tabler/icons-react';

export const TopRightButtons: React.FC = () => {
  const {
    isMobileSize,
    isNavbarOpen,
    isNavModeOn,
    toggleNavbar,
    toggleNavMode,
  } = useGlobalContext();
  return (
    <Stack
      justify='flex-start'
      spacing='sm'
      style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
    >
      {isMobileSize ? (
        <>
          {isNavbarOpen ? null : (
            <ActionIcon
              onClick={() => toggleNavbar()}
              size='xl'
              variant='default'
            >
              <IconMenu2 color='black' size={32} />
            </ActionIcon>
          )}
          <ActionIcon
            onClick={() => toggleNavMode()}
            size='xl'
            variant='default'
          >
            {isNavModeOn ? (
              <IconNavigationFilled color='black' size={32} />
            ) : (
              <IconNavigation color='black' size={32} />
            )}
          </ActionIcon>
        </>
      ) : null}
    </Stack>
  );
};
