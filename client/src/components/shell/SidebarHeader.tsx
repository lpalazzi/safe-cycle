import React from 'react';
import { ActionIcon, Box, Group, Text, Tooltip } from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons';
import { useGlobalContext } from 'contexts/globalContext';
// import { Logo } from 'components/brand/Logo';

export const SidebarHeader: React.FC = () => {
  const { toggleNavbar } = useGlobalContext();
  return (
    <Box
      sx={(theme) => ({
        paddingLeft: theme.spacing.xs,
        paddingRight: theme.spacing.xs,
        paddingBottom: theme.spacing.lg,
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
      })}
    >
      <Group position='apart'>
        {/* <Logo height='25px' /> */}
        <Text size={26}>SafeCycle</Text>
        <Tooltip label='Collapse sidebar' position='bottom'>
          <ActionIcon onClick={() => toggleNavbar()} size='lg'>
            <IconChevronsLeft color='black' size={26} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
};
