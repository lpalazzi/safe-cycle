import React from 'react';
import { ActionIcon, Group, Tooltip, Image } from '@mantine/core';
import {
  IconChevronsLeft,
  IconInfoCircle,
  IconMap2,
} from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';
import LogoSvg from 'assets/brand/logo-name.svg';
import { openModal } from '@mantine/modals';
import { AboutModal } from 'components/modals/AboutModal';

export const SidebarHeader: React.FC = () => {
  const { isMobileSize, toggleNavbar } = useGlobalContext();
  return (
    <>
      <Group position='apart' noWrap>
        <Image
          src={LogoSvg}
          height={50}
          width='min(max-content, 100%)'
          fit='contain'
          alt='SafeCycle Logo'
          withPlaceholder
        />
        <Group position='right' noWrap spacing={0}>
          <Tooltip label='About' position='bottom'>
            <ActionIcon
              onClick={() => openModal(AboutModal('about', isMobileSize))}
              size='lg'
            >
              <IconInfoCircle color='black' size={26} />
            </ActionIcon>
          </Tooltip>
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
      </Group>
    </>
  );
};
