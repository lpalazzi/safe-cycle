import React from 'react';
import {
  Avatar,
  Box,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { openModal } from '@mantine/modals';
import {
  IconChevronRight,
  IconDots,
  IconKey,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';

import { useGlobalContext } from 'contexts/globalContext';
import { AdminControlsModal } from 'components/modals/AdminControlsModal';
import { ManageAccountModal } from 'components/modals/ManageAccountModal';

export const SidebarFooter: React.FC = () => {
  const { loggedInUser, isMobileSize, logoutUser } = useGlobalContext();
  const theme = useMantineTheme();

  return !!loggedInUser ? (
    <Menu position={isMobileSize ? 'top-end' : 'right-end'} offset={24}>
      <Menu.Target>
        <UnstyledButton
          sx={{
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: theme.black,

            '&:hover': {
              backgroundColor: theme.colors.gray[0],
            },
          }}
        >
          <Group>
            <Avatar src={null} radius='xl'>
              {loggedInUser.getInitials()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Text size='sm' weight={500}>
                {loggedInUser.getFullName()}
              </Text>
              <Text size='xs' color='dimmed'>
                {loggedInUser.email}
              </Text>
            </Box>
            {isMobileSize ? (
              <IconDots size={18} />
            ) : (
              <IconChevronRight size={18} />
            )}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          icon={<IconSettings size={14} />}
          onClick={() => openModal(ManageAccountModal)}
        >
          Manage account
        </Menu.Item>
        {loggedInUser.role === 'admin' ? (
          <Menu.Item
            icon={<IconKey size={14} />}
            onClick={() => openModal(AdminControlsModal)}
          >
            Admin controls
          </Menu.Item>
        ) : null}
        <Menu.Item
          onClick={() => logoutUser()}
          color='red'
          icon={<IconLogout size={14} />}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : null;
};
