import React, { useState } from 'react';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  ActionIcon,
  Button,
  Collapse,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { ID } from 'types';
import { modals } from '@mantine/modals';
import { Regions } from './Regions';
import { NogoGroups } from './NogoGroups';
import { useDisclosure } from '@mantine/hooks';
import { IconHelp } from '@tabler/icons-react';

export const SelectNogosModal = (isMobileSize: boolean) =>
  ({
    children: <SelectNogosContent />,
    size: '800px',
    fullScreen: isMobileSize,
    scrollAreaComponent: ScrollArea.Autosize,
    withCloseButton: false,
  } as ModalSettings);

const SelectNogosContent: React.FC = () => {
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
  const [showWhatAreNogos, { toggle: toggleShowWhatAreNogos }] =
    useDisclosure();

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
    <Stack>
      <Flex
        direction={isMobileSize ? 'column' : 'row'}
        justify='space-between'
        align='center'
        gap='xs'
      >
        <Group position='left' spacing='xs'>
          <Text size='xl' fw={600}>
            Select nogos to avoid
          </Text>
          <Tooltip label='What are nogos?' position='bottom'>
            <ActionIcon
              onClick={toggleShowWhatAreNogos}
              size='md'
              variant='transparent'
              color='dark'
              radius='xl'
            >
              <IconHelp size='1.625rem' />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group>
          <Button variant='outline' onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button onClick={applyAndClose}>Apply and close</Button>
        </Group>
      </Flex>
      <Collapse in={showWhatAreNogos}>
        <Text mb='sm'>
          A nogo is a section of a roadway that SafeCycle completely avoids when
          creating a route. Nogos are useful for avoiding unsafe conditions or
          high levels of motor vehicle traffic.
        </Text>
        <Text>
          You can <b>add your own nogos</b> to avoid on your routes, or you can{' '}
          <b>select pre-defined nogos</b> in one of our supported regions. Each
          region contains nogos that are maintained by verified contributors
          that have extensive knowledge of local roads and cycling routes in
          that region, based on roads that most cyclists should avoid.
        </Text>
      </Collapse>
      <Regions
        unsavedSelectedRegions={unsavedSelectedRegions}
        toggleRegion={toggleRegion}
        clearSelectedRegions={clearSelectedRegions}
      />
      <NogoGroups
        unsavedSelectedNogoGroups={unsavedSelectedNogoGroups}
        toggleNogoGroup={toggleNogoGroup}
        clearSelectedNogoGroups={clearSelectedNogoGroups}
      />
    </Stack>
  );
};
