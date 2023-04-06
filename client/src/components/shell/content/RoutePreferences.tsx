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
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import { IconInfoCircle, IconUserCog } from '@tabler/icons-react';
import { RouteOptions, SurfacePreference } from 'types';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarTitle } from '../common/SidebarTitle';
import { AboutModal } from 'components/modals/AboutModal';

import LowestComfortIcon from 'assets/comfortlevels/1-lowest.png';
import LowComfortIcon from 'assets/comfortlevels/2-low.png';
import MediumComfortIcon from 'assets/comfortlevels/3-medium.png';
import HighComfortIcon from 'assets/comfortlevels/4-high.png';

const comfortPresets: { [key: string]: Partial<RouteOptions> } = {
  Lowest: {
    avoidNogos: false,
    shortest: true,
    preferBikeFriendly: false,
    preferCycleRoutes: false,
  },
  Low: {
    avoidNogos: false,
    shortest: false,
    preferBikeFriendly: false,
    preferCycleRoutes: false,
  },
  Medium: {
    avoidNogos: true,
    shortest: false,
    preferBikeFriendly: true,
    preferCycleRoutes: false,
  },
  High: {
    avoidNogos: true,
    shortest: false,
    preferBikeFriendly: true,
    preferCycleRoutes: true,
  },
};

export const RoutePreferences: React.FC = () => {
  const { routeOptions, isMobileSize, updateRouteOptions } = useGlobalContext();
  const { openModal } = useModals();
  const [comfortValue, setComfortValue] = useState('Medium');

  const handleComfortLevelSelected = (value: string) => {
    setComfortValue(value);
    if (value !== 'Custom') updateRouteOptions(comfortPresets[value]);
  };

  return (
    <Stack spacing='xs'>
      <SidebarTitle title='Route Preferences' />
      <Input.Wrapper label='Select a comfort level'>
        <SegmentedControl
          fullWidth
          value={comfortValue}
          onChange={handleComfortLevelSelected}
          data={[
            {
              value: 'Lowest',
              label: (
                <Stack align='center' spacing={0}>
                  <Image src={LowestComfortIcon} width='2rem' mih='2rem' />
                  Lowest
                </Stack>
              ),
            },
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
            label={
              <div style={{ display: 'flex' }}>
                Avoid nogos
                <Space w='xs' />
                <Tooltip
                  withArrow
                  transition='fade'
                  transitionDuration={200}
                  label='Learn more'
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
                      openModal(AboutModal('about', isMobileSize));
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
      <Input.Wrapper label='Surface preference'>
        <Select
          value={routeOptions.surfacePreference || 'none'}
          onChange={(val) =>
            updateRouteOptions({
              surfacePreference: val as SurfacePreference,
            })
          }
          data={[
            { label: 'Prefer paved surfaces', value: 'preferPaved' },
            { label: 'Only use paved surfaces', value: 'strictPaved' },
            { label: 'Prefer unpaved surfaces', value: 'preferUnpaved' },
            { label: 'No preference', value: 'none' },
          ]}
        />
      </Input.Wrapper>
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
          'Prioritizes avoiding car traffic and nogos, and primarily routes the user via dedicated cycling infrastructure.';
        riderHint = 'Suitable for cyclists of all ages and abilities';
        break;
      case 'Medium':
        imgSrc = MediumComfortIcon;
        description =
          'Makes an effort to avoid busy roads and nogos, but may still route the user on roads with light car traffic.';
        riderHint = 'Suitable for cyclists of most ages and abilities';
        break;
      case 'Low':
        imgSrc = LowComfortIcon;
        description =
          'Prioritizes arriving to the destination efficiently, and may route the user on roads with considerable car traffic.';
        riderHint = 'Suitable for experienced cyclists';
        break;
      case 'Lowest':
        imgSrc = LowestComfortIcon;
        description =
          'Prioritizes finding the shortest route available, and will likely route the user on roads with considerable car traffic.';
        riderHint = 'Only recommended for experienced cyclists';
        break;
    }

    return (
      <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[1]}>
        <Title order={6} align='center'>
          {comfortLevel + ' Comfort'}
        </Title>
        <Grid align='center' gutter={0} mih={100}>
          <Grid.Col span={5}>
            <div
              style={{ width: '60%', marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Image src={imgSrc} />
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
