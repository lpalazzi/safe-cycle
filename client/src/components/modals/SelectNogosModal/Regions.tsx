import React, { useEffect, useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';
import { ID } from 'types';
import { RegionCard } from './RegionCard';
import { Region } from 'models';

type SortMethod = 'alpha' | 'location' | 'nogoLength';

export const Regions: React.FC<{
  unsavedSelectedRegions: ID[];
  toggleRegion: (id: ID) => void;
}> = ({ unsavedSelectedRegions, toggleRegion }) => {
  const theme = useMantineTheme();
  const {
    regions,
    loggedInUser,
    getLengthSortedRegions,
    getLocationSortedRegions,
  } = useGlobalContext();
  const { map, currentLocation } = useMapContext();
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [sortedRegions, setSortedRegions] = useState<Region[]>([]);
  const [sortMethod, setSortMethod] = useState<SortMethod>(
    currentLocation ? 'location' : 'nogoLength'
  );

  useEffect(() => {
    switch (sortMethod) {
      case 'alpha':
        setSortedRegions(regions);
        break;
      case 'location':
        const locationSortedRegions = getLocationSortedRegions(currentLocation);
        setSortedRegions(locationSortedRegions);
        break;
      case 'nogoLength':
        getLengthSortedRegions().then(setSortedRegions);
        break;
      default:
        break;
    }
  }, [sortMethod, regions, currentLocation]);

  // TODO: option to sort by alpha, nogo length, or location
  return (
    <Stack spacing='md' align='stretch' justify='flext-start'>
      {loggedInUser?.role === 'admin' && (
        <Checkbox
          label='Show hidden regions'
          checked={showHidden}
          onChange={() => setShowHidden((prev) => !prev)}
        />
      )}
      <Text size='sm' c='dimmed'>
        Regions contain pre-defined nogos that are maintained by verified
        contributors.{' '}
        {showMoreInfo ? (
          <span>
            Our contributors have extensive knowledge of local roads and cycling
            routes in their region, and select nogos based on roads that most
            cyclists should avoid.{' '}
            <Anchor onClick={() => setShowMoreInfo(false)} inherit>
              Hide
            </Anchor>
          </span>
        ) : (
          <Anchor onClick={() => setShowMoreInfo(true)} inherit>
            More info
          </Anchor>
        )}
      </Text>

      {sortMethod === 'location' && !currentLocation && (
        <Group position='center' spacing='xs'>
          <Text size='sm' fs='italic'>
            Grant location access to sort regions by distance from you.
          </Text>
          <Button onClick={() => map?.locate({ enableHighAccuracy: true })}>
            Grant
          </Button>
        </Group>
      )}
      {sortedRegions.map((region) => (
        <RegionCard
          key={region._id + 'alpha'}
          region={region}
          isSelected={unsavedSelectedRegions.includes(region._id)}
          showHidden={showHidden}
          toggleSelect={() => toggleRegion(region._id)}
        />
      ))}
    </Stack>
  );
};
