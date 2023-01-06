import React from 'react';
import { ActionIcon, Box, Group, Tooltip } from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons';
import { useGlobalContext } from 'contexts/globalContext';
import LogoSvg from 'assets/brand/logo-name.svg';

export const SidebarHeader: React.FC = () => {
  const { toggleNavbar } = useGlobalContext();
  return (
    <Box
      sx={(theme) => ({
        paddingLeft: theme.spacing.xs,
        paddingRight: theme.spacing.xs,
        paddingBottom: theme.spacing.md,
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
      })}
    >
      <Group position='apart'>
        <img src={LogoSvg} style={{ maxHeight: '50px', maxWidth: '100%' }} />
        <Tooltip label='Collapse sidebar' position='bottom'>
          <ActionIcon onClick={() => toggleNavbar()} size='lg'>
            <IconChevronsLeft color='black' size={26} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
};
