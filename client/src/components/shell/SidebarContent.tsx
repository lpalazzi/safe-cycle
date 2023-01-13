import {
  Title,
  Stack,
  Text,
  SelectItem,
  Select,
  Divider,
  Paper,
  ActionIcon,
  Group,
  Tooltip,
  Menu,
  Button,
  Alert,
} from '@mantine/core';
import { openConfirmModal, openModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconDots,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconRoadOff,
  IconTrash,
  IconX,
} from '@tabler/icons';
import { NogoGroupApi } from 'api';
import { EditNogoGroupModal } from 'components/modals/EditNogoGroupModal';
import { NewNogoGroupModal } from 'components/modals/NewNogoGroupModal';
import { useGlobalContext } from 'contexts/globalContext';
import { NogoGroup } from 'models';
import React, { forwardRef, useEffect, useState } from 'react';

export const SidebarContent: React.FC = () => {
  const {
    loggedInUser,
    selectedNogoGroups,
    editingNogoGroup,
    selectNogoGroup,
    deselectNogoGroup,
    setEditingNogoGroup,
  } = useGlobalContext();

  const [allNogoGroups, setAllNogoGroups] = useState<NogoGroup[]>([]);
  const [userNogoGroups, setUserNogoGroups] = useState<NogoGroup[]>([]);

  useEffect(() => {
    if (loggedInUser) {
      refreshData();
    }
  }, [loggedInUser]);

  const refreshData = () => {
    try {
      NogoGroupApi.getAll().then(setAllNogoGroups);
      NogoGroupApi.getAllForUser().then((fetchedUserNogoGroups) => {
        setUserNogoGroups(fetchedUserNogoGroups);
        const editingNogoGroupWasDeleted = !fetchedUserNogoGroups.some(
          (nogoGroup) => nogoGroup._id === editingNogoGroup?._id
        );
        if (editingNogoGroupWasDeleted) {
          setEditingNogoGroup(null);
        }
      });
    } catch (error: any) {
      showNotification({
        title: 'Error fetching Nogo Group data',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  const handleEditNogoGroup = (nogoGroup: NogoGroup | null) => {
    setEditingNogoGroup(nogoGroup);
  };

  const handleEditUserNogoGroup = (nogoGroup: NogoGroup) => {
    openModal(EditNogoGroupModal(nogoGroup, refreshData));
  };

  const handleCreateUserNogoGroup = () => {
    // open modal
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

  const allNogoGroupOptions: SelectItem[] = allNogoGroups
    .filter((nogoGroup) => !selectedNogoGroups.includes(nogoGroup._id))
    .map((nogoGroup) => {
      return {
        value: nogoGroup._id,
        label: nogoGroup.name,
        description: 'Contributed by ' + nogoGroup.creator,
      };
    });

  return (
    <>
      <Stack spacing='xs'>
        <Title order={4}>Applied Nogos</Title>
        <Text size='xs' opacity={0.8}>
          Select Nogo Groups to apply to your routes. Routes will avoid the
          paths defined in each Nogo Group that is applied.
        </Text>
        <Select
          data={
            allNogoGroupOptions.length
              ? allNogoGroupOptions
              : [
                  {
                    value: '-1',
                    label: "You've applied all available Nogo Groups",
                    disabled: true,
                  },
                ]
          }
          value={null}
          onChange={selectNogoGroup}
          placeholder={
            allNogoGroups.length > 0
              ? 'Select a Nogo Group to apply'
              : 'No Nogo Groups available'
          }
          disabled={allNogoGroups.length === 0}
          itemComponent={SelectItem}
        />
        {selectedNogoGroups.map((nogoGroupId) => {
          const nogoGroup = allNogoGroups.find(
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
        })}
      </Stack>
      <Divider my='sm' />
      <Stack spacing='xs'>
        <Title order={4}>Your Nogo Groups</Title>
        <Text size='xs' opacity={0.8}>
          Add and edit custom Nogo Groups. Nogo Groups added here are available
          to all users to use with their cycling routes.
        </Text>
        {!!loggedInUser ? (
          <>
            {userNogoGroups.map((nogoGroup) => {
              const isEditing = editingNogoGroup?._id === nogoGroup._id;
              const alreadySelected = selectedNogoGroups.includes(
                nogoGroup._id
              );
              return (
                <Paper>
                  <Group position='apart'>
                    <Text size='sm'>{nogoGroup.name}</Text>
                    <Group position='right'>
                      {alreadySelected || isEditing ? (
                        <Text size='sm' c='dimmed' color='green'>
                          {isEditing ? 'Editing' : 'Applied'}
                        </Text>
                      ) : null}
                      <Tooltip label='Apply' withArrow hidden={alreadySelected}>
                        <ActionIcon
                          disabled={alreadySelected}
                          onClick={() => selectNogoGroup(nogoGroup._id)}
                        >
                          {alreadySelected ? (
                            <IconCheck size={18} />
                          ) : (
                            <IconPlus size={18} />
                          )}
                        </ActionIcon>
                      </Tooltip>
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
    </>
  );
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Text size='sm'>{label}</Text>
      <Text size='xs' opacity={0.65}>
        {description}
      </Text>
    </div>
  )
);
