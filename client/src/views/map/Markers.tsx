import React, { ReactElement, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
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
  const map = useMap();
  const {
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

  return (
    <>
      {waypoints.map((waypoint, index) => {
        const draggable = draggableWaypointIndex === index;
        return (
          <Marker
            key={index + waypoint.lat + waypoint.lng}
            position={waypoint}
            draggable={draggable}
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
                updateWaypoint(newPosition, index);
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
      {currentLocation ? (
        <Marker
          key={
            currentLocation.latlng.lat +
            currentLocation.latlng.lng +
            currentLocation.heading +
            (isNavModeOn ? 1 : 0)
          }
          position={currentLocation.latlng}
          icon={
            isNavModeOn
              ? L.divIcon({
                  className: `nav-icon marker-nav`,
                  iconSize: [40, 40],
                })
              : createMarker(
                  <IconUser
                    color='black'
                    style={{ verticalAlign: 'middle' }}
                  />,
                  'orange'
                )
          }
        >
          {isNavModeOn ? null : (
            <Popup>
              {PopupButton('Add as waypoint', <IconPlus />, 'blue', () => {
                addWaypoint(currentLocation.latlng);
              })}
            </Popup>
          )}
        </Marker>
      ) : null}
    </>
  );
};
