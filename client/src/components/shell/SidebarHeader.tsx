import React from 'react';
import { ActionIcon, Text, Group, Tooltip } from '@mantine/core';
import { IconChevronsLeft, IconMap2 } from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';
import LogoSvg from 'assets/brand/logo-name.svg';

export const SidebarHeader: React.FC = () => {
  const { isMobileSize, toggleNavbar } = useGlobalContext();
  return (
    <>
      <Group position='apart'>
        <img src={LogoSvg} style={{ maxHeight: '50px', maxWidth: '100%' }} />
        <Tooltip
          label={isMobileSize ? 'View map' : 'Collapse sidebar'}
          position='bottom'
        >
          <ActionIcon onClick={() => toggleNavbar()} size='lg'>
            {isMobileSize ? (
              <IconMap2 color='black' size={26} />
            ) : (
              <IconChevronsLeft color='black' size={26} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>
    </>
  );
};
