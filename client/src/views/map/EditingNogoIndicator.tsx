import React from 'react';
import { Paper, Group, Stack, Text, Button } from '@mantine/core';
import { IconEditOff } from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';

export const EditingNogoIndicator: React.FC = () => {
  const { isMobileSize, editingGroupOrRegion, setEditingGroupOrRegion } =
    useGlobalContext();
  return (
    <Paper
      shadow='xs'
      p='md'
      style={{
        position: 'fixed',
        top: 25,
        right: isMobileSize ? '50%' : 10,
        transform: isMobileSize ? 'translate(50%, 0)' : 'none',
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Stack spacing='xs'>
        <Text size='sm'>
          You are editing{' '}
          <Text span c='blue' inherit>
            {editingGroupOrRegion?.name}
          </Text>
          's nogos
        </Text>
        <Button
          fullWidth
          color='red'
          onClick={(e) => {
            e.stopPropagation();
            setEditingGroupOrRegion(null);
          }}
        >
          <Group position='center' spacing='xs' noWrap>
            <IconEditOff />
            <>Stop editing nogos</>
          </Group>
        </Button>
      </Stack>
    </Paper>
  );
};
