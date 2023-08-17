import React from 'react';
import { ActionIcon, Group, Tooltip, Image } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';
import LogoSvg from 'assets/brand/logo-name.svg';
import { openModal } from '@mantine/modals';
import { AboutModal } from 'components/modals/AboutModal';

export const SidebarHeader: React.FC = () => {
  const { isMobileSize } = useGlobalContext();
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
        <Tooltip label='About' position='bottom'>
          <ActionIcon
            onClick={() => openModal(AboutModal('about', isMobileSize))}
            size='lg'
          >
            <IconInfoCircle color='black' size={26} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </>
  );
};
