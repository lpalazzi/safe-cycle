import React, { useEffect, useState } from 'react';
import {
  Button,
  Group,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { NogoGroup } from 'models';
import { IconExclamationCircle, IconPlus } from '@tabler/icons-react';
import { ID } from 'types';
import { openModal } from '@mantine/modals';
import { NogoGroupApi } from 'api';
import { showNotification } from '@mantine/notifications';
import { LoginModal } from '../LoginModal';
import { SignupModal } from '../SignupModal';
import { NogoGroupCard } from './NogoGroupCard';
import { SelectNogosModal } from './SelectNogosModal';

export const NogoGroups: React.FC<{
  unsavedSelectedNogoGroups: ID[];
  toggleNogoGroup: (id: ID) => void;
  clearSelectedNogoGroups: () => void;
}> = ({
  unsavedSelectedNogoGroups,
  toggleNogoGroup,
  clearSelectedNogoGroups,
}) => {
  const theme = useMantineTheme();
  const { loggedInUser, isMobileSize } = useGlobalContext();
  const [userNogoGroups, setUserNogoGroups] = useState<NogoGroup[]>([]);

  const refreshUserNogoGroups = () => {
    if (!loggedInUser) {
      setUserNogoGroups([]);
    } else {
      NogoGroupApi.getAllForUser().then(setUserNogoGroups);
    }
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
        {!!loggedInUser && (
          <Group position='apart' noWrap h={26}>
            <Text>Your nogos</Text>
            {unsavedSelectedNogoGroups.length > 0 && (
              <Button
                variant='outline'
                compact
                onClick={clearSelectedNogoGroups}
              >
                Clear
              </Button>
            )}
          </Group>
        )}
        {!!loggedInUser && userNogoGroups.length === 0 && (
          <Text align='center' size='sm'>
            <IconExclamationCircle
              size={20}
              style={{ verticalAlign: 'text-bottom' }}
            />{' '}
            You have no custom nogos yet. Create a group to get started.
          </Text>
        )}
        {!loggedInUser && (
          <>
            <Text align='center' size='sm'>
              <IconExclamationCircle
                size={20}
                style={{ verticalAlign: 'text-bottom' }}
              />{' '}
              You must have an account to add your own nogos.
            </Text>
            <Group position='center' maw={356} w='100%' m='auto' grow>
              <Button
                onClick={() =>
                  openModal(
                    LoginModal(SelectNogosModal(isMobileSize, 'custom'))
                  )
                }
              >
                Sign in
              </Button>
              <Button
                onClick={() =>
                  openModal(
                    SignupModal(SelectNogosModal(isMobileSize, 'custom'))
                  )
                }
              >
                Create account
              </Button>
            </Group>
          </>
        )}
        {!!loggedInUser && (
          <Stack spacing='sm' align='stretch' justify='flext-start'>
            {userNogoGroups.map((nogoGroup) => (
              <NogoGroupCard
                key={nogoGroup._id}
                nogoGroup={nogoGroup}
                isSelected={unsavedSelectedNogoGroups.includes(nogoGroup._id)}
                toggleSelect={() => toggleNogoGroup(nogoGroup._id)}
                onNogoGroupUpdated={refreshUserNogoGroups}
              />
            ))}
            <Button
              variant='outline'
              fullWidth
              h={60}
              leftIcon={<IconPlus size={18} />}
              onClick={() => createNewNogoGroup()}
            >
              Create a new Nogo Group
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
