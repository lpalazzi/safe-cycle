import React from 'react';
import { Stack, Checkbox, Input, SegmentedControl } from '@mantine/core';
import { SidebarTitle } from '../common/SidebarTitle';
import { useGlobalContext } from 'contexts/globalContext';

export const RoutePreferences: React.FC = () => {
  const { routeOptions, updateRouteOptions } = useGlobalContext();
  return (
    <Stack spacing='xs'>
      <SidebarTitle title='Route Preferences' />
      <Checkbox
        label='Avoid low-comfort roads'
        checked={routeOptions.avoidLowComfort}
        onChange={(e) =>
          updateRouteOptions({ avoidLowComfort: e.currentTarget.checked })
        }
      />
      <Checkbox
        label='Avoid main roads'
        checked={routeOptions.avoidMainRoads}
        onChange={(e) =>
          updateRouteOptions({ avoidMainRoads: e.currentTarget.checked })
        }
      />
      <Checkbox
        label='Prefer cycle routes and trails'
        checked={routeOptions.stickToCycleRoutes}
        onChange={(e) =>
          updateRouteOptions({ stickToCycleRoutes: e.currentTarget.checked })
        }
      />
      <Checkbox
        label='Prefer paved routes'
        checked={routeOptions.preferPaved}
        onChange={(e) =>
          updateRouteOptions({ preferPaved: e.currentTarget.checked })
        }
      />
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
