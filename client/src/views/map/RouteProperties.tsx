import React from 'react';
import { Paper, Group, Text } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';
import { metresToDistanceString, secondsToTimeString } from 'utils/formatting';

export const RouteProperties: React.FC = () => {
  const { isMobileSize, isNavbarOpen } = useGlobalContext();
  const { routes, selectedRouteIndex } = useMapContext();

  // if (!selectedRouteIndex && selectedRouteIndex !== 0) return null;

  const distanceStr = metresToDistanceString(
    Number(routes?.[selectedRouteIndex ?? 0]?.properties?.['track-length']) ?? 0
  );
  const timeStr = secondsToTimeString(
    Number(routes?.[selectedRouteIndex ?? 0]?.properties?.['total-time']) ?? 0
  );

  return (
    <Paper
      shadow='xs'
      p='md'
      style={{
        position: 'fixed',
        bottom: 28,
        right: '50%',
        transform:
          isNavbarOpen && !isMobileSize
            ? 'translate(192px, 0) translate(50%, 0)'
            : 'translate(50%, 0)',
        zIndex: 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Group position='center' noWrap>
        {distanceStr ? <Property label='Distance' value={distanceStr} /> : null}
        {timeStr ? <Property label='Travel time' value={timeStr} /> : null}
      </Group>
    </Paper>
  );
};

const Property: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <Text fw={700} size='sm'>
      {label}:{' '}
      <Text span c='blue' inherit>
        {value}
      </Text>
    </Text>
  );
};
