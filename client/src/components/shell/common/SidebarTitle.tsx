import React from 'react';
import { Group, Title, Tooltip } from '@mantine/core';
import { ModalSettings } from '@mantine/modals/lib/context';
import { useModals } from '@mantine/modals';
import { IconInfoCircle } from '@tabler/icons-react';

export const SidebarTitle: React.FC<{
  title: string;
  infoModal?: ModalSettings;
}> = ({ title, infoModal }) => {
  const { openModal } = useModals();
  return (
    <Group spacing='xs' align='center'>
      <Title order={4} weight='normal'>
        {title}
      </Title>
      {infoModal ? (
        <Tooltip
          withArrow
          transition='fade'
          transitionDuration={200}
          label='Learn more'
        >
          <div style={{ height: '18px', cursor: 'pointer' }}>
            <IconInfoCircle size={18} onClick={() => openModal(infoModal)} />
          </div>
        </Tooltip>
      ) : null}
    </Group>
  );
};
