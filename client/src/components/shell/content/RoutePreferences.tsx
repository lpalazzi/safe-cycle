import React, { useEffect, useMemo, useState } from 'react';
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
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import { useMediaQuery } from '@mantine/hooks';
import { IconRoute2, IconSettings, IconUserCog } from '@tabler/icons-react';
import { ComfortLevel, ID, RouteOptions, SurfacePreference } from 'types';
import { useGlobalContext } from 'contexts/globalContext';

import LowComfortIcon from 'assets/comfortlevels/2-low.png';
import MediumComfortIcon from 'assets/comfortlevels/3-medium.png';
import HighComfortIcon from 'assets/comfortlevels/4-high.png';
import { SelectNogosModal } from 'components/modals/SelectNogosModal/SelectNogosModal';
import { useMapContext } from 'contexts/mapContext';
import { NogoGroup, Region } from 'models';

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

// TODO:
//   - see drawings for new design
//   - hide regions with less than 5km of nogos
export const RoutePreferences: React.FC = () => {
  const {
    routeOptions,
    selectedComfortLevel,
    showAlternateRoutes,
    isMobileSize,
    selectedNogoGroups,
    selectedRegions,
    regions,
    userNogoGroups,
    setSelectedComfortLevel,
    setSelectedNogoGroups,
    setSelectedRegions,
    updateRouteOptions,
    setShowAlternateRoutes,
    getLocationSortedRegions,
    getLengthSortedRegions,
  } = useGlobalContext();
  const { currentLocation } = useMapContext();
  const { openModal } = useModals();
  const theme = useMantineTheme();
  const isSmallWidth = useMediaQuery('(max-width: 382px)');
  const isExtraSmallWidth = useMediaQuery('(max-width: 363px)');
  const [suggestedRegions, setSuggestedRegions] = useState<Region[]>([]);
  const [suggestedNogoGroups, setSuggestedNogoGroups] = useState<NogoGroup[]>(
    []
  );
  const [expandedSetting, setExpandedSetting] = useState<
    'nogos' | 'comfort' | 'other' | false
  >(false);

  const chips = useMemo(
    () =>
      [
        ...suggestedNogoGroups.map((group) => ({
          label: group.name,
          value: group._id,
          isRegion: false,
        })),
        ...suggestedRegions.map((region) => ({
          label: region.shortName,
          value: region._id,
          isRegion: true,
        })),
      ].slice(0, 5),
    [suggestedRegions, suggestedNogoGroups, isMobileSize]
  );

  useEffect(() => {
    const allSelectedNogoGroupsInSuggestedNogoGroups = selectedNogoGroups.every(
      (id) => chips.some((chip) => chip.value === id)
    );
    if (allSelectedNogoGroupsInSuggestedNogoGroups) return;
    setSuggestedNogoGroups(
      userNogoGroups.filter((group) => selectedNogoGroups.includes(group._id))
    );
  }, [userNogoGroups, selectedNogoGroups]);

  useEffect(() => {
    const allSelectedRegionsInSuggestedRegions =
      selectedRegions.length > 0 &&
      selectedRegions.every((id) => chips.some((chip) => chip.value === id));
    if (allSelectedRegionsInSuggestedRegions) return;
    const selectedRegionObjs = regions.filter((region) =>
      selectedRegions.includes(region._id)
    );
    if (selectedRegionObjs.length >= 4) {
      setSuggestedRegions(selectedRegionObjs);
    } else if (currentLocation) {
      const locationSortedRegions = getLocationSortedRegions(currentLocation);
      const regionsToSuggest = [
        ...selectedRegionObjs,
        ...locationSortedRegions.filter(
          (region) => !selectedRegions.includes(region._id)
        ),
      ];
      setSuggestedRegions(regionsToSuggest);
    } else {
      getLengthSortedRegions().then((lengthSortedRegions) => {
        const regionsToSuggest = [
          ...selectedRegionObjs,
          ...lengthSortedRegions.filter(
            (region) => !selectedRegions.includes(region._id)
          ),
        ];
        setSuggestedRegions(regionsToSuggest);
      });
    }
  }, [regions, currentLocation, selectedRegions]);

  const handleRegionChipToggled = (id: ID, isRegion: boolean) => {
    if (isRegion) {
      if (selectedRegions.includes(id)) {
        setSelectedRegions(
          [...selectedRegions].filter((region) => region !== id)
        );
      } else {
        setSelectedRegions([...selectedRegions, id]);
      }
    } else {
      if (selectedNogoGroups.includes(id)) {
        setSelectedNogoGroups(
          [...selectedNogoGroups].filter((group) => group !== id)
        );
      } else {
        setSelectedNogoGroups([...selectedNogoGroups, id]);
      }
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

  const selectedGroupsOrRegions =
    selectedRegions.length + selectedNogoGroups.length;

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

  return (
    <Stack justify='flex-start' spacing='xs'>
      <Button.Group ml='auto' mr='auto' w='100%'>
        <Button
          fullWidth
          variant={expandedSetting === 'nogos' ? 'filled' : 'default'}
          size='xs'
          onClick={() => handleCondensedSettingButtonClicked('nogos')}
          rightIcon={
            <Badge
              color={selectedGroupsOrRegions > 0 ? 'green' : 'gray'}
              w={14}
              h={14}
              sx={{ pointerEvents: 'none' }}
              variant='filled'
              size='xs'
              p={0}
            >
              {selectedGroupsOrRegions}
            </Badge>
          }
        >
          Avoid nogos
        </Button>
        <Button
          fullWidth
          variant={expandedSetting === 'comfort' ? 'filled' : 'default'}
          size='xs'
          onClick={() => handleCondensedSettingButtonClicked('comfort')}
          rightIcon={selectedComfortLevelIcon}
        >
          Comfort level
        </Button>
        <Button
          fullWidth
          variant={expandedSetting === 'other' ? 'filled' : 'default'}
          size='xs'
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
          <Collapse in={expandedSetting === 'nogos'}>
            <Input.Wrapper
              label={
                expandedSetting === 'other'
                  ? 'Select nogos to avoid'
                  : undefined
              }
            >
              <Group position='left' spacing='0.25rem'>
                {chips.map((chip) => {
                  const isSelected = [
                    ...selectedNogoGroups,
                    ...selectedRegions,
                  ].includes(chip.value);
                  return (
                    <Chip
                      size='xs'
                      checked={isSelected}
                      onChange={() =>
                        handleRegionChipToggled(chip.value, chip.isRegion)
                      }
                      styles={{ root: { height: 26 } }}
                    >
                      {chip.label}
                    </Chip>
                  );
                })}
                <Chip
                  size='xs'
                  checked={false}
                  variant='light'
                  onChange={() =>
                    openModal(SelectNogosModal(isMobileSize, 'regions'))
                  }
                >
                  More
                </Chip>
              </Group>
            </Input.Wrapper>
          </Collapse>
          <Collapse in={expandedSetting === 'comfort'}>
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
          <Collapse in={expandedSetting === 'other'}>
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
    const theme = useMantineTheme();

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
