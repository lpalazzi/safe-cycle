import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
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
}> = ({ unsavedSelectedNogoGroups, toggleNogoGroup }) => {
  const { userNogoGroups, loggedInUser, isMobileSize, refreshUserNogoGroups } =
    useGlobalContext();

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

  return (
    <Stack spacing='sm' align='stretch' justify='flext-start'>
      {!!loggedInUser && userNogoGroups.length === 0 && (
        <Text align='center' size='sm'>
          <IconExclamationCircle
            size={20}
            style={{ verticalAlign: 'text-bottom' }}
          />{' '}
          You have no custom nogos yet. Create a group to get started.
        </Text>
      )}
      {loggedInUser ? (
        <>
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
        </>
      ) : (
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
              variant='outline'
              onClick={() =>
                openModal(LoginModal(SelectNogosModal(isMobileSize)))
              }
            >
              Sign in
            </Button>
            <Button
              variant='outline'
              onClick={() =>
                openModal(SignupModal(SelectNogosModal(isMobileSize)))
              }
            >
              Create account
            </Button>
          </Group>
        </>
      )}
    </Stack>
  );
};
