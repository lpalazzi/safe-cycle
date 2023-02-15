import React from 'react';

import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { NogoGroupApi } from 'api';
import { INogoGroupUpdateDTO as EditNogoGroupFormValues } from 'api/interfaces/NogoGroup';
import { NogoGroup } from 'models';

type EditNogoGroupFormProps = {
  nogoGroup: NogoGroup;
};

const EditNogoGroupForm: React.FC<EditNogoGroupFormProps> = ({ nogoGroup }) => {
  const form = useForm({
    initialValues: {
      name: nogoGroup.name,
    } as EditNogoGroupFormValues,
    validate: {
      name: (value) => {
        if (!value) return 'A name is required';
        return null;
      },
    },
  });

  const handleSubmit = async (values: EditNogoGroupFormValues) => {
    try {
      await NogoGroupApi.update(nogoGroup._id, values);
      closeAllModals();
    } catch (error: any) {
      showNotification({
        title: 'Error updating Nogo Group',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack spacing='xs'>
        <TextInput
          label='Name'
          placeholder='Enter a name for this Nogo Group'
          autoComplete='off'
          {...form.getInputProps('name')}
        />
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Update</Button>
      </Group>
    </form>
  );
};

export const EditNogoGroupModal = (
  nogoGroup: NogoGroup,
  onClose: () => void
) => {
  const modalSettings: ModalSettings = {
    title: 'Edit Nogo Group',
    children: <EditNogoGroupForm nogoGroup={nogoGroup} />,
    onClose: onClose,
  };
  return modalSettings;
};
