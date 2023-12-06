import React, { useMemo, useRef, useState } from 'react';
import {
  useMantineTheme,
  Stack,
  Checkbox,
  Input,
  SegmentedControl,
  Grid,
  Image,
  Text,
  Paper,
  Title,
  Select,
  Group,
  Chip,
  Button,
  Badge,
  Collapse,
  Anchor,
  Alert,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import {
  IconAlertCircle,
  IconCurrentLocation,
  IconRoute2,
  IconSettings,
  IconUserCog,
} from '@tabler/icons-react';
import { ComfortLevel, ID, RouteOptions, SurfacePreference } from 'types';
import { useGlobalContext } from 'contexts/globalContext';

import LowComfortIcon from 'assets/comfortlevels/2-low.png';
import MediumComfortIcon from 'assets/comfortlevels/3-medium.png';
import HighComfortIcon from 'assets/comfortlevels/4-high.png';
import { SelectNogosModal } from 'components/modals/SelectNogosModal/SelectNogosModal';
import { useMapContext } from 'contexts/mapContext';
import {
  sortRegionsByLocationFunction,
  sortRegionsByNogoLengthFunction,
} from 'utils/sorting';
import { LoginModal } from 'components/modals/LoginModal';

const comfortPresets: { [key: string]: Partial<RouteOptions> } = {
  Shortest: {
    shortest: true,
    preferBikeFriendly: false,
    preferCycleRoutes: false,
  },
  Low: {
    shortest: false,
    preferBikeFriendly: false,
    preferCycleRoutes: false,
  },
  Medium: {
    shortest: false,
    preferBikeFriendly: true,
    preferCycleRoutes: false,
  },
  High: {
    shortest: false,
    preferBikeFriendly: true,
    preferCycleRoutes: true,
  },
};

export const RoutePreferences: React.FC = () => {
  const {
    loggedInUser,
    routeOptions,
    selectedComfortLevel,
    showAlternateRoutes,
    isMobileSize,
    selectedNogoGroups,
    selectedRegions,
    regions,
    regionLengths,
    userNogoGroups,
    setSelectedComfortLevel,
    setSelectedNogoGroups,
    setSelectedRegions,
    updateRouteOptions,
    setShowAlternateRoutes,
  } = useGlobalContext();
  const { map, currentLocation } = useMapContext();
  const { openModal } = useModals();
  const theme = useMantineTheme();
  const previouslySelectedRegions = useRef<ID[]>([]);
  const previouslySelectedNogoGroups = useRef<ID[]>([]);
  const [expandedSetting, setExpandedSetting] = useState<
    'nogos' | 'comfort' | 'other' | false
  >(false);
  const [hideRegionWarning, setHideRegionWarning] = useState(false);

  useMemo(() => {
    selectedRegions.forEach((id) => {
      if (!previouslySelectedRegions.current.includes(id))
        previouslySelectedRegions.current.push(id);
    });
  }, [selectedRegions]);

  useMemo(() => {
    selectedNogoGroups.forEach((id) => {
      if (!previouslySelectedNogoGroups.current.includes(id))
        previouslySelectedNogoGroups.current.push(id);
    });
  }, [selectedNogoGroups]);

  const regionChips = useMemo(() => {
    const filteredRegions = regions
      .filter((region) => {
        if (loggedInUser && region.isUserContributor(loggedInUser._id))
          return true; // contributor's regions are always suggested
        if (regionLengths[region._id] < 5000) return false; // regions w/ less than 5km of nogos are otherwise hidden
        if (!currentLocation) return false;
        if (region.getDistanceTo(currentLocation.latlng) < 300000) return true; // regions within 300km of current location are suggested
        return false;
      })
      .slice(0, 4);

    if (filteredRegions.length > 1)
      filteredRegions.sort(
        currentLocation
          ? sortRegionsByLocationFunction(currentLocation.latlng)
          : sortRegionsByNogoLengthFunction(regionLengths)
      );

    const suggestedRegions = filteredRegions.slice(0, 4);

    const otherSelectedRegions = regions
      .filter((region) =>
        [...selectedRegions, ...previouslySelectedRegions.current].includes(
          region._id
        )
      )
      .filter(
        (selectedRegion) =>
          !suggestedRegions.some(
            (suggestedRegion) => suggestedRegion._id === selectedRegion._id
          )
      );

    return [...suggestedRegions, ...otherSelectedRegions].map((region) => ({
      label: region.shortName,
      value: region._id,
      isUserInside:
        !!currentLocation && region.isLatLngInside(currentLocation.latlng),
    }));
  }, [
    regions,
    regionLengths,
    loggedInUser,
    currentLocation,
    selectedRegions,
    previouslySelectedRegions.current,
  ]);

  const nogoGroupChips = useMemo(() => {
    const suggestedNogoGroups = [...userNogoGroups].slice(0, 2);
    const otherNogoGroupsToShow = userNogoGroups
      .filter((group) =>
        previouslySelectedNogoGroups.current.includes(group._id)
      )
      .filter(
        (selectedNogoGroup) =>
          !suggestedNogoGroups.some(
            (suggestedNogoGroup) =>
              suggestedNogoGroup._id === selectedNogoGroup._id
          )
      );
    return [...suggestedNogoGroups, ...otherNogoGroupsToShow].map((group) => ({
      label: group.name,
      value: group._id,
    }));
  }, [
    userNogoGroups,
    selectedNogoGroups,
    loggedInUser,
    selectedNogoGroups,
    previouslySelectedNogoGroups.current,
  ]);

  const handleNogoGroupChipToggled = (id: ID) => {
    if (selectedNogoGroups.includes(id)) {
      setSelectedNogoGroups(
        [...selectedNogoGroups].filter((group) => group !== id)
      );
    } else {
      setSelectedNogoGroups([...selectedNogoGroups, id]);
      if (!previouslySelectedNogoGroups.current.includes(id))
        previouslySelectedNogoGroups.current.push(id);
    }
  };

  const handleRegionChipToggled = (id: ID) => {
    if (selectedRegions.includes(id)) {
      setSelectedRegions(
        [...selectedRegions].filter((region) => region !== id)
      );
    } else {
      setSelectedRegions([...selectedRegions, id]);
    }
  };

  const handleComfortLevelSelected = (value: ComfortLevel) => {
    setSelectedComfortLevel(value);
    if (value !== 'Custom') updateRouteOptions(comfortPresets[value]);
  };

  const handleCondensedSettingButtonClicked = (
    selected: 'nogos' | 'comfort' | 'other'
  ) => {
    if (selected === expandedSetting) {
      setExpandedSetting(false);
    } else {
      setExpandedSetting(selected);
    }
  };

  let selectedComfortLevelIcon = <></>;
  switch (selectedComfortLevel) {
    case 'Low':
      selectedComfortLevelIcon = (
        <Image src={LowComfortIcon} width={14} mih={14} />
      );
      break;
    case 'Medium':
      selectedComfortLevelIcon = (
        <Image src={MediumComfortIcon} width={14} mih={14} />
      );
      break;
    case 'High':
      selectedComfortLevelIcon = (
        <Image src={HighComfortIcon} width={14} mih={14} />
      );
      break;
    case 'Shortest':
      selectedComfortLevelIcon = <IconRoute2 size={14} />;
      break;
    case 'Custom':
      selectedComfortLevelIcon = <IconUserCog size={14} />;
      break;
  }

  const selectedGroupsOrRegionsLength =
    selectedRegions.length + selectedNogoGroups.length;

  return (
    <Stack justify='flex-start' spacing='xs'>
      <Button.Group ml='auto' mr='auto' w='100%'>
        <Button
          size='xs'
          variant={expandedSetting === 'nogos' ? 'filled' : 'default'}
          style={{ borderRightWidth: 0 }}
          fullWidth
          onClick={() => handleCondensedSettingButtonClicked('nogos')}
          rightIcon={
            <Badge
              color={selectedGroupsOrRegionsLength > 0 ? 'green' : 'gray'}
              w={14}
              h={14}
              sx={{ pointerEvents: 'none' }}
              variant='filled'
              size='xs'
              p={0}
            >
              {selectedGroupsOrRegionsLength}
            </Badge>
          }
        >
          Avoid nogos
        </Button>
        <Button
          size='xs'
          variant={expandedSetting === 'comfort' ? 'filled' : 'default'}
          style={{ borderRightWidth: 0 }}
          fullWidth
          onClick={() => handleCondensedSettingButtonClicked('comfort')}
          rightIcon={selectedComfortLevelIcon}
        >
          Comfort level
        </Button>
        <Button
          size='xs'
          variant={expandedSetting === 'other' ? 'filled' : 'default'}
          fullWidth
          onClick={() => handleCondensedSettingButtonClicked('other')}
          rightIcon={<IconSettings size={14} />}
        >
          Other
        </Button>
      </Button.Group>
      <Paper
        display={expandedSetting ? 'block' : 'none'}
        radius='md'
        p='sm'
        bg={theme.colors.gray[1]}
      >
        <Stack spacing='sm'>
          <Collapse in={expandedSetting === 'nogos'} transitionDuration={100}>
            <Stack spacing='md'>
              <Stack spacing={0}>
                <Group position='apart'>
                  <Text size='xs' c='dimmed'>
                    Your nogos
                  </Text>
                  {loggedInUser ? (
                    <Anchor
                      size='xs'
                      onClick={() =>
                        openModal(SelectNogosModal(isMobileSize, 'custom'))
                      }
                    >
                      Manage
                    </Anchor>
                  ) : (
                    <div />
                  )}
                </Group>
                {loggedInUser ? (
                  nogoGroupChips.length > 0 ? (
                    <Group position='left' spacing='0.25rem'>
                      {nogoGroupChips.map((chip) => (
                        <Chip
                          size='xs'
                          checked={selectedNogoGroups.includes(chip.value)}
                          onChange={() =>
                            handleNogoGroupChipToggled(chip.value)
                          }
                          styles={{ root: { height: 26 } }}
                        >
                          {chip.label}
                        </Chip>
                      ))}
                      {userNogoGroups.length > nogoGroupChips.length && (
                        <Chip
                          size='xs'
                          checked={false}
                          variant='light'
                          onChange={() =>
                            openModal(SelectNogosModal(isMobileSize, 'custom'))
                          }
                        >
                          More
                        </Chip>
                      )}
                    </Group>
                  ) : (
                    <AlertBox>
                      You have no nogo groups to select from.{' '}
                      <Anchor
                        inherit
                        inline
                        onClick={() =>
                          openModal(SelectNogosModal(isMobileSize, 'custom'))
                        }
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Create one here.
                      </Anchor>
                    </AlertBox>
                  )
                ) : (
                  <AlertBox>
                    <Anchor
                      inherit
                      inline
                      onClick={() => openModal(LoginModal())}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Sign in
                    </Anchor>{' '}
                    to add your own nogos.
                  </AlertBox>
                )}
              </Stack>
              <Stack spacing={0}>
                <Group position='apart'>
                  <Text size='xs' c='dimmed'>
                    Regions
                  </Text>
                  <Anchor
                    size='xs'
                    onClick={() =>
                      openModal(SelectNogosModal(isMobileSize, 'regions'))
                    }
                  >
                    See all
                  </Anchor>
                </Group>
                {currentLocation || regionChips.length > 0 ? (
                  regionChips.length > 0 ? (
                    <Group position='left' spacing='0.25rem'>
                      {regionChips.map((chip, index) => (
                        <Chip
                          size='xs'
                          checked={selectedRegions.includes(chip.value)}
                          onChange={() => handleRegionChipToggled(chip.value)}
                          styles={{ root: { height: 26 } }}
                        >
                          {chip.label}
                          {chip.isUserInside && index === 0 && (
                            <IconCurrentLocation
                              size='1rem'
                              style={{ marginLeft: '0.25rem' }}
                            />
                          )}
                        </Chip>
                      ))}
                    </Group>
                  ) : (
                    !hideRegionWarning && (
                      <AlertBox onClose={() => setHideRegionWarning(true)}>
                        You are not near a supported region.{' '}
                        <Anchor
                          inline
                          inherit
                          onClick={() =>
                            openModal(SelectNogosModal(isMobileSize, 'regions'))
                          }
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          View supported regions here.
                        </Anchor>
                      </AlertBox>
                    )
                  )
                ) : (
                  <AlertBox>
                    <Anchor
                      inline
                      inherit
                      onClick={() => map?.locate({ enableHighAccuracy: true })}
                    >
                      Grant location access
                    </Anchor>{' '}
                    to show regions near you.
                  </AlertBox>
                )}
              </Stack>
            </Stack>
          </Collapse>
          <Collapse in={expandedSetting === 'comfort'} transitionDuration={100}>
            <Input.Wrapper
              label={
                expandedSetting === 'other' ? 'Select comfort level' : undefined
              }
            >
              <Stack
                spacing='xs'
                className='comfort-level'
                style={{ position: 'relative', zIndex: 0 }}
              >
                <SegmentedControl
                  fullWidth
                  value={selectedComfortLevel}
                  onChange={handleComfortLevelSelected}
                  transitionDuration={0}
                  styles={{
                    root: {
                      padding: 0,
                    },
                    indicator: {
                      marginLeft: 4,
                    },
                  }}
                  data={[
                    {
                      value: 'Low',
                      label: (
                        <Stack align='center' spacing={0}>
                          <Image src={LowComfortIcon} width='2rem' mih='2rem' />
                          Low
                        </Stack>
                      ),
                    },
                    {
                      value: 'Medium',
                      label: (
                        <Stack align='center' spacing={0}>
                          <Image
                            src={MediumComfortIcon}
                            width='2rem'
                            mih='2rem'
                          />
                          Medium
                        </Stack>
                      ),
                    },
                    {
                      value: 'High',
                      label: (
                        <Stack align='center' spacing={0}>
                          <Image
                            src={HighComfortIcon}
                            width='2rem'
                            mih='2rem'
                          />
                          High
                        </Stack>
                      ),
                    },
                    {
                      value: 'Shortest',
                      label: (
                        <Stack align='center' spacing={0}>
                          <IconRoute2 size='2rem' />
                          Shortest
                        </Stack>
                      ),
                    },
                    {
                      value: 'Custom',
                      label: (
                        <Stack align='center' spacing={0}>
                          <IconUserCog size='2rem' />
                          Custom
                        </Stack>
                      ),
                    },
                  ]}
                />
                {selectedComfortLevel === 'Custom' ? (
                  <>
                    <Checkbox
                      label='Prefer bike-friendly roads'
                      checked={routeOptions.preferBikeFriendly}
                      disabled={
                        routeOptions.preferCycleRoutes || routeOptions.shortest
                      }
                      onChange={(e) =>
                        updateRouteOptions({
                          preferBikeFriendly: e.currentTarget.checked,
                        })
                      }
                    />
                    <Checkbox
                      label='Prefer dedicated cycle routes'
                      checked={routeOptions.preferCycleRoutes}
                      disabled={routeOptions.shortest}
                      onChange={(e) =>
                        updateRouteOptions({
                          preferCycleRoutes: e.currentTarget.checked,
                          preferBikeFriendly: e.currentTarget.checked
                            ? true
                            : routeOptions.preferBikeFriendly,
                        })
                      }
                    />
                    <Checkbox
                      label='Find shortest available route'
                      checked={routeOptions.shortest}
                      onChange={(e) =>
                        updateRouteOptions({
                          shortest: e.currentTarget.checked,
                          preferBikeFriendly: e.currentTarget.checked
                            ? false
                            : routeOptions.preferBikeFriendly,
                          preferCycleRoutes: e.currentTarget.checked
                            ? false
                            : routeOptions.preferCycleRoutes,
                        })
                      }
                    />
                  </>
                ) : (
                  <ComfortLevel comfortLevel={selectedComfortLevel} />
                )}
              </Stack>
            </Input.Wrapper>
          </Collapse>
          <Collapse in={expandedSetting === 'other'} transitionDuration={100}>
            <Stack spacing='xs'>
              <Select
                label='Surface preference'
                value={routeOptions.surfacePreference || 'none'}
                onChange={(val) =>
                  updateRouteOptions({
                    surfacePreference: val as SurfacePreference,
                  })
                }
                data={[
                  { label: 'No preference', value: 'none' },
                  { label: 'Prefer paved surfaces', value: 'preferPaved' },
                  { label: 'Only use paved surfaces', value: 'strictPaved' },
                  {
                    label: 'Prefer unpaved surfaces',
                    value: 'preferUnpaved',
                  },
                ]}
                withinPortal
              />
              <Checkbox
                label='Show alternate routes'
                labelPosition='left'
                checked={showAlternateRoutes}
                onChange={(e) =>
                  setShowAlternateRoutes(e.currentTarget.checked)
                }
                disabled={routeOptions.shortest}
              />
            </Stack>
          </Collapse>
        </Stack>
      </Paper>
    </Stack>
  );
};

const ComfortLevel: React.FC<{ comfortLevel: string }> = React.memo(
  ({ comfortLevel }) => {
    let imgSrc;
    let description: string = '';
    let riderHint: string = '';
    switch (comfortLevel) {
      case 'High':
        imgSrc = HighComfortIcon;
        description =
          'Prioritizes avoiding car traffic, and primarily routes the user via dedicated cycling infrastructure.';
        riderHint = 'Seeks the most comfortable ride available';
        break;
      case 'Medium':
        imgSrc = MediumComfortIcon;
        description =
          'Prioritizes routing on bike-friendly roads, but may still route the user on some roads with light car traffic.';
        riderHint = 'Suitable for cyclists of most ages and abilities';
        break;
      case 'Low':
        imgSrc = LowComfortIcon;
        description =
          'Prioritizes arriving to the destination efficiently, and may route the user on roads with considerable car traffic.';
        riderHint = 'Suitable for experienced and risk-tolerant cyclists';
        break;
      case 'Shortest':
        description =
          'Prioritizes finding the shortest route available, and will likely route the user on roads with considerable car traffic.';
        riderHint = 'Only recommended if used while avoiding nogos';
        break;
    }

    return (
      <Paper radius='md' p='sm'>
        <Grid align='center' gutter={0} mih={100}>
          <Grid.Col span={5}>
            <div
              style={{ width: '60%', marginLeft: 'auto', marginRight: 'auto' }}
            >
              {comfortLevel === 'Shortest' ? (
                <IconRoute2 size='80%' />
              ) : (
                <Image src={imgSrc} />
              )}
            </div>
          </Grid.Col>
          <Grid.Col span={7}>
            <Title order={6} align='left'>
              {comfortLevel === 'Shortest'
                ? 'Shortest Available'
                : comfortLevel + ' Comfort'}
            </Title>
            <Text size='xs'>{description}</Text>
          </Grid.Col>
        </Grid>
        <Text align='center' size='xs' italic fw='bold'>
          {riderHint}
        </Text>
      </Paper>
    );
  }
);

const AlertBox: React.FC<{
  children: JSX.Element | JSX.Element[] | string | (JSX.Element | string)[];
  onClose?: () => void;
}> = ({ children, onClose }) => {
  return (
    <Alert
      icon={<IconAlertCircle size='1rem' />}
      color='gray'
      variant='outline'
      withCloseButton={!!onClose}
      onClose={onClose}
      styles={{
        root: {
          padding: '0.5rem 0.5rem 0.5rem 1rem',
          backgroundColor: 'transparent',
        },
        icon: {
          width: '1rem',
          height: '1rem',
          marginTop: 0,
        },
      }}
    >
      <Text size='xs' align='left'>
        {children}
      </Text>
    </Alert>
  );
};
