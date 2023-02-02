import React from 'react';
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
  IconCheck,
  IconPlus,
  IconDots,
  IconRoadOff,
  IconEdit,
  IconTrash,
  IconInfoCircle,
} from '@tabler/icons-react';

import { NogoGroup } from 'models';
import { NogoGroupApi } from 'api';
import { useGlobalContext } from 'contexts/globalContext';
import { EditNogoGroupModal } from 'components/modals/EditNogoGroupModal';
import { NewNogoGroupModal } from 'components/modals/NewNogoGroupModal';
import { SidebarTitle } from '../common/SidebarTitle';

type UserNogoGroupsProps = {
  userNogoGroups: NogoGroup[];
  refreshData: () => void;
};

export const UserNogoGroups: React.FC<UserNogoGroupsProps> = ({
  userNogoGroups,
  refreshData,
}) => {
  const {
    loggedInUser,
    selectedNogoGroups,
    editingNogoGroup,
    selectNogoGroup,
    setEditingNogoGroup,
  } = useGlobalContext();

  const handleEditNogoGroup = (nogoGroup: NogoGroup | null) => {
    setEditingNogoGroup(nogoGroup);
  };

  const handleEditUserNogoGroup = (nogoGroup: NogoGroup) => {
    openModal(EditNogoGroupModal(nogoGroup, refreshData));
  };

  const handleCreateUserNogoGroup = () => {
    openModal({ ...NewNogoGroupModal, onClose: refreshData });
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
        title='Your Nogo Groups'
        tooltipLabel='Add and edit custom Nogo Groups. Nogo Groups added here are available to all users to use with their cycling routes.'
      />
      {!!loggedInUser ? (
        <>
          {userNogoGroups.map((nogoGroup) => {
            const isEditing = editingNogoGroup?._id === nogoGroup._id;
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
                    {alreadySelected ? (
                      <IconCheck size={18} color='grey' />
                    ) : (
                      <Tooltip label='Apply' withArrow hidden={alreadySelected}>
                        <ActionIcon
                          disabled={alreadySelected}
                          onClick={() => selectNogoGroup(nogoGroup._id)}
                        >
                          <IconPlus size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    <Menu position='right-end' offset={24}>
                      <Menu.Target>
                        <ActionIcon>
                          <IconDots size={18} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          icon={<IconRoadOff size={14} />}
                          onClick={() =>
                            handleEditNogoGroup(isEditing ? null : nogoGroup)
                          }
                        >
                          {isEditing ? 'Stop editing Nogos' : 'Edit Nogos'}
                        </Menu.Item>
                        <Menu.Item
                          icon={<IconEdit size={14} />}
                          onClick={() => handleEditUserNogoGroup(nogoGroup)}
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
            onClick={handleCreateUserNogoGroup}
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
