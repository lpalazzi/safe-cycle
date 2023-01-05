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
import { IconChevronRight, IconLogout, IconSettings } from '@tabler/icons';

export const SidebarFooter: React.FC = () => {
  const { loggedInUser, logoutUser } = useGlobalContext();
  const theme = useMantineTheme();
  return (
    <Box
      sx={{
        paddingTop: theme.spacing.sm,
        borderTop: `1px solid ${theme.colors.gray[2]}`,
      }}
    >
      {!!loggedInUser ? (
        <Menu position='right-end' offset={24}>
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
                <Avatar src={null} radius='xl' />
                <Box sx={{ flex: 1 }}>
                  <Text size='sm' weight={500}>
                    {loggedInUser.getFullName() ?? 'Sign in'}
                  </Text>
                  <Text size='xs' color='dimmed'>
                    {loggedInUser.email}
                  </Text>
                </Box>
                <IconChevronRight size={18} />
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
      )}
    </Box>
  );
};
