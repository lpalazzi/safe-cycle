import React, { useState } from 'react';
import {
  useMantineTheme,
  Stack,
  Checkbox,
  Input,
  SegmentedControl,
  Space,
  Tooltip,
  Grid,
  Image,
  Text,
  Paper,
  Title,
  Select,
  Switch,
  Group,
  ActionIcon,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import {
  IconChevronsDown,
  IconChevronsUp,
  IconInfoCircle,
  IconRoute2,
  IconUserCog,
} from '@tabler/icons-react';
import { RouteOptions, SurfacePreference } from 'types';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarTitle } from '../common/SidebarTitle';
import { AboutModal } from 'components/modals/AboutModal';

import LowComfortIcon from 'assets/comfortlevels/2-low.png';
import MediumComfortIcon from 'assets/comfortlevels/3-medium.png';
import HighComfortIcon from 'assets/comfortlevels/4-high.png';

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
    routeOptions,
    showAlternateRoutes,
    isMobileSize,
    isNavbarCondensed,
    toggleNavbarExpanded,
    updateRouteOptions,
    setShowAlternateRoutes,
  } = useGlobalContext();
  const { openModal } = useModals();
  const [comfortValue, setComfortValue] = useState('High');

  const handleComfortLevelSelected = (value: string) => {
    setComfortValue(value);
    if (value !== 'Custom') updateRouteOptions(comfortPresets[value]);
  };

  const condensed = (
    <Group position='apart'>
      <Group position='left' style={{ position: 'relative', zIndex: 0 }}>
        <Switch
          className='avoid-nogos'
          label='Avoid nogos'
          checked={routeOptions.avoidNogos}
          onChange={(e) =>
            updateRouteOptions({ avoidNogos: e.currentTarget.checked })
          }
        />
        <SegmentedControl
          value={comfortValue}
          onChange={handleComfortLevelSelected}
          radius='xl'
          size='xs'
          styles={{
            label: { padding: '0.375rem', fontSize: 0 },
            indicator: { translate: '0.5px 0' },
          }}
          data={[
            {
              value: 'Low',
              label: <Image src={LowComfortIcon} width='1.5rem' mih='1.5rem' />,
            },
            {
              value: 'Medium',
              label: (
                <Image src={MediumComfortIcon} width='1.5rem' mih='1.5rem' />
              ),
            },
            {
              value: 'High',
              label: (
                <Image src={HighComfortIcon} width='1.5rem' mih='1.5rem' />
              ),
            },
            {
              value: 'Shortest',
              label: <IconRoute2 size={20} />,
            },
          ]}
        />
      </Group>
      <ActionIcon onClick={toggleNavbarExpanded} size='lg'>
        <IconChevronsDown color='black' size={26} />
      </ActionIcon>
    </Group>
  );

  const expanded = (
    <Stack spacing='xs'>
      <Group position='apart'>
        <SidebarTitle title='Route Preferences' />
        {isMobileSize ? (
          <ActionIcon onClick={toggleNavbarExpanded} size='lg'>
            <IconChevronsUp color='black' size={26} />
          </ActionIcon>
        ) : (
          <div></div>
        )}
      </Group>
      <Switch
        className='avoid-nogos'
        label={
          <div style={{ display: 'flex' }}>
            Avoid nogos
            <Space w='xs' />
            <Tooltip
              withArrow
              label='What are nogos?'
              transitionProps={{
                transition: 'fade',
                duration: 200,
              }}
            >
              <IconInfoCircle
                size={16}
                style={{
                  lineHeight: 1.55,
                  margin: 'auto',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  openModal(AboutModal('nogos', isMobileSize));
                }}
              />
            </Tooltip>
          </div>
        }
        checked={routeOptions.avoidNogos}
        onChange={(e) =>
          updateRouteOptions({ avoidNogos: e.currentTarget.checked })
        }
      />
      <Stack
        spacing='xs'
        className='comfort-level'
        style={{ position: 'relative', zIndex: 0 }}
      >
        <Input.Wrapper label='Select a comfort level'>
          <SegmentedControl
            fullWidth
            value={comfortValue}
            onChange={handleComfortLevelSelected}
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
                    <Image src={MediumComfortIcon} width='2rem' mih='2rem' />
                    Medium
                  </Stack>
                ),
              },
              {
                value: 'High',
                label: (
                  <Stack align='center' spacing={0}>
                    <Image src={HighComfortIcon} width='2rem' mih='2rem' />
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
        </Input.Wrapper>
        {comfortValue === 'Custom' ? (
          <>
            <Checkbox
              label='Prefer bike-friendly roads'
              checked={routeOptions.preferBikeFriendly}
              disabled={routeOptions.preferCycleRoutes || routeOptions.shortest}
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
          <ComfortLevel comfortLevel={comfortValue} />
        )}
      </Stack>
      <Stack spacing='xs' className='additional-preferences'>
        <Input.Wrapper label='Surface preference'>
          <Select
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
              { label: 'Prefer unpaved surfaces', value: 'preferUnpaved' },
            ]}
          />
        </Input.Wrapper>
        <Checkbox
          label='Show alternate routes'
          checked={showAlternateRoutes}
          onChange={(e) => setShowAlternateRoutes(e.currentTarget.checked)}
          disabled={routeOptions.shortest}
        />
      </Stack>
    </Stack>
  );

  return isNavbarCondensed ? condensed : expanded;
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
      <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
        <Title order={6} align='center'>
          {comfortLevel === 'Shortest'
            ? 'Shortest Available'
            : comfortLevel + ' Comfort'}
        </Title>
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
            <Text size='sm'>{description}</Text>
          </Grid.Col>
        </Grid>
        <Text align='center' size='sm' italic fw='bold'>
          {riderHint}
        </Text>
      </Paper>
    );
  }
);
