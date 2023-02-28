import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import bbox from '@turf/bbox';
import { BBox, feature, featureCollection } from '@turf/helpers';
import { ModalSettings } from '@mantine/modals/lib/context';
import {
  Container,
  Title,
  Text,
  Group,
  Image,
  List,
  useMantineTheme,
  Accordion,
  Loader,
  Flex,
  Space,
  Anchor,
  ScrollArea,
  Button,
} from '@mantine/core';
import { IconEditCircle, IconPlus } from '@tabler/icons-react';
import LogoSvg from 'assets/brand/logo-name.svg';
import ImgNogoWithout from 'assets/info/info-nogo-without.png';
import ImgNogoWith from 'assets/info/info-nogo-with.png';
import { useGlobalContext } from 'contexts/globalContext';
import { NogoApi } from 'api';
import { Nogo } from 'models';

type ViewType = 'about' | 'howto' | 'regions';

export const AboutModal = (initialView: ViewType, isMobileSize: boolean) => {
  return {
    children: <AboutModalContent initialView={initialView} />,
    size: '1000px',
    fullScreen: isMobileSize,
  } as ModalSettings;
};

type AboutModalProps = {
  initialView: ViewType;
};

const AboutModalContent: React.FC<AboutModalProps> = ({ initialView }) => {
  const { isMobileSize } = useGlobalContext();
  const [view, setView] = useState<string | null>(initialView);
  const [map, setMap] = useState<L.Map | null>(null);
  return (
    <Container>
      <Image
        src={LogoSvg}
        height={75}
        fit='contain'
        alt='SafeCycle'
        withPlaceholder
      />
      <Space h='md' />
      <Accordion value={view} onChange={setView} variant='contained'>
        <Accordion.Item value='about'>
          <Accordion.Control>
            <b>About SafeCycle</b>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb='sm'>
              <b>SafeCycle</b> is a bike route planning tool and navigation app
              with a unique "nogo" feature which enables you to generate routes
              that avoid traffic stressed or low comfort roads.
            </Text>
            <Group spacing='xl' position='center' mb='sm'>
              <Image
                radius='md'
                style={{ width: '35%', maxWidth: '300px' }}
                src={ImgNogoWithout}
                alt='Map example without nogo'
                caption='Without nogo'
                withPlaceholder
              />
              <Image
                radius='md'
                style={{ width: '35%', maxWidth: '300px' }}
                src={ImgNogoWith}
                alt='Map example with nogo'
                caption='With nogo'
                withPlaceholder
              />
            </Group>
            <Text mb='sm'>
              A <b>nogo</b> is a section of a roadway that SafeCycle completely
              avoids when creating a route. Nogos are contributed by
              knowledgeable cyclists in each of our{' '}
              <Anchor onClick={() => setView('regions')}>
                supported regions
              </Anchor>
              . Using their extensive regional knowledge of local roads and
              cycling routes, our contributors carefully curate nogos based on
              roads that most cyclists should avoid.{' '}
              <i>
                To apply our curated nogos, select the "Avoid nogos" checkbox in
                your route preferences.
              </i>
            </Text>
            <Text align='center' fs='italic' fw='bold'>
              Roadway conditions are ever changing. Although SafeCycle can help
              make your route choices safer, users bear full responsibility for
              their own safety. Ride at your own risk.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='howto'>
          <Accordion.Control>
            <b>Create your own nogos</b>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>
              In addition to nogos provided by local cyclists, users can create
              custom nogos to use for their own personal routes.
            </Text>
            <Title order={5} mt='md' mb='xs'>
              How to add private nogos
            </Title>
            <List type='ordered'>
              <List.Item>
                Create a Nogo Group via the Private Nogos section in the
                sidepanel.
              </List.Item>
              <List.Item>
                Click{' '}
                <IconEditCircle
                  size={18}
                  style={{ position: 'relative', top: '0.15em' }}
                />{' '}
                (Edit nogos) on the group you want to add nogos to.
              </List.Item>
              <List.Item>Select points on the map to create nogos.</List.Item>
              <List.Item>
                Click{' '}
                <IconPlus
                  size={18}
                  style={{ position: 'relative', top: '0.15em' }}
                />{' '}
                (Avoid these nogos) on a Nogo Group to apply the nogos to your
                routes.
              </List.Item>
            </List>
            <Title order={5} mt='md' mb='xs'>
              Tips for editing nogos
            </Title>
            <List>
              <List.Item>
                Nogos will snap to roadways when added, so choose points that
                are close to a roadway for best results.
              </List.Item>
              <List.Item>
                Keep nogos short and segmented, with breaks at intersections to
                allow routes to cross over.
              </List.Item>
              <List.Item>
                Click on an existing nogo to reveal the “Delete nogo” button.
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='regions'>
          <Accordion.Control>
            <b>Supported regions</b>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb='md'>
              SafeCycle currently only supports a handful of regions. If you
              live in an unsupported region, you can still use SafeCycle to
              explore cycling routes in your area by using our other available
              route preferences and by{' '}
              <Anchor onClick={() => setView('howto')}>
                creating your own private nogos
              </Anchor>
              .
            </Text>
            <Group position='apart' noWrap={isMobileSize ? false : true}>
              <SupportedRegionsMap
                open={view === 'regions'}
                map={map}
                setMap={setMap}
              />
              <SupportedRegionsList map={map} />
            </Group>
            <Text align='center' fs='italic' mt='md'>
              If you are a knowledgeable cyclist and interested in becoming a
              contributor for either an existing or unsupported region, contact
              us at <u>lpalazzi@xyzdigital.com</u>.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

const SupportedRegionsMap: React.FC<{
  open: boolean;
  map: L.Map | null;
  setMap: (map: L.Map) => void;
}> = ({ open, map, setMap }) => {
  const { regions } = useGlobalContext();
  const [displayMap, setDisplayMap] = useState(false);
  const [nogos, setNogos] = useState<Nogo[]>([]);
  const [boundingBox, setBoundingBox] = useState<BBox | undefined>(undefined);
  const theme = useMantineTheme();

  useEffect(() => {
    if (regions.length > 0) {
      regions.forEach((region) =>
        NogoApi.getAllByGroup(region._id, true).then((nogos) =>
          setNogos((prevNogos) => [...prevNogos, ...nogos])
        )
      );
      setBoundingBox(
        bbox(
          featureCollection(regions.map((region) => feature(region.polygon)))
        )
      );
    }
  }, [regions]);

  useEffect(() => {
    setTimeout(() => {
      if (open) {
        setDisplayMap(true);
      }
    }, 300);
  }, [open]);

  return displayMap && boundingBox ? (
    <MapContainer
      ref={setMap}
      bounds={new L.LatLngBounds(
        [boundingBox[1], boundingBox[0]],
        [boundingBox[3], boundingBox[2]]
      ).pad(0.2)}
      scrollWheelZoom={false}
      style={{
        height: '500px',
        maxHeight: '50vw',
        width: '100%',
        borderRadius: '12px',
      }}
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
          eventHandlers={{
            click: (e) => {
              map?.flyToBounds((e.target as L.GeoJSON).getBounds().pad(0.2), {
                duration: 0.8,
              });
            },
          }}
        >
          <Tooltip direction='top' sticky={true}>
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
          </Tooltip>
        </GeoJSON>
      ))}
    </MapContainer>
  ) : (
    <Flex
      justify='center'
      align='center'
      style={{
        height: '500px',
        maxHeight: '50vw',
        width: '100%',
        borderRadius: '12px',
        backgroundColor: theme.colors.gray[3],
      }}
    >
      <Loader />
    </Flex>
  );
};

const SupportedRegionsList: React.FC<{ map: L.Map | null }> = ({ map }) => {
  const { regions, isMobileSize } = useGlobalContext();
  return (
    <ScrollArea
      style={{
        height: '500px',
        maxHeight: '50vw',
        width: isMobileSize ? '100%' : '400px',
        backgroundColor: 'unset',
      }}
    >
      <Button.Group orientation='vertical'>
        {regions.map((region) => {
          const boundingBox = bbox(feature(region.polygon));
          return (
            <Button
              variant='default'
              onClick={() =>
                map?.flyToBounds(
                  new L.LatLngBounds(
                    [boundingBox[1], boundingBox[0]],
                    [boundingBox[3], boundingBox[2]]
                  ).pad(0.2),
                  {
                    animate: false,
                  }
                )
              }
              styles={{
                inner: {
                  justifyContent: 'flex-start',
                },
              }}
            >
              {region.name}
            </Button>
          );
        })}
      </Button.Group>
    </ScrollArea>
  );
};
