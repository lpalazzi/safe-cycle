import React, { ReactElement, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapContext } from '../../contexts/mapContext';
import { useGlobalContext } from 'contexts/globalContext';
import {
  IconArrowsMove,
  IconPlus,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { createMarker } from 'utils/map';
import { Button, Flex, Group, MantineColor } from '@mantine/core';

export const Markers: React.FC = () => {
  const {
    map,
    waypoints,
    currentLocation,
    addWaypoint,
    updateWaypoint,
    removeWaypoint,
  } = useMapContext();
  const { isNavModeOn } = useGlobalContext();

  const [draggableWaypointIndex, setDraggableWaypointIndex] = useState<
    number | null
  >(null);

  if (!map) return null;

  map.on('click', (e) => {
    setDraggableWaypointIndex(null);
  });

  const PopupButton = (
    text: string,
    icon: ReactElement,
    color?: MantineColor,
    onClick?: () => void
  ) => {
    return (
      <Button
        fullWidth
        color={color}
        onClick={(e) => {
          e.stopPropagation();
          map.closePopup();
          onClick?.();
        }}
      >
        <Group position='center' spacing='xs' noWrap>
          <>{icon}</>
          <>{text}</>
        </Group>
      </Button>
    );
  };

  const waypointOnCurrentLocation = !!waypoints.find((waypoint) => {
    if (!currentLocation) return false;
    return waypoint.latlng.distanceTo(currentLocation.latlng) < 10;
  });

  return (
    <>
      {waypoints.map((waypoint, index) => {
        const draggable = draggableWaypointIndex === index;
        return (
          <Marker
            key={index + waypoint.latlng.lat + waypoint.latlng.lng}
            position={waypoint.latlng}
            draggable={draggable}
            opacity={0.8}
            icon={createMarker(
              draggable ? (
                <IconArrowsMove
                  color='white'
                  style={{ verticalAlign: 'middle' }}
                />
              ) : (
                <>{(index + 1).toString()}</>
              ),
              'blue'
            )}
            eventHandlers={{
              dragend: (e) => {
                const newPosition: L.LatLng = e.target.getLatLng();
                updateWaypoint(index, newPosition);
              },
            }}
          >
            <Popup>
              <Flex
                gap='xs'
                justify='flex-start'
                align='center'
                direction='column'
              >
                {PopupButton(
                  draggable ? 'Stop dragging' : 'Drag waypoint',
                  <IconArrowsMove />,
                  'blue',
                  () => {
                    setDraggableWaypointIndex(draggable ? null : index);
                  }
                )}
                {PopupButton('Remove waypoint', <IconTrash />, 'red', () => {
                  setDraggableWaypointIndex(null);
                  removeWaypoint(index);
                })}
              </Flex>
            </Popup>
          </Marker>
        );
      })}
      {currentLocation && !isNavModeOn && !waypointOnCurrentLocation ? (
        <Marker
          key={currentLocation.latlng.lat + currentLocation.latlng.lng}
          position={currentLocation.latlng}
          opacity={0.8}
          icon={createMarker(
            <IconUser color='black' style={{ verticalAlign: 'middle' }} />,
            'orange'
          )}
        >
          <Popup>
            {PopupButton('Add as waypoint', <IconPlus />, 'blue', () => {
              addWaypoint(currentLocation.latlng, 'Current location');
            })}
          </Popup>
        </Marker>
      ) : null}
    </>
  );
};
