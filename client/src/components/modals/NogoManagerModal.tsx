import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  ActionIcon,
  Anchor,
  Button,
  Collapse,
  Flex,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { Nogo, NogoGroup, Region } from 'models';
import { metresToDistanceString } from 'utils/formatting';
import { useMapContext } from 'contexts/mapContext';
import { IconEdit, IconX } from '@tabler/icons-react';
import { ID } from 'types';
import { modals } from '@mantine/modals';
import { getBoundsForNogos, getTotalLengthOfNogos } from 'utils/nogos';
import { NogoGroupApi } from 'api';

export const NogoManagerModal = (isMobileSize: boolean) =>
  ({
    children: <NogoManagerContent />,
    size: '800px',
    fullScreen: isMobileSize,
    scrollAreaComponent: ScrollArea.Autosize,
    withCloseButton: false,
  } as ModalSettings);

const NogoManagerContent: React.FC = () => {
  const {
    selectedRegions,
    selectedNogoGroups,
    setSelectedRegions,
    setSelectedNogoGroups,
  } = useGlobalContext();
  const [unsavedSelectedRegions, setUnsavedSelectedRegions] =
    useState(selectedRegions);
  const [unsavedSelectedNogoGroups, setUnsavedSelectedNogoGroups] =
    useState(selectedNogoGroups);

  const toggleRegion = (id: ID) => {
    if (unsavedSelectedRegions.includes(id)) {
      setUnsavedSelectedRegions(
        [...unsavedSelectedRegions].filter(
          (unsavedSelectedRegionId) => unsavedSelectedRegionId !== id
        )
      );
    } else {
      setUnsavedSelectedRegions([...unsavedSelectedRegions, id]);
    }
  };

  const toggleNogoGroup = (id: ID) => {
    if (unsavedSelectedNogoGroups.includes(id)) {
      setUnsavedSelectedNogoGroups(
        [...unsavedSelectedNogoGroups].filter(
          (unsavedSelectedNogoGroupId) => unsavedSelectedNogoGroupId !== id
        )
      );
    } else {
      setUnsavedSelectedNogoGroups([...unsavedSelectedNogoGroups, id]);
    }
  };

  const applyAndClose = () => {
    setSelectedRegions(unsavedSelectedRegions);
    setSelectedNogoGroups(unsavedSelectedNogoGroups);
    modals.closeAll();
  };

  return (
    <Stack>
      <Group position='apart'>
        <Text size='lg' fw='bold'>
          Manage nogos
        </Text>
        {/* TODO: what are nogos? */}
        <Group>
          <Button variant='outline' onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button onClick={applyAndClose}>Apply and close</Button>
        </Group>
      </Group>
      <Regions
        unsavedSelectedRegions={unsavedSelectedRegions}
        toggleRegion={toggleRegion}
      />
      <NogoGroups
        unsavedSelectedNogoGroups={unsavedSelectedNogoGroups}
        toggleNogoGroup={toggleNogoGroup}
      />
    </Stack>
  );
};

const Regions: React.FC<{
  unsavedSelectedRegions: ID[];
  toggleRegion: (id: ID) => void;
}> = ({ unsavedSelectedRegions, toggleRegion }) => {
  const { regions } = useGlobalContext();
  const { map, currentLocation } = useMapContext();
  const theme = useMantineTheme();
  const [sortedRegions, setSortedRegions] = useState<Region[]>([]);
  const [showAllRegions, setShowAllRegions] = useState(false);

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

  const sliceIndex = currentLocation ? 1 : 0; // TODO: change to 3 : 0 before pushing
  const suggestedRegions = sortedRegions.slice(0, sliceIndex);
  const remainingRegions = sortedRegions.slice(sliceIndex);

  return (
    <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
      <Stack spacing='sm' align='stretch' justify='flext-start'>
        <Text align='center'>Regions closest to your location</Text>
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
            toggleSelect={() => toggleRegion(region._id)}
          />
        ))}
        <Anchor align='center' onClick={toggleShowAllRegions}>
          {showAllRegions ? 'Collapse regions' : 'Show all regions'}
        </Anchor>
        {showAllRegions &&
          remainingRegions.map((region) => (
            <RegionCard
              region={region}
              isSelected={unsavedSelectedRegions.includes(region._id)}
              toggleSelect={() => toggleRegion(region._id)}
            />
          ))}
      </Stack>
    </Paper>
  );
};

