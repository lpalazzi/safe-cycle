import React from 'react';
import { Paper, Group, Text } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';
import { metresToDistanceString, secondsToTimeString } from 'utils/formatting';

export const RouteProperties: React.FC = () => {
  const { isMobileSize, isNavbarOpen } = useGlobalContext();
  const { routes, selectedRouteIndex } = useMapContext();

  const distanceStr = metresToDistanceString(
    Number(routes?.[selectedRouteIndex ?? 0]?.properties?.['track-length']) ?? 0
  );
  const timeStr = secondsToTimeString(
    Number(routes?.[selectedRouteIndex ?? 0]?.properties?.['total-time']) ?? 0
  );

  return (
    <Paper
      p='md'
      maw={isMobileSize ? 210 : undefined}
      style={{
        position: 'fixed',
        bottom: isMobileSize ? 25.8 : undefined,
        top: isMobileSize ? undefined : 8,
        right: isMobileSize ? '50%' : 8,
        transform: isMobileSize ? 'translate(50%, 0)' : undefined,
        zIndex: 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {selectedRouteIndex || selectedRouteIndex === 0 ? (
        <Group position='center' spacing='xs'>
          {distanceStr ? (
            <Property label='Distance' value={distanceStr} />
          ) : null}
          {timeStr ? <Property label='Travel time' value={timeStr} /> : null}
        </Group>
      ) : (
        <Text fw={700} size='sm' c='blue' align='center'>
          Click a route option to select it
        </Text>
      )}
    </Paper>
  );
};

const Property: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  const { isMobileSize } = useGlobalContext();

  return (
    <Text fw={700} size={isMobileSize ? 'xs' : 'sm'}>
      {label}:{' '}
      <Text span c='blue' inherit>
        {value}
      </Text>
    </Text>
  );
};
