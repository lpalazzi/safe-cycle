import React from 'react';
import { ActionIcon, Text, Group, Tooltip } from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons';
import { useGlobalContext } from 'contexts/globalContext';
import LogoSvg from 'assets/brand/logo-name.svg';

export const SidebarHeader: React.FC = () => {
  const { toggleNavbar } = useGlobalContext();
  return (
    <>
      <Group position='apart'>
        <img src={LogoSvg} style={{ maxHeight: '50px', maxWidth: '100%' }} />
        <Tooltip label='Collapse sidebar' position='bottom'>
          <ActionIcon onClick={() => toggleNavbar()} size='lg'>
            <IconChevronsLeft color='black' size={26} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Text size='sm'>
        SafeCycle is a bicycle navigation application for cyclists looking to
        discover safer routes.
      </Text>
    </>
  );
};
