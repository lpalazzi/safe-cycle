import React from 'react';
import { GeoJSON, Polyline, Popup } from 'react-leaflet';
import { Button, Group, useMantineTheme } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';

export const Nogos: React.FC = () => {
  const { editingGroupOrRegion } = useGlobalContext();
  const { map, nogoRoutes, lineToCursor, deleteNogo } = useMapContext();
  const theme = useMantineTheme();

  const nogoColor = theme.colors.red[7];
  const nogoWeight = 4;

  if (!map) return null;

  return (
    <>
      {nogoRoutes.map((nogo) => {
        return (
          <GeoJSON
            key={nogo._id + editingGroupOrRegion?._id}
            data={nogo.lineString}
            style={{
              color: nogoColor,
              weight: editingGroupOrRegion ? 4 : 2,
              opacity: editingGroupOrRegion ? 1.0 : 0.8,
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
    </>
  );
};
