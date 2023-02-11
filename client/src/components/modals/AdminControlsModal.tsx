import React, { useEffect, useState, forwardRef } from 'react';
import {
  Accordion,
  ActionIcon,
  Button,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { useGlobalContext } from 'contexts/globalContext';
import { Region, User } from 'models';
import { RegionApi, UserApi } from 'api';
import { IRegionCreateDTO } from 'api/interfaces/Region';
import { validatePolygonStr } from 'utils/validation';
import { ID, UserRole } from 'types';
import { IconX } from '@tabler/icons-react';

const AddRegionForm: React.FC = () => {
  const form = useForm({
    initialValues: {
      name: '',
      polygon: '',
    } as {
      name: string;
      polygon: string;
    },
    validate: {
      name: (value) => {
        if (!value || value === '') return 'Name is required';
      },
      polygon: (value) => {
        if (!value || value === '') return 'Polygon is required';
        return validatePolygonStr(value) ? null : 'Invalid GeoJSON Polygon';
      },
    },
  });

  const handleSubmit = async (values: { name: string; polygon: string }) => {
    try {
      const regionToCreate: IRegionCreateDTO = {
        ...values,
        polygon: JSON.parse(values.polygon) as GeoJSON.Polygon,
      };
      const createdRegion = await RegionApi.create(regionToCreate);
      if (createdRegion) {
        showNotification({
          title: 'Success',
          message: `${createdRegion.name} was created successfully`,
          color: 'green',
        });
        form.reset();
      }
    } catch (error: any) {
      showNotification({
        title: 'Error creating region',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing='xs'>
        <TextInput
          withAsterisk
          label='Name'
          placeholder='Enter a name for this region'
          {...form.getInputProps('name')}
        />
        <Textarea
          withAsterisk
          label='Polygon'
          placeholder='Enter the GeoJSON Polygon object for this region'
          minRows={10}
          {...form.getInputProps('polygon')}
        />
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  name: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ label, name, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Text size='sm'>{label}</Text>
      <Text size='xs' opacity={0.65}>
        {name}
      </Text>
    </div>
  )
);

const ManageUsers: React.FC = () => {
  const { regions } = useGlobalContext();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [contributingRegions, setContributingRegions] = useState<Region[]>([]);

  useEffect(() => {
    UserApi.getAll().then(setAllUsers);
  }, []);

  useEffect(() => {
    setContributingRegions(
      selectedUser
        ? regions.filter((region) => {
            return !!region.contributors.find((contributor) => {
              return contributor._id === selectedUser._id;
            });
          })
        : []
    );
  }, [selectedUser, regions]);

  const handleUserSelected = async (userId: ID | null) => {
    const user = userId ? await UserApi.getById(userId) : null;
    setSelectedUser(user);
  };

  const userOptions = allUsers.map((user) => {
    return {
      value: user._id,
      label: user.email,
      name: user.getFullName(),
    };
  });

  return (
    <Stack spacing='md'>
      <Select
        placeholder='Select a user to manage'
        itemComponent={SelectItem}
        data={userOptions}
        value={selectedUser?._id}
        onChange={(val) => handleUserSelected(val)}
        searchable
        clearable
        nothingFound='No users'
      />
      {!!selectedUser ? (
        <>
          <Regions
            userId={selectedUser._id}
            contributingRegions={contributingRegions}
          />
          <Roles
            user={selectedUser}
            onRoleUpdate={() => handleUserSelected(selectedUser._id)}
          />
        </>
      ) : null}
    </Stack>
  );
};

const Roles: React.FC<{ user: User; onRoleUpdate: () => void }> = ({
  user,
  onRoleUpdate,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role ?? null);

  const form = useForm({
    initialValues: {
      role: selectedRole,
    } as { role: UserRole },
  });

  const handleFormSubmit = async (values: { role: UserRole }) => {
    try {
      const success = await UserApi.updateUserRole(user._id, values.role);
      if (success) {
        onRoleUpdate();
      }
    } catch (error: any) {
      showNotification({
        title: 'Error adding user to region',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <Stack spacing='xs'>
      <Title order={5}>User role</Title>
      <Text size='sm'>Current role: {user.role ?? 'null'}</Text>
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Group position='apart' align='end' noWrap>
          <Select
            placeholder='Select a role'
            data={[
              {
                value: null,
                label: 'No role',
              },
              {
                value: 'admin',
                label: 'Admin',
              },
              {
                value: 'verified contributor',
                label: 'Verified Contributor',
              },
            ]}
            value={selectedRole}
            onChange={setSelectedRole}
            style={{ flexGrow: 1 }}
            {...form.getInputProps('role')}
          />
          <Button type='submit' w='fit-content'>
            Submit
          </Button>
        </Group>
      </form>
    </Stack>
  );
};

const Regions: React.FC<{ userId: ID; contributingRegions: Region[] }> = ({
  userId,
  contributingRegions,
}) => {
  const { regions, refreshRegions } = useGlobalContext();

  const form = useForm({
    initialValues: {
      region: '',
    },
    validate: {
      region: (value) => {
        if (!value || value === '') return 'Select a region';
      },
    },
  });

  const handleFormSubmit = async (values: { region: string }) => {
    try {
      const success = await RegionApi.addContributorToRegion(
        values.region,
        userId
      );
      if (success) {
        refreshRegions();
        form.reset();
      }
    } catch (error: any) {
      showNotification({
        title: 'Error adding user to region',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  const handleRemoveRegion = async (regionId: ID) => {
    try {
      const success = await RegionApi.removeContributorFromRegion(
        regionId,
        userId
      );
      if (success) {
        refreshRegions();
        form.reset();
      }
    } catch (error: any) {
      showNotification({
        title: 'Error removing user from region',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  const regionOptions = regions.map((region) => {
    return { value: region._id, label: region.name };
  });

  return (
    <Stack spacing='xs'>
      <Title order={5}>Regions contributing</Title>
      {contributingRegions.length === 0 ? (
        <Text size='sm'>None</Text>
      ) : (
        contributingRegions.map((region) => {
          return (
            <Group position='apart' noWrap>
              <Text size='sm'>{region.name}</Text>
              <ActionIcon onClick={() => handleRemoveRegion(region._id)}>
                <IconX size={14} />
              </ActionIcon>
            </Group>
          );
        })
      )}
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Group position='apart' align='end' noWrap>
          <Select
            placeholder='Add a region'
            data={regionOptions}
            style={{ flexGrow: 1 }}
            {...form.getInputProps('region')}
          />
          <Button type='submit' w='fit-content'>
            Submit
          </Button>
        </Group>
      </form>
    </Stack>
  );
};

const AdminControlsContent: React.FC = () => {
  const { loggedInUser } = useGlobalContext();

  if (!loggedInUser) return null;

  return (
    <Accordion>
      <Accordion.Item value='manage-users'>
        <Accordion.Control>Manage users</Accordion.Control>
        <Accordion.Panel>
          <ManageUsers />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='add-region'>
        <Accordion.Control>Add a region</Accordion.Control>
        <Accordion.Panel>
          <AddRegionForm />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export const AdminControlsModal: ModalSettings = {
  title: 'Admin Controls',
  children: <AdminControlsContent />,
};
