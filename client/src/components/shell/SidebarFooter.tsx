import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Group,
  Menu,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { openModal } from '@mantine/modals';
import { useGlobalContext } from 'contexts/globalContext';
import { LoginModal } from 'components/modals/LoginModal';
import { SignupModal } from 'components/modals/SignupModal';
import {
  IconChevronRight,
  IconDots,
  IconLogout,
  IconSettings,
} from '@tabler/icons-react';

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
        <Menu.Item icon={<IconSettings size={14} />} disabled>
          Manage account
        </Menu.Item>
        <Menu.Item
          onClick={() => logoutUser()}
          color='red'
          icon={<IconLogout size={14} />}
        >
          Sign out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  ) : (
    <Group position='center' grow>
      <Button onClick={() => openModal(LoginModal)}>Sign in</Button>
      <Button onClick={() => openModal(SignupModal)}>Create account</Button>
    </Group>
  );
};
