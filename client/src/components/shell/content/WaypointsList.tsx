import React, { useEffect, useMemo, useState } from 'react';
import { LatLng } from 'leaflet';
import debounce from 'lodash.debounce';
import {
  Stack,
  Timeline,
  Group,
  ActionIcon,
  Select,
  Text,
  SelectItem,
  Button,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconLocation, IconX } from '@tabler/icons-react';

import { GeocodingApi } from 'api';
import { GeocodeSearchResult } from 'api/interfaces/Geocoding';
import { useMapContext } from 'contexts/mapContext';

export const WaypointsList: React.FC = () => {
  const { map, waypoints, addWaypoint, removeWaypoint } = useMapContext();

  const [geoSearchValue, setGeoSearchValue] = useState<string>('');
  const [geoSearchResults, setGeoSearchResults] = useState<
    GeocodeSearchResult[]
  >([]);

  const executeGeoSearch = async (query: string) => {
    if (query === '') {
      setGeoSearchResults([]);
      return;
    }

    try {
      const res = await GeocodingApi.search(query, map?.getBounds());
      setGeoSearchResults(res);
    } catch (error: any) {
      showNotification({
        title: 'Error searching location',
        message: error.message || 'Undefined error',
        color: 'red',
      });
      setGeoSearchResults([]);
    }
  };

  const handleGeoSearchValueChanged = useMemo(() => {
    return debounce(executeGeoSearch, 300);
  }, [map]);

  const handleLocationSelect = (value: string | null) => {
    const selectedGeoSearchResult = geoSearchResults.find(
      (geoSearchResult) => geoSearchResult.place_id.toString() === value
    );
    if (selectedGeoSearchResult) {
      addWaypoint(
        new LatLng(
          Number(selectedGeoSearchResult.lat),
          Number(selectedGeoSearchResult.lon)
        ),
        selectedGeoSearchResult.display_name
      );
    }
  };

  const handleCurrentLocationSelect = () => {
    map?.once('locationfound', (e) => {
      const { latlng, heading } = e;
      addWaypoint(latlng, 'Current location');
    });
    map?.locate();
  };

  useEffect(() => {
    return handleGeoSearchValueChanged.cancel();
  });

  useEffect(() => {
    handleGeoSearchValueChanged(geoSearchValue);
  }, [geoSearchValue]);

  const geoSearchResultOptions: SelectItem[] = geoSearchResults.map(
    (geoSearchResult) => {
      return {
        value: geoSearchResult.place_id.toString(),
        label: geoSearchResult.display_name,
      };
    }
  );

  return (
    <Stack spacing='xl'>
      <Text size='sm'>
        Search for your destination, or select points on the map to add to your
        route.
      </Text>
      <Timeline
        style={{ zIndex: 100 }}
        active={waypoints.length - 1}
        bulletSize={20}
        styles={{
          item: { ':not(:first-of-type)': { marginTop: '18px !important' } },
          itemContent: { transform: 'translateY(-8px)' },
        }}
      >
        {waypoints.length === 0 ? (
          <Timeline.Item lineVariant='dotted'>
            <Button
              leftIcon={<IconLocation size={18} />}
              onClick={handleCurrentLocationSelect}
              fullWidth
            >
              Start at your current location
            </Button>
          </Timeline.Item>
        ) : null}
        {waypoints.map((waypoint, index) => {
          const label =
            waypoint.label ??
            waypoint.latlng.lat.toFixed(6) +
              ', ' +
              waypoint.latlng.lng.toFixed(6);
          return (
            <Timeline.Item
              bullet={<Text size={12}>{index + 1}</Text>}
              lineVariant='dotted'
            >
              <Group position='apart' pt={4} pb={4} noWrap>
                <Text lineClamp={1} size='sm'>
                  {label}
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
            key={waypoints.length}
            searchable
            placeholder='Search for a location'
            data={geoSearchResultOptions}
            onSearchChange={setGeoSearchValue}
            onChange={handleLocationSelect}
            searchValue={geoSearchValue}
            nothingFound='No results found'
            filter={() => true}
            rightSection={<div></div>}
          />
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
};
