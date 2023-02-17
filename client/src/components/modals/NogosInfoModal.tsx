import React, { useState } from 'react';
import { ModalSettings } from '@mantine/modals/lib/context';
import { Container, Title, Text, Group, Image } from '@mantine/core';
import egNogoWithout from 'assets/info/info-nogo-without.png';
import egNogoWith from 'assets/info/info-nogo-with.png';

type NogosInfoProps = {
  initialView: 'nogos' | 'suggested';
};

const NogosInfo: React.FC<NogosInfoProps> = ({ initialView }) => {
  const [view, setView] = useState<'nogos' | 'suggested'>(initialView);

  if (view === 'suggested') return <Container></Container>;
  else
    return (
      <Container>
        <Title align='center'>What is a nogo?</Title>
        <Text>
          A <b>nogo</b> is a section of a roadway that SafeCycle completely
          avoids when creating a route.
        </Text>
        <Group spacing='xl' position='center' mt='xl' mb='xl'>
          <Image
            radius='md'
            style={{ width: '35%', maxWidth: '300px' }}
            src={egNogoWithout}
            alt='Map example without nogo'
            caption='Without nogo'
            withPlaceholder
          />
          <Image
            radius='md'
            style={{ width: '35%', maxWidth: '300px' }}
            src={egNogoWith}
            alt='Map example with nogo'
            caption='With nogo'
            withPlaceholder
          />
        </Group>
        <Text>
          Users can create their own nogos via the{' '}
          <Text span fw='bold' c='blue'>
            User Nogos
          </Text>{' '}
          section (or use suggested nogos in their region). User nogos are
          created in groups to allow users to organize and categorize their
          nogos.
        </Text>
      </Container>
    );
};

export const NogosInfoModal: ModalSettings = {
  children: <NogosInfo initialView='nogos' />,
  size: '65%',
};