// TODO: add contributor info; add edit button if user is contributor; indicate if user is located in the region
const RegionCard: React.FC<{
  region: Region;
  isSelected: boolean;
  toggleSelect: () => void;
}> = ({ region, isSelected, toggleSelect }) => {
  const theme = useMantineTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [nogos, setNogos] = useState<Nogo[]>([]);
  const [totalLength, setTotalLength] = useState<number | null>(null);

  useEffect(() => {
    region.getAllNogos().then((nogos) => {
      setNogos(nogos);
      setTotalLength(getTotalLengthOfNogos(nogos));
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (showDetails) {
        setShowMap(true);
      }
    }, 300);
  }, [showDetails]);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <Paper
      shadow='xs'
      p='md'
      radius='md'
      bg={isSelected ? theme.colors.green[0] : undefined}
    >
      <Group position='apart'>
        <Stack spacing={0}>
          <Text>{region.name}</Text>
          {!!region.iso31662?.nameWithCountry && (
            <Text size='sm' color='dimmed'>
              {region.iso31662?.nameWithCountry}
            </Text>
          )}
          <Text size='sm' color='dimmed'>
            Total nogos: {metresToDistanceString(totalLength || 0, 1)}
          </Text>
          <Anchor size='sm' onClick={toggleDetails}>
            {showDetails ? 'Hide details' : 'See details'}
          </Anchor>
        </Stack>
        <Group position='right' spacing='xs'>
          {isSelected && (
            <ActionIcon
              size={36}
              variant='filled'
              radius='md'
              color='red'
              onClick={toggleSelect}
            >
              <IconX size='1.125rem' />
            </ActionIcon>
          )}
          <Button
            size='sm'
            variant='filled'
            color='green'
            radius='md'
            onClick={toggleSelect}
            disabled={isSelected}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </Group>
      </Group>
      <Collapse in={showDetails}>
        {showMap ? (
          <MapContainer
            bounds={region.getBounds()}
            style={{
              height: '300px',
              width: '100%',
              borderRadius: '12px',
            }}
          >
            <TileLayer
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              minZoom={0}
              maxZoom={19}
            />
            {nogos.map((nogo) => (
              <GeoJSON
                key={nogo._id}
                data={nogo.lineString}
                style={{
                  color: theme.colors.red[7],
                  weight: 3,
                  opacity: 1,
                }}
                interactive={false}
              />
            ))}
            <GeoJSON
              key={region._id}
              data={region.polygon}
              style={{
                color: 'grey',
                weight: 4,
                opacity: 1.0,
                fillOpacity: 0.1,
              }}
            ></GeoJSON>
          </MapContainer>
        ) : (
          <Flex
            justify='center'
            align='center'
            style={{
              height: '300px',
              width: '100%',
              borderRadius: '12px',
              backgroundColor: theme.colors.gray[3],
            }}
          >
            <Loader />
          </Flex>
        )}
      </Collapse>
    </Paper>
  );
};

const NogoGroups: React.FC<{
  unsavedSelectedNogoGroups: ID[];
  toggleNogoGroup: (id: ID) => void;
}> = ({ unsavedSelectedNogoGroups, toggleNogoGroup }) => {
  const theme = useMantineTheme();
  const { loggedInUser } = useGlobalContext();
  const [userNogoGroups, setUserNogoGroups] = useState<NogoGroup[]>([]);

  useEffect(() => {
    NogoGroupApi.getAllForUser().then(setUserNogoGroups);
  }, [loggedInUser]);

  return (
    <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
      <Text align='center'>Your nogos</Text>
      <Stack spacing='sm' align='stretch' justify='flext-start'>
        {userNogoGroups.map((nogoGroup) => (
          <NogoGroupCard
            nogoGroup={nogoGroup}
            isSelected={unsavedSelectedNogoGroups.includes(nogoGroup._id)}
            toggleSelect={() => toggleNogoGroup(nogoGroup._id)}
          />
        ))}
        {/* TODO: Button to create a new nogo group; if not logged in, show login and signup buttons */}
      </Stack>
    </Paper>
  );
};

