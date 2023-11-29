import React from 'react';
import { ActionIcon, Group, Tooltip, Image } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';
import LogoSvg from 'assets/brand/logo-name.svg';
import { openModal } from '@mantine/modals';
import { AboutModal } from 'components/modals/AboutModal';

// TODO: either hide the sidebar header on mobile or make it smaller
export const SidebarHeader: React.FC = () => {
  const { isMobileSize } = useGlobalContext();
  return (
    <Group position='apart' noWrap w='100%'>
      <Image
        src={LogoSvg}
        height={50}
        width='min(max-content, 100%)'
        fit='contain'
        alt='SafeCycle Logo'
        withPlaceholder
        style={{ flexGrow: 1 }}
        styles={{ image: { width: 'unset' } }}
      />
      <Tooltip label='About' position='bottom'>
        <ActionIcon
          onClick={() => openModal(AboutModal(isMobileSize))}
          size='lg'
          c='dimmed'
        >
          <IconInfoCircle size={26} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};
