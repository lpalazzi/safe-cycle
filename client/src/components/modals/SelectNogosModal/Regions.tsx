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
}> = ({ unsavedSelectedRegions, toggleRegion }) => {
  const theme = useMantineTheme();
  const { regions, loggedInUser } = useGlobalContext();
  const { map, currentLocation } = useMapContext();
  const [alphaSortedRegions, setAlphaSortedRegions] = useState<Region[]>([]);
  const [locationSortedRegions, setLocationSortedRegions] = useState<Region[]>(
    []
  );
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      const locationSortFunction = (a: Region, b: Region) => {
        const isInA = a.isLatLngInside(currentLocation.latlng);
        const isInB = b.isLatLngInside(currentLocation.latlng);
        const aDistance = isInA ? 0 : a.getDistanceTo(currentLocation.latlng);
        const bDistance = isInB ? 0 : b.getDistanceTo(currentLocation.latlng);
        return aDistance - bDistance;
      };
      const newClosestRegions = [...regions];
      newClosestRegions.sort(locationSortFunction);
      setLocationSortedRegions(newClosestRegions.slice(0, 2));
    } else {
      setLocationSortedRegions([]);
    }
  }, [regions, currentLocation]);

  useEffect(() => {
    const alphaSortFunction = (a: Region, b: Region) => {
      const compareRegion = (
        a.iso31662?.nameWithCountry || 'zzz'
      ).localeCompare(b.iso31662?.nameWithCountry || 'zzz');
      if (compareRegion === 0) {
        return a.name.localeCompare(b.name);
      }
      return compareRegion;
    };
    const newAlphaSortedRegions = [...regions];
    newAlphaSortedRegions.sort(alphaSortFunction);
    setAlphaSortedRegions(newAlphaSortedRegions);
  }, [regions]);

  return (
    <Stack spacing='md' align='stretch' justify='flext-start'>
      <Text size='sm' c='dimmed'>
        Regions contain pre-defined nogos that are maintained by verified
        contributors.{' '}
        {!showMoreInfo && (
          <Anchor onClick={() => setShowMoreInfo(true)} inherit span>
            More info
          </Anchor>
        )}
        {!!showMoreInfo && (
          <span>
            Our contributors have extensive knowledge of local roads and cycling
            routes in their region, and select nogos based on roads that most
            cyclists should avoid.{' '}
            <Anchor onClick={() => setShowMoreInfo(false)} inherit span>
              Hide
            </Anchor>
          </span>
        )}
      </Text>
      {loggedInUser?.role === 'admin' && (
        <Checkbox
          label='Show hidden regions'
          checked={showHidden}
          onChange={() => setShowHidden((prev) => !prev)}
        />
      )}
      <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
        <Stack spacing='sm' align='stretch' justify='flext-start'>
          <Text>Regions closest to your location</Text>
          {!currentLocation && (
            <Paper shadow='xs' p='md' radius='md'>
              <Group position='center'>
                <Text>Grant location access to show regions near you:</Text>
                <Button
                  onClick={() => map?.locate({ enableHighAccuracy: true })}
                >
                  Grant
                </Button>
              </Group>
            </Paper>
          )}
          {locationSortedRegions.map((region) => (
            <RegionCard
              key={region._id + 'location'}
              region={region}
              isSelected={unsavedSelectedRegions.includes(region._id)}
              showHidden={showHidden}
              toggleSelect={() => toggleRegion(region._id)}
            />
          ))}
        </Stack>
      </Paper>
      <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
        <Stack spacing='sm' align='stretch' justify='flext-start'>
          <Text>All regions</Text>
          {alphaSortedRegions.map((region) => (
            <RegionCard
              key={region._id + 'alpha'}
              region={region}
              isSelected={unsavedSelectedRegions.includes(region._id)}
              showHidden={showHidden}
              toggleSelect={() => toggleRegion(region._id)}
            />
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};
