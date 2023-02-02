import React from 'react';
import { Stack, Paper, Group, ActionIcon, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

import { NogoGroup } from 'models';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarTitle } from '../common/SidebarTitle';

type AppliedNogosProps = {
  allPublicNogoGroups: NogoGroup[];
  userNogoGroups: NogoGroup[];
};

export const AppliedNogos: React.FC<AppliedNogosProps> = ({
  allPublicNogoGroups,
  userNogoGroups,
}) => {
  const { selectedNogoGroups, deselectNogoGroup } = useGlobalContext();

  return (
    <Stack spacing='xs'>
      <SidebarTitle
        title='Applied Nogos'
        tooltipLabel='These Nogo Groups are currently applied to your routes. Routes will avoid the paths defined in each Nogo Group that is applied.'
      />
      {selectedNogoGroups.length > 0 ? (
        selectedNogoGroups.map((nogoGroupId) => {
          const nogoGroup = [...allPublicNogoGroups, ...userNogoGroups].find(
            (nogoGroup) => nogoGroup._id === nogoGroupId
          );

          return !!nogoGroup ? (
            <Paper>
              <Group position='apart'>
                <Stack spacing={0}>
                  <Text size='sm'>{nogoGroup.name}</Text>
                  <Text size='xs' opacity={0.65}>
                    {'Contributed by ' + nogoGroup.creator}
                  </Text>
                </Stack>
                <ActionIcon onClick={() => deselectNogoGroup(nogoGroup._id)}>
                  <IconX size={18} />
                </ActionIcon>
              </Group>
            </Paper>
          ) : null;
        })
      ) : (
        <Paper>
          <Text size='sm'>You have no Nogo Groups applied.</Text>
        </Paper>
      )}
    </Stack>
  );
};
