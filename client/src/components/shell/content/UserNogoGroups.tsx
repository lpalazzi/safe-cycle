import React, { useEffect, useState } from 'react';
import {
  Stack,
  Paper,
  Group,
  ActionIcon,
  Menu,
  Button,
  Alert,
  Tooltip,
  Text,
} from '@mantine/core';
import { openModal, openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import {
  IconPlus,
  IconDots,
  IconTrash,
  IconInfoCircle,
  IconX,
  IconSettings,
  IconEditCircle,
  IconEditCircleOff,
} from '@tabler/icons-react';

import { NogoGroup } from 'models';
import { NogoGroupApi } from 'api';
import { useGlobalContext } from 'contexts/globalContext';
import { EditNogoGroupModal } from 'components/modals/EditNogoGroupModal';
import { NewNogoGroupModal } from 'components/modals/NewNogoGroupModal';
import { SidebarTitle } from '../common/SidebarTitle';

export const UserNogoGroups: React.FC = () => {
  const {
    loggedInUser,
    selectedNogoGroups,
    editingGroupOrRegion,
    selectNogoGroup,
    deselectNogoGroup,
    setEditingGroupOrRegion,
  } = useGlobalContext();

  const [userNogoGroups, setUserNogoGroups] = useState<NogoGroup[]>([]);

  useEffect(() => {
    refreshData();
  }, [loggedInUser]);

  const refreshData = async () => {
    try {
      const fetchedUserNogoGroups = await NogoGroupApi.getAllForUser();
      setUserNogoGroups(fetchedUserNogoGroups);
      const editingNogoGroupWasDeleted = !fetchedUserNogoGroups.some(
        (nogoGroup) => nogoGroup._id === editingGroupOrRegion?._id
      );
      if (editingNogoGroupWasDeleted) {
        setEditingGroupOrRegion(null);
      }
    } catch (error: any) {
      if (error.message === 'User is not logged in') {
        setUserNogoGroups([]);
        return;
      }
      showNotification({
        title: 'Error fetching Nogo Group data',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  const handleDeleteUserNogoGroup = (nogoGroup: NogoGroup) => {
    openConfirmModal({
      title: `Delete ${nogoGroup.name}`,
      children: (
        <Text size='sm'>
          Are you sure you want to delete this Nogo Group? All Nogos saved in
          this list will be deleted.
        </Text>
      ),
      labels: { confirm: 'Delete Nogo Group', cancel: "No don't delete it" },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        NogoGroupApi.delete(nogoGroup._id)
          .then((deleteResult) => {
            showNotification({
              message: deleteResult.nogoGroupDeleted
                ? `Nogo Group with ${deleteResult.nogosDeleted} Nogo${
                    deleteResult.nogosDeleted === 1 ? '' : 's'
                  } was deleted.`
                : 'Nogo Group was not deleted.',
              color: deleteResult.nogoGroupDeleted ? 'green' : 'red',
            });
            refreshData();
          })
          .catch((error) => {
            showNotification({
              title: 'Error deleting Nogo Group',
              message: error.message || 'Undefined error',
              color: 'red',
            });
            refreshData();
          });
      },
    });
  };

  return (
    <Stack spacing='xs'>
      <SidebarTitle
        title='Custom Nogo Groups'
        tooltipLabel='Add and edit custom Nogos to apply to your own routes.'
      />
      {!!loggedInUser ? (
        <>
          {userNogoGroups.map((nogoGroup) => {
            const isEditing = editingGroupOrRegion?._id === nogoGroup._id;
            const alreadySelected = selectedNogoGroups.includes(nogoGroup._id);
            return (
              <Paper>
                <Group position='apart'>
                  <Text size='sm'>{nogoGroup.name}</Text>
                  <Group position='right'>
                    {alreadySelected || isEditing ? (
                      <Text size='sm' c='dimmed'>
                        {isEditing ? 'Editing' : 'Applied'}
                      </Text>
                    ) : null}
                    {!isEditing ? (
                      <Tooltip
                        label={alreadySelected ? 'Remove' : 'Apply'}
                        withArrow
                      >
                        <ActionIcon
                          onClick={() =>
                            alreadySelected
                              ? deselectNogoGroup(nogoGroup._id)
                              : selectNogoGroup(nogoGroup._id)
                          }
                        >
                          {alreadySelected ? (
                            <IconX size={18} />
                          ) : (
                            <IconPlus size={18} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    ) : null}
                    <Menu position='left-start'>
                      <Menu.Target>
                        <ActionIcon>
                          <IconDots size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          icon={
                            isEditing ? (
                              <IconEditCircleOff size={14} />
                            ) : (
                              <IconEditCircle size={14} />
                            )
                          }
                          onClick={() =>
                            setEditingGroupOrRegion(
                              isEditing ? null : nogoGroup
                            )
                          }
                        >
                          {isEditing ? 'Stop editing Nogos' : 'Edit Nogos'}
                        </Menu.Item>
                        <Menu.Item
                          icon={<IconSettings size={14} />}
                          onClick={() =>
                            openModal(
                              EditNogoGroupModal(nogoGroup, refreshData)
                            )
                          }
                        >
                          Edit list properties
                        </Menu.Item>
                        <Menu.Item
                          icon={<IconTrash size={14} />}
                          color='red'
                          onClick={() => handleDeleteUserNogoGroup(nogoGroup)}
                        >
                          Delete Nogo Group
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>
              </Paper>
            );
          })}
          <Button
            variant='light'
            leftIcon={<IconPlus size={18} />}
            onClick={() =>
              openModal({ ...NewNogoGroupModal, onClose: refreshData })
            }
          >
            Create new Nogo Group
          </Button>
        </>
      ) : (
        <Alert icon={<IconInfoCircle size={16} />} color='gray'>
          Please sign in to add your own Nogos
        </Alert>
      )}
    </Stack>
  );
};
