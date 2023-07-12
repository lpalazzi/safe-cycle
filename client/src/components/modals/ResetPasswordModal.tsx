import React, { useState } from 'react';

import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { UserApi } from 'api';
import { validateEmail } from 'utils/validation';
import { useGlobalContext } from 'contexts/globalContext';
import { ChangePasswordForm } from './ManageAccountModal';

type EmailFormValues = { email: string };

const EmailForm: React.FC<{ onSubmit: (email: string) => void }> = ({
  onSubmit,
}) => {
  const form = useForm({
    initialValues: { email: '' } as EmailFormValues,
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        return validateEmail(value) ? null : 'Invalid email';
      },
    },
  });

  const handleSubmit = async (values: EmailFormValues) => {
    try {
      const success = await UserApi.createPasswordResetToken(values.email);
      if (success) {
        onSubmit(values.email);
      }
    } catch (error: any) {
      showNotification({
        title: 'Error requesting a reset token',
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
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};

type TokenFormValues = { token: string };

const TokenForm: React.FC<{ email: string; onSubmit: () => void }> = ({
  email,
  onSubmit,
}) => {
  const form = useForm({
    initialValues: { token: '' } as TokenFormValues,
    validate: {
      token: (value) => {
        if (!value) return 'Token is required';
      },
    },
  });

  const handleSubmit = async (values: TokenFormValues) => {
    try {
      const verified = await UserApi.verifyPasswordResetToken(
        email,
        values.token
      );
      if (!verified) throw new Error('Incorrect token');
      onSubmit();
    } catch (error: any) {
      showNotification({
        title: 'Error validating your token',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing='xs'>
        <Text size='sm'>
          An email has been sent to {email} with a token. Enter the token below.
        </Text>
        <TextInput
          withAsterisk
          label='Token'
          placeholder=''
          {...form.getInputProps('token')}
        />
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};

const ResetPasswordModalContent: React.FC = () => {
  const { updateLoggedInUser } = useGlobalContext();
  const [view, setView] = useState<'email' | 'token' | 'change'>('email');
  const [email, setEmail] = useState<string | null>(null);

  if (view === 'email' || !email)
    return (
      <EmailForm
        onSubmit={(email) => {
          setView('token');
          setEmail(email);
        }}
      />
    );
  if (view === 'token')
    return <TokenForm onSubmit={() => setView('change')} email={email} />;
  if (view === 'change')
    return (
      <ChangePasswordForm
        bypassCurrentPassword={true}
        onSuccess={() => {
          closeAllModals();
          updateLoggedInUser();
        }}
      />
    );
  return <></>;
};

export const ResetPasswordModal: ModalSettings = {
  title: 'Reset password',
  children: <ResetPasswordModalContent />,
};
