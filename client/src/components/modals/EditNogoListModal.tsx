import React from 'react';

import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { closeAllModals } from '@mantine/modals';
import { ModalSettings } from '@mantine/modals/lib/context';
import { showNotification } from '@mantine/notifications';

import { NogoListApi } from 'api';
import { INogoListUpdateDTO as EditNogoListFormValues } from 'api/interfaces/NogoList';
import { NogoList } from 'models';

type EditNogoListFormProps = {
  nogoList: NogoList;
};

const EditNogoListForm: React.FC<EditNogoListFormProps> = ({ nogoList }) => {
  const form = useForm({
    initialValues: {
      name: nogoList.name,
    } as EditNogoListFormValues,
    validate: {
      name: (value) => {
        if (!value) return 'A name is required';
        return null;
      },
    },
  });

  const handleSubmit = async (values: EditNogoListFormValues) => {
    try {
      await NogoListApi.update(nogoList._id, values);
      closeAllModals();
    } catch (error: any) {
      showNotification({
        title: 'Error updating NOGO List',
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
          placeholder='Enter a name for this NOGO List'
          {...form.getInputProps('name')}
        />
      </Stack>
      <Group position='right' mt='md'>
        <Button type='submit'>Update</Button>
      </Group>
    </form>
  );
};

export const EditNogoListModal = (nogoList: NogoList, onClose: () => void) => {
  const modalSettings: ModalSettings = {
    title: 'Edit NOGO List',
    children: <EditNogoListForm nogoList={nogoList} />,
    onClose: onClose,
  };
  return modalSettings;
};
