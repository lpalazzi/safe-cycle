import React from 'react';
import { Group, Title, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';

export const SidebarTitle: React.FC<{
  title: string;
  tooltipLabel?: string;
}> = ({ title, tooltipLabel }) => {
  return (
    <Group spacing='xs' align='center'>
      <Title order={4} weight='normal'>
        {title}
      </Title>
      {tooltipLabel ? (
        <Tooltip
          multiline
          width={300}
          withArrow
          transition='fade'
          transitionDuration={200}
          events={{ hover: true, focus: false, touch: true }}
          label={tooltipLabel}
        >
          <div style={{ height: '18px' }}>
            <IconInfoCircle size={18} />
          </div>
        </Tooltip>
      ) : null}
    </Group>
  );
};
