import React, { useState } from 'react';
import L from 'leaflet';
import 'leaflet-touch-helper';
import { GeoJSON, Tooltip } from 'react-leaflet';
import { useMapContext } from '../../contexts/mapContext';
import { useMantineTheme, Text, Stack } from '@mantine/core';
import { metresToDistanceString, secondsToTimeString } from 'utils/formatting';

export const Route: React.FC = () => {
  const { map, routes, selectedRouteIndex, selectRouteAlternative } =
    useMapContext();
  const theme = useMantineTheme();
  const [hoveredRouteIndex, setHoveredRouteIndex] = useState<number | null>(
    null
  );

  let shortestDistance: number;
  const shortestRouteIndex =
    routes?.reduce((acc, route, idx) => {
      const routeDistance = Number(route.properties['track-length']);
      if (!shortestDistance || routeDistance < shortestDistance) {
        shortestDistance = routeDistance;
        return idx;
      }
      return acc;
    }, 0) ?? 0;

  return routes ? (
    <>
      {selectedRouteIndex || selectedRouteIndex === 0 ? (
        <GeoJSON
          key={
            999 +
            routes.length +
            routes[selectedRouteIndex].properties.times.reduce(
              (acc, a) => acc + a,
              0
            )
          }
          data={routes[selectedRouteIndex].lineString}
          style={{
            color: theme.colors.blue[9],
            weight: 8,
            opacity: 0.5,
          }}
        />
      ) : (
        [...routes]
          .map((route, index) => {
            const isHovered = hoveredRouteIndex === index;
            const isShortestRoute = shortestRouteIndex === index;
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
                  routes.length +
                  index +
                  route.properties.times.reduce((acc, a) => acc + a, 0)
                }
                data={route.lineString}
                style={{
                  color: isDefaultRoute
                    ? theme.colors.blue[9]
                    : theme.colors.gray[6],
                  weight: 8,
                  opacity: 0.5,
                }}
                eventHandlers={{
                  add: (e) => {
                    (L as any).path
                      .touchHelper(e.sourceTarget, { extraWeight: 50 })
                      .addTo(map);
                  },
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    selectRouteAlternative(index);
                  },
                  mousemove: (e) => {
                    setHoveredRouteIndex(index);
                    e.sourceTarget.bringToFront();
                    e.sourceTarget.setStyle({
                      color: isDefaultRoute
                        ? theme.colors.blue[9]
                        : theme.colors.gray[7],
                      weight: 8,
                      opacity: 1.0,
                    });
                  },
                  mouseout: (e) => {
                    setHoveredRouteIndex(null);
                    if (!isDefaultRoute) e.sourceTarget.bringToBack();
                    e.sourceTarget.setStyle({
                      color: isDefaultRoute
                        ? theme.colors.blue[9]
                        : theme.colors.gray[6],
                      weight: 8,
                      opacity: 0.5,
                    });
                  },
                }}
              >
                <Tooltip permanent={isShortestRoute}>
                  <Stack align='center' spacing={0}>
                    {isShortestRoute && !isHovered ? (
                      <Text size='xs' fw='bold' c={theme.colors.green[7]}>
                        Shortest
                      </Text>
                    ) : (
                      <>
                        {isDefaultRoute ? (
                          <Text
                            size='xs'
                            fw='bold'
                            italic
                            c={theme.colors.blue[9]}
                          >
                            Recommended
                          </Text>
                        ) : null}
                        {distanceStr ? (
                          <Text fw={700} size='xs'>
                            {distanceStr}
                          </Text>
                        ) : null}
                        {timeStr ? (
                          <Text fw={700} size='xs'>
                            {timeStr}
                          </Text>
                        ) : null}
                      </>
                    )}
                  </Stack>
                </Tooltip>
              </GeoJSON>
            );
          })
          .reverse()
      )}
    </>
  ) : null;
};
