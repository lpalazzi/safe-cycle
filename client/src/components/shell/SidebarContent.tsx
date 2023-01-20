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
  Checkbox,
  SegmentedControl,
  Input,
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
    routeOptions,
    selectNogoGroup,
    deselectNogoGroup,
    setEditingNogoGroup,
    updateRouteOptions,
  } = useGlobalContext();

  const [allPublicNogoGroups, setAllPublicNogoGroups] = useState<NogoGroup[]>(
    []
  );
  const [userNogoGroups, setUserNogoGroups] = useState<NogoGroup[]>([]);

  useEffect(() => {
    refreshData();
  }, [loggedInUser]);

  const refreshData = async () => {
    try {
      setAllPublicNogoGroups(await NogoGroupApi.getAllPublic());
      const fetchedUserNogoGroups = await NogoGroupApi.getAllForUser();
      setUserNogoGroups(fetchedUserNogoGroups);
      const editingNogoGroupWasDeleted = !fetchedUserNogoGroups.some(
        (nogoGroup) => nogoGroup._id === editingNogoGroup?._id
      );
      if (editingNogoGroupWasDeleted) {
        setEditingNogoGroup(null);
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

  const allNogoGroupOptions: SelectItem[] = allPublicNogoGroups
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
        <SidebarTitle title='Route Options' />
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
        <Checkbox
          label='Avoid unpaved roads'
          checked={routeOptions.avoidUnpaved}
          onChange={(e) =>
            updateRouteOptions({ avoidUnpaved: e.currentTarget.checked })
          }
        />
      </Stack>
      <Divider my='sm' />
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
      <Divider my='sm' />
      <Stack spacing='xs'>
        <SidebarTitle
          title='Publicly Available Nogos'
          tooltipLabel='Add public Nogos contributed by other users.'
        />
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
            allPublicNogoGroups.length > 0
              ? 'Select a Nogo Group to apply'
              : 'No Nogo Groups available'
          }
          disabled={allPublicNogoGroups.length === 0}
          itemComponent={SelectItem}
        />
      </Stack>
      <Divider my='sm' />
      <Stack spacing='xs'>
        <SidebarTitle
          title='Your Nogo Groups'
          tooltipLabel='Add and edit custom Nogo Groups. Nogo Groups added here are available to all users to use with their cycling routes.'
        />
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
                        <Text size='sm' c='dimmed'>
                          {isEditing ? 'Editing' : 'Applied'}
                        </Text>
                      ) : null}
                      {alreadySelected ? (
                        <IconCheck size={18} color='grey' />
                      ) : (
                        <Tooltip
                          label='Apply'
                          withArrow
                          hidden={alreadySelected}
                        >
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

const SidebarTitle: React.FC<{ title: string; tooltipLabel?: string }> = ({
  title,
  tooltipLabel,
}) => {
  return (
    <Group spacing='xs' align='center'>
      <Title order={4}>{title}</Title>
      {tooltipLabel ? (
        <Tooltip
          multiline
          width={300}
          withArrow
          transition='fade'
          transitionDuration={200}
          events={{ hover: true, focus: false, touch: true }}
          label={tooltipLabel}
        >
          <div style={{ height: '18px' }}>
            <IconInfoCircle size={18} />
          </div>
        </Tooltip>
      ) : null}
    </Group>
  );
};
