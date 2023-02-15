import React, { useState, useEffect } from 'react';
import { Stack, Paper, Group, ActionIcon, Tooltip, Text } from '@mantine/core';
import { IconEditCircle, IconEditCircleOff } from '@tabler/icons-react';

import { Region } from 'models';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarTitle } from '../common/SidebarTitle';

export const UserRegions: React.FC = () => {
  const {
    loggedInUser,
    regions,
    editingGroupOrRegion,
    setEditingGroupOrRegion,
  } = useGlobalContext();

  const [userRegions, setUserRegions] = useState<Region[]>([]);

  useEffect(() => {
    setUserRegions(
      regions.filter((region) =>
        region.isUserContributor(loggedInUser?._id || 'no user')
      )
    );
  }, [loggedInUser, regions]);

  return (
    <Stack spacing='xs'>
      <SidebarTitle
        title='Regions'
        tooltipLabel='You are a contributor to the regions listed below.'
      />
      {userRegions.map((region) => {
        const isEditing = editingGroupOrRegion?._id === region._id;
        return (
          <Paper>
            <Group position='apart'>
              <Text size='sm'>{region.name}</Text>
              <Group position='right'>
                {isEditing ? (
                  <Text size='sm' c='dimmed'>
                    {isEditing ? 'Editing' : 'Applied'}
                  </Text>
                ) : null}
                <Tooltip
                  label={isEditing ? 'Stop editing' : 'Edit Nogos'}
                  withArrow
                >
                  <ActionIcon
                    onClick={() =>
                      setEditingGroupOrRegion(isEditing ? null : region)
                    }
                    color={isEditing ? 'red' : undefined}
                  >
                    {isEditing ? (
                      <IconEditCircleOff size={18} />
                    ) : (
                      <IconEditCircle size={18} />
                    )}
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
};
