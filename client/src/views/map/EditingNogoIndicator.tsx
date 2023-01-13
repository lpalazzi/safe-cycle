import React from 'react';
import { Paper, Group, Stack, Text, Button } from '@mantine/core';
import { IconEditOff } from '@tabler/icons';
import { useGlobalContext } from 'contexts/globalContext';

export const EditingNogoIndicator: React.FC = () => {
  const { isMobileSize, editingNogoGroup, setEditingNogoGroup } =
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
        zIndex: 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Stack spacing='xs'>
        <Text size='sm'>
          You are editing{' '}
          <Text span c='blue' inherit>
            {editingNogoGroup?.name}
          </Text>
          's Nogos
        </Text>
        <Button
          fullWidth
          color='red'
          onClick={(e) => {
            e.stopPropagation();
            setEditingNogoGroup(null);
          }}
        >
          <Group position='center' spacing='xs' noWrap>
            <IconEditOff />
            <>Stop editing Nogos</>
          </Group>
        </Button>
      </Stack>
    </Paper>
  );
};
