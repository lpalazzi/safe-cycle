import React, { useState } from 'react';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  Anchor,
  Button,
  Center,
  CloseButton,
  Collapse,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { ID } from 'types';
import { modals } from '@mantine/modals';
import { Regions } from './Regions';
import { NogoGroups } from './NogoGroups';
import { IconUserEdit, IconWorld } from '@tabler/icons-react';

export const SelectNogosModal = (
  isMobileSize: boolean,
  defaultValue: 'regions' | 'custom' = 'regions'
) =>
  ({
    children: <SelectNogosContent defaultValue={defaultValue} />,
    size: '800px',
    fullScreen: isMobileSize,
    scrollAreaComponent: isMobileSize ? undefined : ScrollArea.Autosize,
    withCloseButton: false,
  } as ModalSettings);

const SelectNogosContent: React.FC<{ defaultValue: 'regions' | 'custom' }> = ({
  defaultValue,
}) => {
  const {
    isMobileSize,
    selectedRegions,
    selectedNogoGroups,
    setSelectedRegions,
    setSelectedNogoGroups,
  } = useGlobalContext();
  const [unsavedSelectedRegions, setUnsavedSelectedRegions] =
    useState(selectedRegions);
  const [unsavedSelectedNogoGroups, setUnsavedSelectedNogoGroups] =
    useState(selectedNogoGroups);
  const [showWhatAreNogos, setShowWhatAreNogos] = useState(false);

  const toggleRegion = (id: ID) => {
    if (unsavedSelectedRegions.includes(id)) {
      setUnsavedSelectedRegions(
        [...unsavedSelectedRegions].filter(
          (unsavedSelectedRegionId) => unsavedSelectedRegionId !== id
        )
      );
    } else {
      setUnsavedSelectedRegions([...unsavedSelectedRegions, id]);
    }
  };

  const toggleNogoGroup = (id: ID) => {
    if (unsavedSelectedNogoGroups.includes(id)) {
      setUnsavedSelectedNogoGroups(
        [...unsavedSelectedNogoGroups].filter(
          (unsavedSelectedNogoGroupId) => unsavedSelectedNogoGroupId !== id
        )
      );
    } else {
      setUnsavedSelectedNogoGroups([...unsavedSelectedNogoGroups, id]);
    }
  };

  const clearSelectedRegions = () => {
    setUnsavedSelectedRegions([]);
  };

  const clearSelectedNogoGroups = () => {
    setUnsavedSelectedNogoGroups([]);
  };

  const applyAndClose = () => {
    setSelectedRegions(unsavedSelectedRegions);
    setSelectedNogoGroups(unsavedSelectedNogoGroups);
    modals.closeAll();
  };

  return (
    <Stack pos='relative'>
      <Center
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        <CloseButton size='md' onClick={() => modals.closeAll()} />
      </Center>
      <Stack spacing='xs' align='center'>
        <Group position='center' align='center'>
          <Text size='xl' fw={600} align='center'>
            Select nogos to avoid
          </Text>
          {!isMobileSize && (
            <Anchor onClick={() => setShowWhatAreNogos((prev) => !prev)}>
              🤔 What is a nogo?
            </Anchor>
          )}
        </Group>
        {isMobileSize && (
          <Anchor
            onClick={() => setShowWhatAreNogos(true)}
            size='sm'
            display={showWhatAreNogos ? 'none' : undefined}
          >
            🤔 What is a nogo?
          </Anchor>
        )}
        <Collapse in={showWhatAreNogos} transitionDuration={0}>
          <Text size='sm' c='dimmed'>
            A nogo is a section of a roadway that SafeCycle completely avoids
            when creating a route. Nogos are useful for avoiding unsafe
            conditions or high levels of motor vehicle traffic.{' '}
            {isMobileSize && (
              <Anchor onClick={() => setShowWhatAreNogos(false)} inherit span>
                Hide
              </Anchor>
            )}
          </Text>
        </Collapse>
      </Stack>
      <Tabs defaultValue={defaultValue} variant='outline'>
        <Tabs.List>
          <Tabs.Tab value='regions' icon={<IconWorld size='0.8rem' />}>
            Regions
          </Tabs.Tab>
          <Tabs.Tab value='custom' icon={<IconUserEdit size='0.8rem' />}>
            Custom nogos
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='regions' pt='xs'>
          <Regions
            unsavedSelectedRegions={unsavedSelectedRegions}
            toggleRegion={toggleRegion}
          />
        </Tabs.Panel>
        <Tabs.Panel value='custom' pt='xs'>
          <NogoGroups
            unsavedSelectedNogoGroups={unsavedSelectedNogoGroups}
            toggleNogoGroup={toggleNogoGroup}
            clearSelectedNogoGroups={clearSelectedNogoGroups}
          />
        </Tabs.Panel>
      </Tabs>
      <Paper
        p='sm'
        pos='sticky'
        radius={0}
        bottom={0}
        left={0}
        right={0}
        bg='white'
        style={{
          zIndex: 1000,
        }}
      >
        <Group position='right'>
          <Button variant='outline' onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button onClick={applyAndClose}>Apply and close</Button>
        </Group>
      </Paper>
    </Stack>
  );
};
