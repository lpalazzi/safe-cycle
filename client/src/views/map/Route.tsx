import React from 'react';
import L from 'leaflet';
import { GeoJSON, Tooltip } from 'react-leaflet';
import { useMapContext } from '../../contexts/mapContext';
import { useMantineTheme, Text, Stack } from '@mantine/core';
import { metresToDistanceString, secondsToTimeString } from 'utils/formatting';

export const Route: React.FC = () => {
  const { routes, selectedRouteIndex, selectRouteAlternative } =
    useMapContext();
  const theme = useMantineTheme();

  return routes ? (
    <>
      {selectedRouteIndex || selectedRouteIndex === 0 ? (
        <GeoJSON
          key={routes[selectedRouteIndex].properties.times.reduce(
            (acc, a) => acc + a,
            0
          )}
          data={routes[selectedRouteIndex].lineString}
          style={{
            color: theme.colors.blue[9],
            weight: 5,
            opacity: 1.0,
          }}
        />
      ) : (
        routes
          .map((route, index) => {
            const isDefaultRoute = index === 0;
            const distanceStr = metresToDistanceString(
              Number(route.properties['track-length']) ?? 0
            );
            const timeStr = secondsToTimeString(
              Number(route.properties['total-time']) ?? 0
            );
            return (
              <GeoJSON
                key={
                  index + route.properties.times.reduce((acc, a) => acc + a, 0)
                }
                data={route.lineString}
                style={{
                  color: isDefaultRoute
                    ? theme.colors.blue[9]
                    : theme.colors.gray[6],
                  weight: 5,
                  opacity: 1.0,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    selectRouteAlternative(index);
                  },
                  mouseover: (e) => {
                    // if (!isDefaultRoute)
                    //   e.sourceTarget.getTooltip().setLatLng(e.latlng);
                    e.sourceTarget.bringToFront();
                    e.sourceTarget.setStyle({
                      color: isDefaultRoute
                        ? theme.colors.blue[9]
                        : theme.colors.gray[7],
                      weight: 7,
                      opacity: 1.0,
                    });
                  },
                  mouseout: (e) => {
                    if (!isDefaultRoute) e.sourceTarget.bringToBack();
                    e.sourceTarget.setStyle({
                      color: isDefaultRoute
                        ? theme.colors.blue[9]
                        : theme.colors.gray[6],
                      weight: 5,
                      opacity: 1.0,
                    });
                  },
                }}
              >
                {isDefaultRoute ? null : (
                  <Tooltip>
                    <Stack align='center' spacing='xs'>
                      {distanceStr ? (
                        <Property label='Distance' value={distanceStr} />
                      ) : null}
                      {timeStr ? (
                        <Property label='Travel time' value={timeStr} />
                      ) : null}
                    </Stack>
                  </Tooltip>
                )}
              </GeoJSON>
            );
          })
          .reverse()
      )}
    </>
  ) : null;
};

const Property: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <Text fw={700} size='xs'>
      {label}:{' '}
      <Text span c='blue' inherit>
        {value}
      </Text>
    </Text>
  );
};
