import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import bbox from '@turf/bbox';
import { feature, featureCollection } from '@turf/helpers';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  Container,
  Title,
  Text,
  Group,
  Image,
  List,
  Anchor,
  useMantineTheme,
} from '@mantine/core';
import { IconEditCircle, IconPlus } from '@tabler/icons-react';
import imgNogoWithout from 'assets/info/info-nogo-without.png';
import imgNogoWith from 'assets/info/info-nogo-with.png';
import { useGlobalContext } from 'contexts/globalContext';
import { NogoApi } from 'api';
import { Nogo } from 'models';

type NogosInfoProps = {
  initialView: 'nogos' | 'suggested';
};

const NogosInfo: React.FC<NogosInfoProps> = ({ initialView }) => {
  const [view, setView] = useState<'nogos' | 'suggested'>(initialView);
  const [nogos, setNogos] = useState<Nogo[]>([]);
  const { regions } = useGlobalContext();
  const theme = useMantineTheme();

  useEffect(() => {
    regions.forEach((region) =>
      NogoApi.getAllByGroup(region._id, true).then((nogos) =>
        setNogos((prevNogos) => [...prevNogos, ...nogos])
      )
    );
  }, [regions]);

  const boundingbox = bbox(
    featureCollection(regions.map((region) => feature(region.polygon)))
  );

  return view === 'suggested' ? (
    <Container>
      <Title mb='xl' align='center'>
        What are suggested nogos?
      </Title>
      <Text>
        <b>Suggested nogos</b> are nogos that have been carefully curated by
        verified local cycling experts who are familiar with the cycling routes
        in a particular region. These roadways are considered too dangerous or
        low-comfort for most cyclists and should generally be avoided.{' '}
        <Anchor onClick={() => setView('nogos')}>
          Click here to learn more about nogos.
        </Anchor>
      </Text>
      <Title order={2} mt='md' mb='xs' align='center' fw='normal'>
        Supported regions
      </Title>
      <MapContainer
        bounds={new L.LatLngBounds(
          [boundingbox[1], boundingbox[0]],
          [boundingbox[3], boundingbox[2]]
        ).pad(0.5)}
        scrollWheelZoom={false}
        style={{ height: '500px', maxHeight: '50vw', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          minZoom={0}
          maxZoom={19}
        />
        {nogos.map((nogo) => (
          <GeoJSON
            key={nogo._id}
            data={nogo.lineString}
            style={{
              color: theme.colors.red[7],
              weight: 3,
              opacity: 1,
            }}
            interactive={false}
          />
        ))}
        {regions.map((region) => (
          <GeoJSON
            key={region._id}
            data={region.polygon}
            style={{
              color: 'grey',
              weight: 4,
              opacity: 1.0,
              fillOpacity: 0.1,
            }}
          >
            <Popup>
              <Title order={4} align='center'>
                {region.name}
              </Title>
              <Group position='center' spacing='xs' noWrap>
                <Text>Contributors:</Text>
                <div>
                  {region.contributors.map((contributor) => (
                    <Text>
                      {contributor.name.first + ' ' + contributor.name.last}
                    </Text>
                  ))}
                </div>
              </Group>
            </Popup>
          </GeoJSON>
        ))}
      </MapContainer>
      <Text align='center' fs='italic' mt='md'>
        If you are a cycling expert and interested in becoming a contributor for
        your region, send us an email at <u>lpalazzi@xyzdigital.com</u>.
      </Text>
    </Container>
  ) : (
    <Container>
      <Title mb='xl' align='center'>
        What is a nogo?
      </Title>
      <Group spacing='xl' position='center' mb='xl'>
        <Image
          radius='md'
          style={{ width: '35%', maxWidth: '300px' }}
          src={imgNogoWithout}
          alt='Map example without nogo'
          caption='Without nogo'
          withPlaceholder
        />
        <Image
          radius='md'
          style={{ width: '35%', maxWidth: '300px' }}
          src={imgNogoWith}
          alt='Map example with nogo'
          caption='With nogo'
          withPlaceholder
        />
      </Group>
      <Text>
        A <b>nogo</b> is a section of a roadway that SafeCycle completely avoids
        when creating a route. You can create your own nogos via the User Nogos
        section, or{' '}
        <Anchor onClick={() => setView('suggested')}>
          use suggested nogos in your region
        </Anchor>
        .
      </Text>
      <Title order={2} mt='md' mb='xs'>
        How to add nogos
      </Title>
      <List type='ordered'>
        <List.Item>
          Create a Nogo Group via the User Nogos section in the sidepanel.
        </List.Item>
        <List.Item>
          Click <IconEditCircle size={16} /> ("Edit nogos") on the group you
          want to add nogos to.
        </List.Item>
        <List.Item>Select points on the map to create nogos.</List.Item>
        <List.Item>
          Click <IconPlus size={16} /> ("Avoid these nogos") on a Nogo Group to
          apply the nogos to your routes.
        </List.Item>
      </List>
      <Title order={2} mt='md' mb='xs'>
        Tips for editing nogos
      </Title>
      <List>
        <List.Item>
          Nogos will snap to roadways when added, so choose points that are
          close to a roadway for best results.
        </List.Item>
        <List.Item>
          Keep nogos short and segmented, with breaks at intersections to allow
          routes to cross over.
        </List.Item>
        <List.Item>
          Click on an existing nogo to reveal the “Delete nogo” button.
        </List.Item>
      </List>
    </Container>
  );
};

export const NogosInfoModal = (initialView: 'nogos' | 'suggested') => {
  return {
    children: <NogosInfo initialView={initialView} />,
    size: '1000px',
  } as ModalSettings;
};
