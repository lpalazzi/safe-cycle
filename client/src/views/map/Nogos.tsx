import React from 'react';
import L from 'leaflet';
import { GeoJSON, Marker, Polyline, Popup } from 'react-leaflet';
import { Button, Group, useMantineTheme } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';
import { isTouchDevice } from 'utils/device';

export const Nogos: React.FC = () => {
  const { editingGroupOrRegion } = useGlobalContext();
  const {
    map,
    zoomLevel,
    nogoRoutes,
    nogoWaypoints,
    lineToCursor,
    deleteNogo,
  } = useMapContext();
  const theme = useMantineTheme();

  const zoomedOut = (zoomLevel || 0) < 13;
  const nogoColor = theme.colors.red[7];
  const nogoWeight = 4;

  if (!map) return null;

  return (
    <>
      {!zoomedOut &&
        nogoRoutes.map((nogo) => {
          return (
            <GeoJSON
              key={nogo._id + editingGroupOrRegion?._id}
              data={nogo.lineString}
              style={{
                color: nogoColor,
                weight: editingGroupOrRegion ? 4 : 3,
                opacity: editingGroupOrRegion ? 1.0 : 0.5,
                interactive: editingGroupOrRegion ? true : false,
              }}
            >
              {editingGroupOrRegion ? (
                <Popup>
                  <Button
                    fullWidth
                    color='red'
                    onClick={(e) => {
                      e.stopPropagation();
                      map.closePopup();
                      deleteNogo(nogo._id);
                    }}
                  >
                    <Group position='center' spacing='xs' noWrap>
                      <IconTrash />
                      <>Delete nogo</>
                    </Group>
                  </Button>
                </Popup>
              ) : null}
            </GeoJSON>
          );
        })}
      {lineToCursor ? (
        <Polyline
          className='cursor-polyline'
          interactive={false}
          key={lineToCursor[1].lat}
          positions={lineToCursor}
          color={nogoColor}
          weight={nogoWeight}
        />
      ) : null}
      {isTouchDevice() &&
        !!editingGroupOrRegion &&
        nogoWaypoints.length === 1 && (
          <Marker
            key={
              nogoWaypoints[0].lat +
              nogoWaypoints[0].lng +
              editingGroupOrRegion?._id
            }
            position={nogoWaypoints[0]}
            draggable={false}
            opacity={0.8}
            icon={L.divIcon({
              className: 'marker-nogoWaypoint',
              shadowSize: [0, 0],
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              shadowAnchor: [0, 0],
              popupAnchor: [0, -10],
              html: '',
            })}
          ></Marker>
        )}
    </>
  );
};
