import React from 'react';

import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { NogoGroupApi } from 'api';
import { INogoGroupCreateDTO as NewNogoGroupFormValues } from 'api/interfaces/NogoGroup';

const NewNogoGroupForm: React.FC = () => {
  const form = useForm({
    initialValues: {
      name: '',
    } as NewNogoGroupFormValues,
    validate: {
      name: (value) => {
        if (!value) return 'A name is required';
        return null;
      },
    },
  });

  const handleSubmit = async (values: NewNogoGroupFormValues) => {
    try {
      await NogoGroupApi.create(values);
      closeAllModals();
    } catch (error: any) {
      showNotification({
        title: 'Error creating Nogo Group',
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
          placeholder='Enter a name for this Nogo Group'
          {...form.getInputProps('name')}
        />
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};

export const NewNogoGroupModal: ModalSettings = {
  title: 'New Nogo Group',
  children: <NewNogoGroupForm />,
};
