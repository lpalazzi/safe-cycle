import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  ActionIcon,
  Anchor,
  Avatar,
  Button,
  Collapse,
  Flex,
  Group,
  Input,
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
import {
  IconCheck,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { ID } from 'types';
import { modals, openModal } from '@mantine/modals';
import { getBoundsForNogos, getTotalLengthOfNogos } from 'utils/nogos';
import { NogoGroupApi } from 'api';
import { showNotification } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { LoginModal } from './LoginModal';
import { SignupModal } from './SignupModal';

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
        <Text size='xl' fw={600}>
          Select nogos to avoid
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
              toggleSelect={() => toggleRegion(region._id)}
            />
          ))}
      </Stack>
    </Paper>
  );
};

// TODO: collapse contributor bio; add edit button if user is contributor; indicate if user is located in the region
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
          <Button
            size='sm'
            variant='filled'
            color={isSelected ? 'red' : 'green'}
            radius='md'
            onClick={toggleSelect}
          >
            {isSelected ? 'Deselect' : 'Select'}
          </Button>
        </Group>
      </Group>
      <Collapse in={showDetails}>
        <Group position='apart' spacing='xs' align='flex-start'>
          {showMap ? (
            <MapContainer
              bounds={region.getBounds()}
              style={{
                height: '300px',
                width: '100%',
                borderRadius: '12px',
                flexBasis: '40%',
                flexGrow: 1,
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
                flexBasis: '40%',
                flexGrow: 1,
                backgroundColor: theme.colors.gray[3],
              }}
            >
              <Loader />
            </Flex>
          )}

          <ScrollArea style={{ flexBasis: '50%', flexGrow: 1 }} miw={300}>
            <Stack spacing='xs' mah={300}>
              <Text>
                Verified contributor
                {region.contributors.length === 1 ? '' : 's'}:
              </Text>
              {region.contributors.map(
                (contributor) =>
                  !!contributor.contributorProfile && (
                    <Paper
                      shadow='xs'
                      p='md'
                      radius='md'
                      bg={theme.colors.gray[1]}
                    >
                      <Stack spacing='xs'>
                        <Group position='left'>
                          <Avatar
                            radius='xl'
                            src={`/images/contributors/${contributor.contributorProfile.imageFilename}`}
                          />
                          <Text>
                            {contributor.name.first +
                              ' ' +
                              contributor.name.last}
                          </Text>
                          {/* <Text>{contributor.contributorProfile.title}</Text> */}
                        </Group>
                        <Text size='xs' color='dimmed'>
                          {contributor.contributorProfile.bio}
                        </Text>
                      </Stack>
                    </Paper>
                  )
              )}
            </Stack>
          </ScrollArea>
        </Group>
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

  const refreshUserNogoGroups = () => {
    NogoGroupApi.getAllForUser().then(setUserNogoGroups);
  };

  const createNewNogoGroup = (attempt: number = 0) => {
    const name = 'Nogo Group' + (attempt ? ` ${attempt + 1}` : '');
    NogoGroupApi.create({ name })
      .then(refreshUserNogoGroups)
      .catch((error) => {
        if (error.message === `Name "${name}" is already taken`) {
          createNewNogoGroup(attempt + 1);
        } else {
          showNotification({
            title: 'Error creating Nogo Group',
            message: error.message || 'Undefined error',
            color: 'red',
          });
        }
      });
  };

  useEffect(() => {
    refreshUserNogoGroups();
  }, [loggedInUser]);

  return (
    <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
      <Stack spacing='sm' align='stretch' justify='flext-start'>
        <Text align='center'>Your nogos</Text>
        {!!loggedInUser && userNogoGroups.length === 0 && (
          <Text align='center' size='sm'>
            <IconInfoCircle
              size={20}
              style={{ verticalAlign: 'text-bottom' }}
            />{' '}
            You have no custom nogos yet. Create a group to get started.
          </Text>
        )}
        {!loggedInUser && (
          <>
            <Text align='center' size='sm'>
              You must have an account to use custom nogos.
            </Text>
            <Group position='center' maw={356} w='100%' m='auto' grow>
              <Button onClick={() => openModal(LoginModal)}>Sign in</Button>
              <Button onClick={() => openModal(SignupModal)}>
                Create account
              </Button>
            </Group>
          </>
        )}
        <Stack spacing='sm' align='stretch' justify='flext-start'>
          {userNogoGroups.map((nogoGroup) => (
            <NogoGroupCard
              nogoGroup={nogoGroup}
              isSelected={unsavedSelectedNogoGroups.includes(nogoGroup._id)}
              toggleSelect={() => toggleNogoGroup(nogoGroup._id)}
              onNogoGroupUpdated={refreshUserNogoGroups}
            />
          ))}
          {loggedInUser ? (
            <Button
              variant='outline'
              fullWidth
              h={60}
              leftIcon={<IconPlus size={18} />}
              onClick={() => createNewNogoGroup()}
            >
              Create a new Nogo Group
            </Button>
          ) : (
            <></>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

const NogoGroupCard: React.FC<{
  nogoGroup: NogoGroup;
  isSelected: boolean;
  toggleSelect: () => void;
  onNogoGroupUpdated: () => void;
}> = ({ nogoGroup, isSelected, toggleSelect, onNogoGroupUpdated }) => {
  const theme = useMantineTheme();
  const { setEditingGroupOrRegion } = useGlobalContext();
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [nogos, setNogos] = useState<Nogo[]>([]);
  const [totalLength, setTotalLength] = useState<number | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(nogoGroup.name);

  useEffect(() => {
    nogoGroup.getAllNogos().then((fetchedNogos) => {
      setNogos(fetchedNogos);
      setTotalLength(
        fetchedNogos.length > 0 ? getTotalLengthOfNogos(fetchedNogos) : 0
      );
    });
  }, []);

  useEffect(() => {
    setEditedName(nogoGroup.name);
  }, [nogoGroup.name]);

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
      bg={isSelected ? theme.colors.green[1] : undefined}
    >
      <Group position='apart'>
        <Stack spacing={0}>
          <Group spacing={isEditingName ? 'xs' : 0}>
            {isEditingName ? (
              <>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  maw={200}
                />
                <ActionIcon
                  size={36}
                  variant='outline'
                  radius='md'
                  color='red'
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(nogoGroup.name);
                  }}
                >
                  <IconX size='1.125rem' />
                </ActionIcon>
                <ActionIcon
                  size={36}
                  variant='filled'
                  radius='md'
                  color='blue'
                  onClick={() => {
                    NogoGroupApi.update(nogoGroup._id, {
                      name: editedName,
                    }).then(() => {
                      setIsEditingName(false);
                      onNogoGroupUpdated();
                    });
                  }}
                >
                  <IconCheck size='1.125rem' />
                </ActionIcon>
              </>
            ) : (
              <>
                <Text>{nogoGroup.name}</Text>
                <ActionIcon
                  size={36}
                  variant='transparent'
                  radius='md'
                  color='gray'
                  onClick={() => {
                    setIsEditingName(true);
                  }}
                >
                  <IconEdit size='1.125rem' />
                </ActionIcon>
              </>
            )}
          </Group>
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
            color='red'
            onClick={() => {
              modals.openConfirmModal({
                title: `Delete ${nogoGroup.name}?`,
                centered: true,
                children: (
                  <Text size='sm'>
                    Are you sure you want to delete these nogos? This action
                    cannot be undone.
                  </Text>
                ),
                labels: {
                  confirm: 'Delete nogos',
                  cancel: "No don't delete anything",
                },
                confirmProps: { color: 'red' },
                onConfirm: () => {
                  NogoGroupApi.delete(nogoGroup._id).then(onNogoGroupUpdated);
                },
              });
            }}
          >
            <IconTrash size='1.125rem' />
          </ActionIcon>
          <Button
            size='sm'
            variant='outline'
            color='blue'
            radius='md'
            onClick={() => {
              setEditingGroupOrRegion(nogoGroup);
              modals.closeAll();
            }}
          >
            Edit nogos
          </Button>
          <Button
            size='sm'
            variant='filled'
            color={isSelected ? 'red' : 'green'}
            radius='md'
            onClick={toggleSelect}
          >
            {isSelected ? 'Deselect' : 'Select'}
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
