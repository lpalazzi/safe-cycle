import React from 'react';
import {
  Accordion,
  Button,
  Group,
  PasswordInput,
  Stack,
  Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { UserApi } from 'api';
import { IUserChangePasswordDTO } from 'api/interfaces/User';
import { useGlobalContext } from 'contexts/globalContext';
import { UserSettings } from 'types';
import { validatePassword } from 'utils/validation';
import { PasswordPopover } from 'components/common/PasswordPopover';

const UpdateSettingsForm: React.FC = () => {
  const { loggedInUser, updateLoggedInUser } = useGlobalContext();

  const form = useForm({
    initialValues: {
      privateNogosEnabled: loggedInUser?.settings?.privateNogosEnabled,
    } as Partial<UserSettings>,
    validate: {
      privateNogosEnabled: () => null,
    },
  });

  const handleSubmit = async (values: Partial<UserSettings>) => {
    try {
      const success = await UserApi.updateUserSettings(values);
      if (success) {
        showNotification({
          title: 'Success',
          message: 'Your settings have been updated',
          color: 'green',
        });
      } else {
        throw new Error('Server returned unsuccessful');
      }
      updateLoggedInUser();
    } catch (error: any) {
      showNotification({
        title: 'Error updating settings',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  const areValuesUnchanged = () => {
    return (
      !!loggedInUser?.settings?.privateNogosEnabled ===
      !!form.values.privateNogosEnabled
    );
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing='xs'>
        <Switch
          label='Enable private nogos'
          labelPosition='left'
          {...form.getInputProps('privateNogosEnabled', { type: 'checkbox' })}
        />
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit' disabled={areValuesUnchanged()}>
          Submit
        </Button>
      </Group>
    </form>
  );
};

export const ChangePasswordForm: React.FC<{
  bypassCurrentPassword?: boolean;
  onSuccess?: () => void;
}> = ({ bypassCurrentPassword, onSuccess }) => {
  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      bypassCurrentPassword,
    } as IUserChangePasswordDTO,
    validate: {
      currentPassword: (value) => {
        if (!bypassCurrentPassword && (!value || value === ''))
          return 'Current password is required';
      },
      newPassword: (value) => {
        if (!value) return 'New password is required';
        return validatePassword(value)
          ? null
          : 'Password does not match requirements';
      },
    },
  });

  const handleSubmit = async (values: IUserChangePasswordDTO) => {
    try {
      const success = await UserApi.changePassword(values);
      if (success) {
        showNotification({
          title: 'Success',
          message: 'Your password was changed',
          color: 'green',
        });
        onSuccess?.();
      } else {
        throw new Error();
      }
      form.reset();
    } catch (error: any) {
      showNotification({
        title: 'Error changing password',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing='xs'>
        {bypassCurrentPassword ? null : (
          <PasswordInput
            withAsterisk
            label='Current password'
            placeholder='Password'
            {...form.getInputProps('currentPassword')}
          />
        )}
        <PasswordPopover value={form.values.newPassword}>
          <PasswordInput
            withAsterisk
            label='New password'
            placeholder='Password'
            {...form.getInputProps('newPassword')}
          />
        </PasswordPopover>
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};

const ManageAccountContent: React.FC = () => {
  const { loggedInUser } = useGlobalContext();
  if (!loggedInUser) return null;

  return (
    <Accordion>
      <Accordion.Item value='settings'>
        <Accordion.Control>Account settings</Accordion.Control>
        <Accordion.Panel>
          <UpdateSettingsForm />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value='add-region'>
        <Accordion.Control>Change password</Accordion.Control>
        <Accordion.Panel>
          <ChangePasswordForm />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export const ManageAccountModal: ModalSettings = {
  title: 'Manage account',
  children: <ManageAccountContent />,
};
