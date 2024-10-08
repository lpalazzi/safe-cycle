import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import {
  ActionIcon,
  Anchor,
  Button,
  Collapse,
  Flex,
  Group,
  Input,
  Loader,
  Menu,
  Paper,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { Nogo, NogoGroup } from 'models';
import { metresToDistanceString } from 'utils/formatting';
import {
  IconCheck,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { getBoundsForNogos } from 'utils/nogos';
import { NogoGroupApi } from 'api';

export const NogoGroupCard: React.FC<{
  nogoGroup: NogoGroup;
  isSelected: boolean;
  toggleSelect: () => void;
  onNogoGroupUpdated: () => void;
}> = ({ nogoGroup, isSelected, toggleSelect, onNogoGroupUpdated }) => {
  const theme = useMantineTheme();
  const { setEditingGroupOrRegion } = useGlobalContext();
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [nogos, setNogos] = useState<Nogo[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(nogoGroup.name);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    nogoGroup.getAllNogos().then(setNogos);
  }, []);

  useEffect(() => {
    setEditedName(nogoGroup.name);
  }, [nogoGroup.name]);

  useEffect(() => {
    setTimeout(() => {
      if (showDetails) {
        setShowMap(true);
      }
    }, 300);
  }, [showDetails]);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <Paper
      p='md'
      radius='md'
      withBorder
      bg={isSelected ? theme.colors.green[1] : undefined}
    >
      <Group position='apart' noWrap>
        <Stack spacing={0}>
          <Group
            spacing={isEditingName ? 'xs' : 0}
            style={{ flexWrap: isEditingName ? 'wrap-reverse' : 'nowrap' }}
          >
            {isEditingName ? (
              <>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  maw={200}
                />
                <ActionIcon
                  size={36}
                  variant='outline'
                  radius='md'
                  color='red'
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(nogoGroup.name);
                  }}
                >
                  <IconX size='1.125rem' />
                </ActionIcon>
                <ActionIcon
                  size={36}
                  variant='filled'
                  radius='md'
                  color='blue'
                  onClick={() => {
                    NogoGroupApi.update(nogoGroup._id, {
                      name: editedName,
                    }).then(() => {
                      setIsEditingName(false);
                      onNogoGroupUpdated();
                    });
                  }}
                >
                  <IconCheck size='1.125rem' />
                </ActionIcon>
              </>
            ) : (
              <>
                <Text>{nogoGroup.name}</Text>
                <Tooltip label='Edit name' withArrow>
                  <ActionIcon
                    size={24}
                    variant='transparent'
                    radius='md'
                    color='gray'
                    onClick={() => {
                      setIsEditingName(true);
                    }}
                  >
                    <IconEdit size='1.125rem' />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
          <Text size='sm' color='dimmed'>
            {!!nogoGroup.nogoLength
              ? `Total nogos: ${metresToDistanceString(
                  nogoGroup.nogoLength,
                  1
                )}`
              : 'This group has no nogos. '}
            {!nogoGroup.nogoLength && (
              <Anchor
                inherit
                onClick={() => {
                  setEditingGroupOrRegion(nogoGroup);
                  modals.closeAll();
                }}
              >
                Click here to add some.
              </Anchor>
            )}
          </Text>
          <Anchor
            size='sm'
            onClick={toggleDetails}
            style={nogoGroup.nogoLength ? {} : { visibility: 'hidden' }}
          >
            {showDetails ? 'Hide nogos' : 'See nogos in this group'}
          </Anchor>
        </Stack>
        <Group position='right' spacing='xs' noWrap>
          <Menu position='left-start' zIndex={500}>
            <Menu.Target>
              <ActionIcon
                size={36}
                variant='transparent'
                radius='md'
                color='gray'
              >
                <IconDotsVertical size='1.125rem' />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconEdit size={14} />}
                onClick={() => {
                  setEditingGroupOrRegion(nogoGroup);
                  modals.closeAll();
                }}
              >
                Edit nogos
              </Menu.Item>
              <Menu.Item
                icon={<IconTrash size={14} />}
                color='red'
                onClick={() => {
                  setShowDetails(false);
                  setConfirmDelete(true);
                }}
              >
                Delete group
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <Tooltip label={isSelected ? 'Deselect' : 'Select'} withArrow>
            <ActionIcon
              size={36}
              variant={isSelected ? 'filled' : 'outline'}
              radius='md'
              color='green'
              onClick={toggleSelect}
            >
              {isSelected ? (
                <IconCheck size='1.125rem' />
              ) : (
                <IconPlus size='1.125rem' />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Collapse in={confirmDelete}>
        <Stack spacing='xs' align='center' py='xs'>
          <Text fw='bolder'>
            Are you sure you want to delete these nogos? This action cannot be
            undone.
          </Text>
          <Group>
            <Button
              onClick={() => setConfirmDelete(false)}
              variant='outline'
              color='dark'
            >
              No don't delete anything
            </Button>
            <Button
              onClick={() => {
                NogoGroupApi.delete(nogoGroup._id).then(onNogoGroupUpdated);
              }}
              variant='filled'
              color='red'
            >
              Delete these nogos
            </Button>
          </Group>
        </Stack>
      </Collapse>
      <Collapse in={showDetails}>
        {showMap && nogos.length > 0 ? (
          <MapContainer
            key={nogos.length}
            bounds={getBoundsForNogos(nogos).pad(0.2)}
            style={{
              height: '300px',
              width: '100%',
              borderRadius: '12px',
            }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              minZoom={0}
              maxZoom={19}
            />
            {nogos.map((nogo) => (
              <GeoJSON
                key={nogo._id}
                data={nogo.lineString}
                style={{
                  color: theme.colors.red[7],
                  weight: 3,
                  opacity: 1,
                }}
                interactive={false}
              />
            ))}
            <Paper
              px='xs'
              py='0.325rem'
              radius='md'
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 100000,
              }}
            >
              <Group noWrap align='center' position='center' spacing='xs'>
                <Text size='xs'>Nogos</Text>
                <hr
                  style={{
                    height: 3,
                    borderWidth: 0,
                    backgroundColor: theme.colors.red[7],
                    width: 16,
                    borderRadius: 50,
                  }}
                />
              </Group>
            </Paper>
          </MapContainer>
        ) : (
          <Flex
            justify='center'
            align='center'
            style={{
              height: '300px',
              width: '100%',
              borderRadius: '12px',
              backgroundColor: theme.colors.gray[3],
            }}
          >
            {showMap ? (
              <Text>
                You have no nogos in this nogo group. Edit the group to add
                nogos.
              </Text>
            ) : (
              <Loader />
            )}
          </Flex>
        )}
      </Collapse>
    </Paper>
  );
};