// TODO: edit group name; delete group
const NogoGroupCard: React.FC<{
  nogoGroup: NogoGroup;
  isSelected: boolean;
  toggleSelect: () => void;
}> = ({ nogoGroup, isSelected, toggleSelect }) => {
  const theme = useMantineTheme();
  const { setEditingGroupOrRegion } = useGlobalContext();
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [nogos, setNogos] = useState<Nogo[]>([]);
  const [totalLength, setTotalLength] = useState<number | null>(null);

  useEffect(() => {
    nogoGroup.getAllNogos().then((fetchedNogos) => {
      setNogos(fetchedNogos);
      setTotalLength(
        fetchedNogos.length > 0 ? getTotalLengthOfNogos(fetchedNogos) : 0
      );
    });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (showDetails) {
        setShowMap(true);
      }
    }, 300);
  }, [showDetails]);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <Paper
      shadow='xs'
      p='md'
      radius='md'
      bg={isSelected ? theme.colors.green[0] : undefined}
    >
      <Group position='apart'>
        <Stack spacing={0}>
          <Text>{nogoGroup.name}</Text>
          <Text size='sm' color='dimmed'>
            {!!totalLength
              ? `Total nogos: ${metresToDistanceString(totalLength || 0, 1)}`
              : 'This group has no nogos'}
          </Text>
          <Anchor
            size='sm'
            onClick={toggleDetails}
            style={totalLength ? {} : { visibility: 'hidden' }}
          >
            {showDetails ? 'Hide nogos' : 'See nogos in this group'}
          </Anchor>
        </Stack>
        <Group position='right' spacing='xs'>
          <ActionIcon
            size={36}
            variant='outline'
            radius='md'
            color='blue'
            onClick={() => {
              setEditingGroupOrRegion(nogoGroup);
              modals.closeAll();
            }}
          >
            <IconEdit size='1.125rem' />
          </ActionIcon>
          {isSelected && (
            <ActionIcon
              size={36}
              variant='filled'
              radius='md'
              color='red'
              onClick={toggleSelect}
            >
              <IconX size='1.125rem' />
            </ActionIcon>
          )}
          <Button
            size='sm'
            variant='filled'
            color='green'
            radius='md'
            onClick={toggleSelect}
            disabled={isSelected}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
        </Group>
      </Group>
      <Collapse in={showDetails}>
        {showMap && nogos.length > 0 ? (
          <MapContainer
            key={nogos.length}
            bounds={getBoundsForNogos(nogos)}
            style={{
              height: '300px',
              width: '100%',
              borderRadius: '12px',
            }}
          >
            <TileLayer
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              minZoom={0}
              maxZoom={19}
            />
            {nogos.map((nogo) => (
              <GeoJSON
                key={nogo._id}
                data={nogo.lineString}
                style={{
                  color: theme.colors.red[7],
                  weight: 3,
                  opacity: 1,
                }}
                interactive={false}
              />
            ))}
          </MapContainer>
        ) : (
          <Flex
            justify='center'
            align='center'
            style={{
              height: '300px',
              width: '100%',
              borderRadius: '12px',
              backgroundColor: theme.colors.gray[3],
            }}
          >
            {showMap ? (
              <Text>
                You have no nogos in this nogo group. Edit the group to add
                nogos.
              </Text>
            ) : (
              <Loader />
            )}
          </Flex>
        )}
      </Collapse>
    </Paper>
  );
};
