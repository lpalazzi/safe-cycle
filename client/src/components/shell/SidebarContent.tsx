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
  IconDots,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconRoadOff,
  IconTrash,
  IconX,
} from '@tabler/icons';
import { NogoListApi } from 'api';
import { EditNogoListModal } from 'components/modals/EditNogoListModal';
import { NewNogoListModal } from 'components/modals/NewNogoListModal';
import { useGlobalContext } from 'contexts/globalContext';
import { NogoList } from 'models';
import React, { forwardRef, useEffect, useState } from 'react';
import { ID } from 'types';

export const SidebarContent: React.FC = () => {
  const {
    loggedInUser,
    selectedNogoLists,
    editingNogoList,
    selectNogoList,
    deselectNogoList,
    setEditingNogoList,
  } = useGlobalContext();

  const [allNogoLists, setAllNogoLists] = useState<NogoList[]>([]);
  const [userNogoLists, setUserNogoLists] = useState<NogoList[]>([]);

  useEffect(() => {
    if (loggedInUser) {
      refreshData();
    }
  }, [loggedInUser]);

  const refreshData = () => {
    try {
      NogoListApi.getAll().then(setAllNogoLists);
      NogoListApi.getAllForUser().then((fetchedUserNogoLists) => {
        setUserNogoLists(fetchedUserNogoLists);
        const editingNogoListWasDeleted = !fetchedUserNogoLists.some(
          (nogoList) => nogoList._id === editingNogoList
        );
        if (editingNogoListWasDeleted) {
          setEditingNogoList(null);
        }
      });
    } catch (error: any) {
      showNotification({
        title: 'Error fetching NOGO List data',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  const handleEditNogos = (id: ID | null) => {
    setEditingNogoList(id);
  };

  const handleEditUserNogoList = (nogoList: NogoList) => {
    openModal(EditNogoListModal(nogoList, refreshData));
  };

  const handleCreateUserNogoList = () => {
    // open modal
    openModal({ ...NewNogoListModal, onClose: refreshData });
  };

  const handleDeleteUserNogoList = (nogoList: NogoList) => {
    openConfirmModal({
      title: `Delete ${nogoList.name}`,
      children: (
        <Text size='sm'>
          Are you sure you want to delete this NOGO List? All NOGOs saved in
          this list will be deleted.
        </Text>
      ),
      labels: { confirm: 'Delete NOGO List', cancel: "No don't delete it" },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        NogoListApi.delete(nogoList._id)
          .then((deleteResult) => {
            showNotification({
              message: deleteResult.nogoListDeleted
                ? `NOGO List with ${deleteResult.nogosDeleted} NOGO${
                    deleteResult.nogosDeleted === 1 ? '' : 's'
                  } was deleted.`
                : 'NOGO List was not deleted.',
              color: deleteResult.nogoListDeleted ? 'green' : 'red',
            });
            refreshData();
          })
          .catch((error) => {
            showNotification({
              title: 'Error deleting NOGO List',
              message: error.message || 'Undefined error',
              color: 'red',
            });
            refreshData();
          });
      },
    });
  };

  const allNogoListOptions: SelectItem[] = allNogoLists
    .filter((nogoList) => !selectedNogoLists.includes(nogoList._id))
    .map((nogoList) => {
      return {
        value: nogoList._id,
        label: nogoList.name,
        description: 'Contributed by ' + nogoList.creator,
      };
    });

  return (
    <>
      <Stack spacing='xs'>
        <Title order={4}>Applied NOGOs</Title>
        <Text size='xs' opacity={0.8}>
          Select NOGO Lists to apply to your routes. Routes will avoid the paths
          defined in each NOGO List that is applied.
        </Text>
        <Select
          data={
            allNogoListOptions.length
              ? allNogoListOptions
              : [
                  {
                    value: '-1',
                    label: "You've applied all available NOGO Lists",
                    disabled: true,
                  },
                ]
          }
          value={null}
          onChange={selectNogoList}
          placeholder={
            allNogoLists.length > 0
              ? 'Select a NOGO List to apply'
              : 'No NOGO Lists available'
          }
          disabled={allNogoLists.length === 0}
          itemComponent={SelectItem}
        />
        {selectedNogoLists.map((nogoListId) => {
          const nogoList = allNogoLists.find(
            (nogoList) => nogoList._id === nogoListId
          );

          return !!nogoList ? (
            <Paper>
              <Group position='apart'>
                <Stack spacing={0}>
                  <Text size='sm'>{nogoList.name}</Text>
                  <Text size='xs' opacity={0.65}>
                    {'Contributed by ' + nogoList.creator}
                  </Text>
                </Stack>
                <ActionIcon onClick={() => deselectNogoList(nogoList._id)}>
                  <IconX size={18} />
                </ActionIcon>
              </Group>
            </Paper>
          ) : null;
        })}
      </Stack>
      <Divider my='sm' />
      <Stack spacing='xs'>
        <Title order={4}>Your NOGO Lists</Title>
        {!!loggedInUser ? (
          <>
            {userNogoLists.map((nogoList) => {
              const isEditing = editingNogoList === nogoList._id;
              return (
                <Paper>
                  <Group position='apart'>
                    <Group align='center' position='left' spacing='xs'>
                      {isEditing ? (
                        <Tooltip label='Stop editing' withArrow>
                          <ActionIcon
                            color='green'
                            onClick={() => handleEditNogos(null)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                      ) : null}
                      <Text size='sm'>{nogoList.name}</Text>
                    </Group>
                    <Group position='right'>
                      <Tooltip label='Apply' withArrow>
                        <ActionIcon
                          onClick={() => selectNogoList(nogoList._id)}
                        >
                          <IconPlus size={18} />
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
                              handleEditNogos(isEditing ? null : nogoList._id)
                            }
                          >
                            {isEditing ? 'Stop editing NOGOs' : 'Edit NOGOs'}
                          </Menu.Item>
                          <Menu.Item
                            icon={<IconEdit size={14} />}
                            onClick={() => handleEditUserNogoList(nogoList)}
                          >
                            Edit list properties
                          </Menu.Item>
                          <Menu.Item
                            icon={<IconTrash size={14} />}
                            color='red'
                            onClick={() => handleDeleteUserNogoList(nogoList)}
                          >
                            Delete NOGO List
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
              onClick={handleCreateUserNogoList}
            >
              Create new NOGO List
            </Button>
          </>
        ) : (
          <Alert icon={<IconInfoCircle size={16} />} color='gray'>
            Please sign in to add your own NOGOs
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
