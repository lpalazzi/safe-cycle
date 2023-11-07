import React, { useEffect, useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { Region } from 'models';
import { useMapContext } from 'contexts/mapContext';
import { ID } from 'types';
import { RegionCard } from './RegionCard';

export const Regions: React.FC<{
  unsavedSelectedRegions: ID[];
  toggleRegion: (id: ID) => void;
  clearSelectedRegions: () => void;
}> = ({ unsavedSelectedRegions, toggleRegion, clearSelectedRegions }) => {
  const { regions, loggedInUser } = useGlobalContext();
  const { map, currentLocation } = useMapContext();
  const theme = useMantineTheme();
  const [sortedRegions, setSortedRegions] = useState<Region[]>([]);
  const [showAllRegions, setShowAllRegions] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    const sortFunction = currentLocation
      ? (a: Region, b: Region) => {
          const isInA = a.isLatLngInside(currentLocation.latlng);
          const isInB = b.isLatLngInside(currentLocation.latlng);
          const aDistance = isInA ? 0 : a.getDistanceTo(currentLocation.latlng);
          const bDistance = isInB ? 0 : b.getDistanceTo(currentLocation.latlng);
          return aDistance - bDistance;
        }
      : (a: Region, b: Region) => {
          const compareRegion = (
            a.iso31662?.nameWithCountry || 'zzz'
          ).localeCompare(b.iso31662?.nameWithCountry || 'zzz');
          if (compareRegion === 0) {
            return a.name.localeCompare(b.name);
          }
          return compareRegion;
        };
    const newSortedRegions = [...regions];
    newSortedRegions.sort(sortFunction);
    setSortedRegions(newSortedRegions);
  }, [regions, currentLocation]);

  const toggleShowAllRegions = () => {
    setShowAllRegions((prev) => !prev);
  };

  const sliceIndex = currentLocation ? 2 : 0;
  const suggestedRegions = sortedRegions.slice(0, sliceIndex);
  const remainingRegions = sortedRegions.slice(sliceIndex);

  return (
    <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
      <Stack spacing='sm' align='stretch' justify='flext-start'>
        <Group position='apart' noWrap h={26}>
          <Text>Regions closest to your location</Text>
          {unsavedSelectedRegions.length > 0 && (
            <Button variant='outline' compact onClick={clearSelectedRegions}>
              Clear
            </Button>
          )}
        </Group>
        {loggedInUser?.role === 'admin' && (
          <Checkbox
            label='Show hidden regions'
            checked={showHidden}
            onChange={() => setShowHidden((prev) => !prev)}
          />
        )}
        {!currentLocation && (
          <Paper shadow='xs' p='md' radius='md'>
            <Group position='center'>
              <Text>Grant location access to show regions near you:</Text>
              <Button onClick={() => map?.locate({ enableHighAccuracy: true })}>
                Grant
              </Button>
            </Group>
          </Paper>
        )}
        {suggestedRegions.map((region) => (
          <RegionCard
            region={region}
            isSelected={unsavedSelectedRegions.includes(region._id)}
            showHidden={showHidden}
            toggleSelect={() => toggleRegion(region._id)}
          />
        ))}
        <Anchor
          align='center'
          w='auto'
          mx='auto'
          onClick={toggleShowAllRegions}
        >
          {showAllRegions ? 'Collapse regions' : 'Show all regions'}
        </Anchor>
        {showAllRegions &&
          remainingRegions.map((region) => (
            <RegionCard
              region={region}
              isSelected={unsavedSelectedRegions.includes(region._id)}
              showHidden={showHidden}
              toggleSelect={() => toggleRegion(region._id)}
            />
          ))}
      </Stack>
    </Paper>
  );
};
