import React from 'react';
import { ActionIcon, Group, Image, Button, Menu } from '@mantine/core';
import {
  IconInfoCircle,
  IconKey,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';
import LogoSvg from 'assets/brand/logo-name.svg';
import { openModal } from '@mantine/modals';
import { AboutModal } from 'components/modals/AboutModal';
import { LoginModal } from 'components/modals/LoginModal';
import { ManageAccountModal } from 'components/modals/ManageAccountModal';
import { AdminControlsModal } from 'components/modals/AdminControlsModal';

export const SidebarHeader: React.FC = () => {
  const { loggedInUser, isMobileSize, logoutUser } = useGlobalContext();
  return (
    <Group position='apart' noWrap w='100%'>
      <Image
        src={LogoSvg}
        height={isMobileSize ? 44 : 48}
        width='min(max-content, 100%)'
        fit='contain'
        alt='SafeCycle Logo'
        withPlaceholder
        style={{ flexGrow: 1 }}
        styles={{ image: { width: 'unset' } }}
      />
      <Group position='right' spacing='0.125rem'>
        <ActionIcon
          onClick={() => openModal(AboutModal(isMobileSize))}
          size='lg'
          variant='transparent'
        >
          <IconInfoCircle size='1.625rem' />
        </ActionIcon>
        {loggedInUser ? (
          <Menu withinPortal trigger='click' position='bottom-end'>
            <Menu.Target>
              <ActionIcon size='lg' variant='transparent'>
                <IconUserCircle size='1.625rem' />
              </ActionIcon>
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
        ) : (
          <Button
            size='xs'
            radius='md'
            styles={{
              root: {
                padding: '0px 0.575rem',
                height: '1.575rem',
              },
            }}
            onClick={() => openModal(LoginModal())}
          >
            Sign in
          </Button>
        )}
      </Group>
    </Group>
  );
};
