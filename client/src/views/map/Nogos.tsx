import { Button, Group, useMantineTheme } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { useGlobalContext } from 'contexts/globalContext';
import React from 'react';
import { GeoJSON, Polyline, Popup, useMap } from 'react-leaflet';
import { useMapContext } from '../../contexts/mapContext';

export const Nogos: React.FC = () => {
  const { editingNogoGroup } = useGlobalContext();
  const { nogoRoutes, lineToCursor, deleteNogo } = useMapContext();
  const theme = useMantineTheme();
  const map = useMap();

  const nogoColor = theme.colors.red[7];
  const nogoWeight = 4;

  return (
    <>
      {nogoRoutes.map((nogo) => {
        return (
          <GeoJSON
            key={nogo._id + editingNogoGroup}
            data={nogo.lineString}
            style={{
              color: nogoColor,
              weight: editingNogoGroup ? 4 : 2,
              opacity: editingNogoGroup ? 1.0 : 0.8,
            }}
          >
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
                  <>Delete Nogo</>
                </Group>
              </Button>
            </Popup>
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
