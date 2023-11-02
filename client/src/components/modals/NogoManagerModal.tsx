import React from 'react';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  Accordion,
  Container,
  Flex,
  Paper,
  ScrollArea,
  Stack,
} from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';

export const NogoManagerModal = (isMobileSize: boolean) =>
  ({
    title: 'Manage Nogos',
    children: <NogoManagerContent />,
    size: '800px',
    fullScreen: isMobileSize,
    scrollAreaComponent: ScrollArea.Autosize,
  } as ModalSettings);

const NogoManagerContent: React.FC = () => {
  return (
    <Container>
      <Accordion
        variant='contained'
        multiple
        defaultValue={['suggested', 'user']}
      >
        <Accordion.Item value='suggested'>
          <Accordion.Control>
            Suggested based on your location
          </Accordion.Control>
          <Accordion.Panel>suggested</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='user'>
          <Accordion.Control>Your nogos</Accordion.Control>
          <Accordion.Panel>user</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='all'>
          <Accordion.Control>See all regional nogos</Accordion.Control>
          <Accordion.Panel>
            <AllRegions />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

const AllRegions: React.FC = () => {
  const { regions } = useGlobalContext();

  return (
    <Stack spacing='sm' align='stretch' justify='flext-start'>
      {regions.map((region) => (
        <Paper shadow='xs' p='md' radius='md'>
          {region.name}
        </Paper>
      ))}
    </Stack>
  );
};
