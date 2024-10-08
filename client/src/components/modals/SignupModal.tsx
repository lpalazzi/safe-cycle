import React from 'react';
import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals, modals, openModal } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { TrackerApi, UserApi } from 'api';
import { IUserSignupDTO as SignupFormValues } from 'api/interfaces/User';
import { validateEmail, validatePassword } from 'utils/validation';
import { useGlobalContext } from 'contexts/globalContext';
import { PasswordPopover } from 'components/common/PasswordPopover';
import { LoginModal } from './LoginModal';

export const SignupModal = (nextModal?: ModalSettings) => {
  return {
    title: 'Create account',
    children: <SignupForm />,
    onClose: () => {
      if (nextModal) modals.open(nextModal);
    },
  } as ModalSettings;
};

const SignupForm: React.FC = () => {
  const { updateLoggedInUser } = useGlobalContext();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      name: {
        first: '',
        last: '',
      },
    } as SignupFormValues,
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        return validateEmail(value) ? null : 'Invalid email';
      },
      password: (value) => {
        if (!value) return 'Password is required';
        return validatePassword(value)
          ? null
          : 'Password does not match requirements';
      },
      name: {
        first: (value) => {
          if (!value) return 'First name is required';
          return null;
        },
        last: (value) => {
          if (!value) return 'Last name is required';
          return null;
        },
      },
    },
  });

  const handleSubmit = async (values: SignupFormValues) => {
    try {
      const user = await UserApi.signup(values);
      TrackerApi.logSignup(user._id);
      updateLoggedInUser();
      closeAllModals();
    } catch (error: any) {
      showNotification({
        title: 'Error signing up user',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing='xs'>
        <Group position='apart' grow>
          <TextInput
            withAsterisk
            label='First Name'
            placeholder='John'
            autoComplete='given-name'
            {...form.getInputProps('name.first')}
          />
          <TextInput
            withAsterisk
            label='Last Name'
            placeholder='Smith'
            autoComplete='family-name'
            {...form.getInputProps('name.last')}
          />
        </Group>
        <TextInput
          withAsterisk
          label='Email'
          placeholder='your@email.com'
          autoComplete='email'
          {...form.getInputProps('email')}
        />
        <PasswordPopover value={form.values.password}>
          <PasswordInput
            withAsterisk
            label='Password'
            placeholder='Password'
            autoComplete='new-password'
            {...form.getInputProps('password')}
          />
        </PasswordPopover>
      </Stack>
      <Button type='submit' mt='md' fullWidth>
        Submit
      </Button>
      <Text size='sm' align='center' mt='sm'>
        Already have an account?{' '}
        <Anchor
          inherit
          onClick={() => {
            closeAllModals();
            openModal(LoginModal());
          }}
        >
          Sign in here.
        </Anchor>
      </Text>
    </form>
  );
};
