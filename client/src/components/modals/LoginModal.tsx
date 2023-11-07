import React from 'react';

import { Anchor, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals, modals, openModal } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { UserApi } from 'api';
import { IUserLoginDTO as LoginFormValues } from 'api/interfaces/User';
import { validateEmail } from 'utils/validation';
import { useGlobalContext } from 'contexts/globalContext';
import { ResetPasswordModal } from './ResetPasswordModal';

export const LoginModal = (nextModal?: ModalSettings) => {
  return {
    title: 'Sign in',
    children: <LoginForm />,
    onClose: () => {
      if (nextModal) modals.open(nextModal);
    },
  } as ModalSettings;
};

const LoginForm: React.FC = () => {
  const { updateLoggedInUser } = useGlobalContext();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    } as LoginFormValues,
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        return validateEmail(value) ? null : 'Invalid email';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        return null;
      },
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await UserApi.login(values);
      updateLoggedInUser();
      closeAllModals();
    } catch (error: any) {
      showNotification({
        title: 'Error signing in user',
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
          label='Email'
          placeholder='your@email.com'
          autoComplete='email'
          {...form.getInputProps('email')}
        />
        <TextInput
          withAsterisk
          label='Password'
          placeholder='********'
          type='password'
          autoComplete='current-password'
          {...form.getInputProps('password')}
        />
        <Anchor
          onClick={() => {
            closeAllModals();
            openModal(ResetPasswordModal);
          }}
          size='xs'
          align='right'
        >
          I forgot my password
        </Anchor>
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};
