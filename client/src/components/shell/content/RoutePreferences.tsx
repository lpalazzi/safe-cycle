import React from 'react';
import {
  Stack,
  Checkbox,
  Input,
  SegmentedControl,
  Space,
  Tooltip,
  Grid,
  Image,
  Text,
  Title,
  Paper,
  useMantineTheme,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import { IconInfoCircle } from '@tabler/icons-react';
import { RouteOptions } from 'types';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarTitle } from '../common/SidebarTitle';
import { AboutModal } from 'components/modals/AboutModal';

import LowComfortIcon from 'assets/comfortlevels/2-low.png';
import MediumComfortIcon from 'assets/comfortlevels/3-medium.png';
import HighComfortIcon from 'assets/comfortlevels/4-high.png';

export const RoutePreferences: React.FC = () => {
  const { routeOptions, isMobileSize, updateRouteOptions } = useGlobalContext();
  const { openModal } = useModals();

  return (
    <Stack spacing='xs'>
      <SidebarTitle title='Route Preferences' />
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
                style={{ lineHeight: 1.55, margin: 'auto', cursor: 'pointer' }}
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
        disabled={routeOptions.preferCycleRoutes}
        onChange={(e) =>
          updateRouteOptions({ preferBikeFriendly: e.currentTarget.checked })
        }
      />
      <Checkbox
        label='Prefer dedicated cycle routes'
        checked={routeOptions.preferCycleRoutes}
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
        label='Prefer paved routes'
        checked={routeOptions.surfacePreference === 'preferPaved'}
        onChange={(e) =>
          updateRouteOptions({
            surfacePreference: e.currentTarget.checked ? 'preferPaved' : 'none',
          })
        }
      />
      <ComfortLevel routeOptions={routeOptions} />
      <Input.Wrapper label='Use an alternative route'>
        <SegmentedControl
          fullWidth
          value={(routeOptions.alternativeidx ?? 0).toString()}
          onChange={(val) =>
            updateRouteOptions({
              alternativeidx: Number(val) as 0 | 1 | 2 | 3,
            })
          }
          data={[
            { label: 'Default', value: '0' },
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
          ]}
        />
      </Input.Wrapper>
    </Stack>
  );
};

const ComfortLevel: React.FC<{ routeOptions: RouteOptions }> = ({
  routeOptions,
}) => {
  const theme = useMantineTheme();
  const comfortLevel = routeOptions.preferCycleRoutes
    ? 'High'
    : routeOptions.preferBikeFriendly
    ? 'Medium'
    : 'Low';

  let imgSrc;
  let description: string;
  switch (comfortLevel) {
    case 'High':
      imgSrc = HighComfortIcon;
      description =
        'Prioritizes avoiding car traffic, and primarily routes the user via dedicated cycling infrastructure.';
      break;
    case 'Medium':
      imgSrc = MediumComfortIcon;
      description =
        'Makes an effort to avoid busy roads, but may still route the user on roads with low car traffic.';
      break;
    case 'Low':
      imgSrc = LowComfortIcon;
      description =
        'Prioritizes arriving to the destination efficiently, and may route the user on roads with considerable car traffic.';
      break;
  }

  return (
    <Paper shadow='sm' radius='md' p='sm' bg={theme.colors.gray[3]}>
      <Title order={6} align='center'>
        Comfort level based on selected preferences
      </Title>
      <Grid align='center' gutter={0} mih={120}>
        <Grid.Col span={5}>
          <Stack spacing={0} align='center'>
            <div
              style={{ width: '60%', marginLeft: 'auto', marginRight: 'auto' }}
            >
              <Image src={imgSrc} />
            </div>
            <Text size='sm'>{comfortLevel + ' Comfort'}</Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={7}>
          <Text size='sm'>{description}</Text>
        </Grid.Col>
      </Grid>
      {comfortLevel === 'Low' ? (
        <Text align='center' size='sm' italic fw='bold'>
          Only recommended for experienced cyclists
        </Text>
      ) : null}
    </Paper>
  );
};
