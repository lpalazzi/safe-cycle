import React from 'react';
import { ActionIcon, Button, Flex, Tooltip } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import {
  IconArrowsMaximize,
  IconCurrentLocation,
  IconLayoutNavbarExpand,
  IconLayoutSidebarLeftExpand,
  IconMinus,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useMapContext } from 'contexts/mapContext';

export const MapControls: React.FC = () => {
  const { isMobileSize, isNavbarOpen, isNavModeOn, toggleNavbar } =
    useGlobalContext();
  const { map, clearWaypoints } = useMapContext();

  const zoomButtons = (
    <Button.Group orientation='vertical'>
      <ActionIcon
        onClick={() => map?.zoomIn()}
        variant='default'
        size='lg'
        style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      >
        <IconPlus size='1.25rem' />
      </ActionIcon>
      <ActionIcon
        onClick={() => map?.zoomOut()}
        variant='default'
        size='lg'
        style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        <IconMinus size='1.25rem' />
      </ActionIcon>
    </Button.Group>
  );

  const locationButton = (
    <Tooltip label='Current location' position='left'>
      <ActionIcon
        onClick={() => {
          if (map) {
            map.once('locationfound', (e) => {
              const { latlng } = e;
              map.flyTo(latlng, isNavModeOn ? 19 : 14);
            });
            map.locate({ watch: true, enableHighAccuracy: true });
          }
        }}
        variant='default'
        size='lg'
      >
        <IconCurrentLocation size='1.25rem' />
      </ActionIcon>
    </Tooltip>
  );

  const clearButton = (
    <Tooltip label='Clear markers' position='left'>
      <ActionIcon onClick={clearWaypoints} variant='default' size='lg'>
        <IconTrash size='1.25rem' />
      </ActionIcon>
    </Tooltip>
  );

  const toggleNavbarButton = (
    <Tooltip label='Fullscreen map' position='left'>
      <ActionIcon onClick={toggleNavbar} variant='default' size='lg'>
        {isNavbarOpen ? (
          <IconArrowsMaximize size='1.25rem' />
        ) : isMobileSize ? (
          <IconLayoutNavbarExpand size='1.25rem' />
        ) : (
          <IconLayoutSidebarLeftExpand size='1.25rem' />
        )}
      </ActionIcon>
    </Tooltip>
  );

  const mobileButtons = [clearButton, locationButton, toggleNavbarButton];
  const desktopButtons = [
    toggleNavbarButton,
    clearButton,
    locationButton,
    zoomButtons,
  ];

  return (
    <Flex
      direction={isMobileSize ? 'row' : 'column'}
      justify='flex-end'
      align='flex-end'
      gap={8}
      style={{
        position: 'absolute',
        bottom: 24.8,
        right: 8,
        zIndex: 1,
      }}
    >
      {isMobileSize ? mobileButtons : desktopButtons}
    </Flex>
  );
};
