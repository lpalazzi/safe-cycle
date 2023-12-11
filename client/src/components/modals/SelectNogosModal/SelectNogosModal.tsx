import React, { useState } from 'react';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  Anchor,
  Badge,
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
  defaultValue: 'regions' | 'custom' = 'custom'
) =>
  ({
    children: <SelectNogosContent defaultValue={defaultValue} />,
    size: '800px',
    scrollAreaComponent: isMobileSize ? undefined : ScrollArea.Autosize,
    fullScreen: isMobileSize,
    withCloseButton: false,
    styles: isMobileSize
      ? {
          inner: {
            padding: '5dvh 0 0 !important',
          },
          content: {
            maxHeight:
              'calc(100dvh - 5dvh - env(safe-area-inset-top)) !important',
            borderTopLeftRadius: '0.5rem !important',
            borderTopRightRadius: '0.5rem !important',
          },
          body: {
            height: '100% !important',
            paddingBottom: '0 !important',
          },
        }
      : {},
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

  const clearSelected = () => {
    setUnsavedSelectedRegions([]);
    setUnsavedSelectedNogoGroups([]);
  };

  const applyAndClose = () => {
    setSelectedRegions(unsavedSelectedRegions);
    setSelectedNogoGroups(unsavedSelectedNogoGroups);
    modals.closeAll();
  };

  return (
    <Stack pos='relative' h='100%'>
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
              <Anchor onClick={() => setShowWhatAreNogos(false)} inherit>
                Hide
              </Anchor>
            )}
          </Text>
        </Collapse>
      </Stack>

      <Tabs
        defaultValue={defaultValue}
        variant='outline'
        styles={{
          tabLabel: { lineHeight: '1rem' },
          tabsList: { position: 'relative' },
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            value='custom'
            icon={<IconUserEdit size='0.8rem' />}
            rightSection={
              unsavedSelectedNogoGroups.length ? (
                <Badge
                  color='green'
                  w={16}
                  h={16}
                  sx={{ pointerEvents: 'none' }}
                  variant='filled'
                  size='xs'
                  p={0}
                >
                  {unsavedSelectedNogoGroups.length}
                </Badge>
              ) : undefined
            }
          >
            Your nogos
          </Tabs.Tab>
          <Tabs.Tab
            value='regions'
            icon={<IconWorld size='0.8rem' />}
            rightSection={
              unsavedSelectedRegions.length ? (
                <Badge
                  color='green'
                  w={16}
                  h={16}
                  sx={{ pointerEvents: 'none' }}
                  variant='filled'
                  size='xs'
                  p={0}
                >
                  {unsavedSelectedRegions.length}
                </Badge>
              ) : undefined
            }
          >
            Regions
          </Tabs.Tab>
          {[...unsavedSelectedNogoGroups, ...unsavedSelectedRegions].length >
            0 && (
            <Button
              variant='outline'
              compact
              onClick={clearSelected}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              Clear
            </Button>
          )}
        </Tabs.List>

        <Tabs.Panel value='custom' pt='xs'>
          <NogoGroups
            unsavedSelectedNogoGroups={unsavedSelectedNogoGroups}
            toggleNogoGroup={toggleNogoGroup}
          />
        </Tabs.Panel>
        <Tabs.Panel value='regions' pt='xs'>
          <Regions
            unsavedSelectedRegions={unsavedSelectedRegions}
            toggleRegion={toggleRegion}
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
          marginTop: 'auto',
          marginLeft: '-1rem',
          marginRight: '-1rem',
          paddingRight: '1rem',
          paddingLeft: '1rem',
          zIndex: 400,
        }}
      >
        <Group position='right' pb='env(safe-area-inset-bottom)'>
          <Button variant='outline' onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button onClick={applyAndClose}>Apply and close</Button>
        </Group>
      </Paper>
    </Stack>
  );
};
