import React, { useState } from 'react';

import {
  Box,
  Button,
  Group,
  PasswordInput,
  Popover,
  Progress,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { UserApi } from 'api';
import { IUserSignupDTO as SignupFormValues } from 'api/interfaces/User';
import {
  getPasswordStrength,
  passwordRequirements,
  validateEmail,
  validatePassword,
} from 'utils/validation';
import { useGlobalContext } from 'contexts/globalContext';
import { IconCheck, IconX } from '@tabler/icons-react';

const SignupForm: React.FC = () => {
  const { updateLoggedInUser } = useGlobalContext();
  const [passwordPopoverOpened, setPasswordPopoverOpened] = useState(false);

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
      await UserApi.signup(values);
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

  const strength = getPasswordStrength(form.values.password);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';
  const passwordChecks = passwordRequirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(form.values.password)}
    />
  ));

  console.log(validatePassword(form.values.password));

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
        <Popover
          opened={passwordPopoverOpened}
          position='bottom'
          width='target'
          transition='pop'
        >
          <Popover.Target>
            <div
              onFocusCapture={() => setPasswordPopoverOpened(true)}
              onBlurCapture={() => setPasswordPopoverOpened(false)}
            >
              <PasswordInput
                withAsterisk
                label='Password'
                placeholder='Password'
                autoComplete='new-password'
                {...form.getInputProps('password')}
              />
            </div>
          </Popover.Target>
          <Popover.Dropdown>
            <Progress
              color={color}
              value={strength}
              size={5}
              style={{ marginBottom: 10 }}
            />
            <PasswordRequirement
              label='Includes at least 8 characters'
              meets={form.values.password.length > 5}
            />
            {passwordChecks}
          </Popover.Dropdown>
        </Popover>
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};

export const SignupModal: ModalSettings = {
  title: 'Create account',
  children: <SignupForm />,
};

const PasswordRequirement = ({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) => {
  return (
    <Text
      color={meets ? 'teal' : 'red'}
      sx={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size='sm'
    >
      {meets ? <IconCheck size={14} /> : <IconX size={14} />}{' '}
      <Box ml={10}>{label}</Box>
    </Text>
  );
};
