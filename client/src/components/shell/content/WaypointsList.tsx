import React, { useEffect, useState } from 'react';
import {
  Stack,
  Timeline,
  Group,
  ActionIcon,
  Select,
  Text,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';

import { useMapContext } from 'contexts/mapContext';
import { GeocodingApi } from 'api';

export const WaypointsList: React.FC = () => {
  const { waypoints, removeWaypoint } = useMapContext();

  const [geoSearchValue, setGeoSearchValue] = useState<string>('');
  useEffect(() => {
    geoSearch(geoSearchValue);
  }, [geoSearchValue]);

  const geoSearch = async (query: string) => {
    await GeocodingApi.search(query);
  };

  return (
    <Stack spacing='xl'>
      <Text size='sm'>
        Search for your destination, or select points on the map to add to your
        route.
      </Text>
      <Timeline
        active={waypoints.length - 1}
        bulletSize={14}
        styles={{
          item: { ':not(:first-of-type)': { marginTop: '18px !important' } },
          itemContent: { transform: 'translateY(-10px)' },
        }}
      >
        {waypoints.map((waypoint, index) => {
          return (
            <Timeline.Item lineVariant='dotted'>
              <Group position='apart' pt={4} pb={4}>
                <Text size='sm'>
                  {waypoint.lat.toFixed(6) + ', ' + waypoint.lng.toFixed(6)}
                </Text>
                <ActionIcon onClick={() => removeWaypoint(index)}>
                  <IconX size={18} />
                </ActionIcon>
              </Group>
            </Timeline.Item>
          );
        })}
        <Timeline.Item lineVariant='dotted'>
          <Select
            searchable
            placeholder='Search for a location'
            data={[]}
            onSearchChange={setGeoSearchValue}
            searchValue={geoSearchValue}
            nothingFound='No results found'
          />
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
};
