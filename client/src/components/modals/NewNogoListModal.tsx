import React from 'react';

import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { NogoListApi } from 'api';
import { INogoListCreateDTO as NewNogoListFormValues } from 'api/interfaces/NogoList';

const NewNogoListForm: React.FC = () => {
  const form = useForm({
    initialValues: {
      name: '',
    } as NewNogoListFormValues,
    validate: {
      name: (value) => {
        if (!value) return 'A name is required';
        return null;
      },
    },
  });

  const handleSubmit = async (values: NewNogoListFormValues) => {
    try {
      await NogoListApi.create(values);
      closeAllModals();
    } catch (error: any) {
      showNotification({
        title: 'Error creating NOGO List',
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
          placeholder='Enter a name for this NOGO List'
          {...form.getInputProps('name')}
        />
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Submit</Button>
      </Group>
    </form>
  );
};

export const NewNogoListModal: ModalSettings = {
  title: 'New NOGO List',
  children: <NewNogoListForm />,
};
