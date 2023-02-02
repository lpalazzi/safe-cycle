import React, { forwardRef } from 'react';
import { Stack, Select, SelectItem, Text } from '@mantine/core';

import { NogoGroup } from 'models';
import { useGlobalContext } from 'contexts/globalContext';
import { SidebarTitle } from '../common/SidebarTitle';

type PublicNogosProps = {
  allPublicNogoGroups: NogoGroup[];
};

export const PublicNogos: React.FC<PublicNogosProps> = ({
  allPublicNogoGroups,
}) => {
  const { selectedNogoGroups, selectNogoGroup } = useGlobalContext();

  const allNogoGroupOptions: SelectItem[] = allPublicNogoGroups
    .filter((nogoGroup) => !selectedNogoGroups.includes(nogoGroup._id))
    .map((nogoGroup) => {
      return {
        value: nogoGroup._id,
        label: nogoGroup.name,
        description: 'Contributed by ' + nogoGroup.creator,
      };
    });

  return (
    <Stack spacing='xs'>
      <SidebarTitle
        title='Publicly Available Nogos'
        tooltipLabel='Add public Nogos contributed by other users.'
      />
      <Select
        data={
          allNogoGroupOptions.length
            ? allNogoGroupOptions
            : [
                {
                  value: '-1',
                  label: "You've applied all available Nogo Groups",
                  disabled: true,
                },
              ]
        }
        value={null}
        onChange={selectNogoGroup}
        placeholder={
          allPublicNogoGroups.length > 0
            ? 'Select a Nogo Group to apply'
            : 'No Nogo Groups available'
        }
        disabled={allPublicNogoGroups.length === 0}
        itemComponent={SelectItem}
      />
    </Stack>
  );
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  image: string;
  label: string;
  description: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, description, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Text size='sm'>{label}</Text>
      <Text size='xs' opacity={0.65}>
        {description}
      </Text>
    </div>
  )
);
