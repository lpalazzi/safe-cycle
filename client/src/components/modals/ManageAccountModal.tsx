import React from 'react';
import { Accordion, Button, Group, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { UserApi } from 'api';
import { IUserChangePasswordDTO } from 'api/interfaces/User';
import { useGlobalContext } from 'contexts/globalContext';
import { validatePassword } from 'utils/validation';
import { PasswordPopover } from 'components/common/PasswordPopover';

const ChangePasswordForm: React.FC = () => {
  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
    } as IUserChangePasswordDTO,
    validate: {
      currentPassword: (value) => {
        if (!value || value === '') return 'Current password is required';
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
        <PasswordInput
          withAsterisk
          label='Current password'
          placeholder='Password'
          {...form.getInputProps('currentPassword')}
        />
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
