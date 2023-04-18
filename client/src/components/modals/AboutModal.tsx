import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import bbox from '@turf/bbox';
import { BBox, feature, featureCollection } from '@turf/helpers';
import { Tooltip as MantineTooltip } from '@mantine/core';
import { ModalSettings } from '@mantine/modals/lib/context';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
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
  Stack,
  TextInput,
  Textarea,
  LoadingOverlay,
} from '@mantine/core';
import { IconEditCircle, IconPlus } from '@tabler/icons-react';
import LogoSvg from 'assets/brand/logo-name.svg';
import ImgNogoWithout from 'assets/info/info-nogo-without.png';
import ImgNogoWith from 'assets/info/info-nogo-with.png';
import LogoXYZ from 'assets/sponsors/logo-xyz.png';
import LogoSTR from 'assets/sponsors/logo-sharetheroad.png';
import { useGlobalContext } from 'contexts/globalContext';
import { Nogo } from 'models';
import { EmailApi, NogoApi } from 'api';
import { IContactFormDTO as ContactFormValues } from 'api/interfaces/Email';
import { validateEmail } from 'utils/validation';

type ViewType =
  | 'about'
  | 'nogos'
  | 'regions'
  | 'howto'
  | 'updating'
  | 'contact';

export const AboutModal = (initialView: ViewType, isMobileSize: boolean) => {
  return {
    children: <AboutModalContent initialView={initialView} />,
    size: '1000px',
    fullScreen: isMobileSize,
    styles: { inner: { overflowY: 'scroll' } },
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
              SafeCycle is a bike route planning tool and navigation app with a
              primary focus on finding safe and comfortable bike routes for
              users.
            </Text>

            <Text mb='sm'>
              Using a combination of comfort-focused preferences and a unique{' '}
              <Anchor onClick={() => setView('nogos')}>"nogo" feature</Anchor>,
              SafeCycle can guide cyclists of all ages and abilities, even in
              regions with poor cycling infrastructure and high levels of motor
              vehicle traffic.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='nogos'>
          <Accordion.Control>
            <b>What are nogos?</b>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb='sm'>
              A <b>nogo</b> is a section of a roadway that SafeCycle completely
              avoids when creating a route.
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
              SafeCycle works with knowledgeable cyclists in various{' '}
              <Anchor onClick={() => setView('regions')}>regions</Anchor> to add
              nogos and keep them up-to-date. Using their extensive regional
              knowledge of local roads and cycling routes, our contributors
              carefully curate nogos based on roads that most cyclists should
              avoid.
            </Text>
            <Text mb='sm' italic align='center'>
              To apply our curated nogos, select the "Avoid nogos" checkbox in
              your route preferences.
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='regions'>
          <Accordion.Control>
            <b>Regions supported with nogos</b>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb='md'>
              SafeCycle currently only supports nogos in a handful of regions.
              If you live in an unsupported region, you can still use SafeCycle
              to explore cycling routes in your area by using the comfort
              settings and other available route preferences. You can also{' '}
              <Anchor onClick={() => setView('howto')}>
                create your own private nogos
              </Anchor>{' '}
              for personal use.
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
              contributor for either an existing or unsupported region,{' '}
              <Anchor onClick={() => setView('contact')}>
                please contact us
              </Anchor>
              .
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='howto'>
          <Accordion.Control>
            <b>Create private nogos for personal use</b>
          </Accordion.Control>
          <Accordion.Panel>
            <Text>
              In addition to nogos provided by our verified contributors, users
              can create custom nogos to use for their own personal use. This
              allows you to use nogos that are tailored to your own cycling
              preferences.
            </Text>
            <Title order={5} mt='md' mb='xs'>
              How to add private nogos
            </Title>
            <List type='ordered'>
              <List.Item>
                First you must enable private nogos from your account settings.
                <List type='ordered' withPadding maw='90%'>
                  <List.Item>
                    Create an account and sign in if you haven't already.
                  </List.Item>
                  <List.Item>
                    Click "Manage account" from the user menu at the bottom of
                    the sidebar.
                  </List.Item>
                  <List.Item>
                    Under "Account settings", enable private nogos and click
                    Submit. You should now see a "Private Nogos" section in your
                    sidebar.
                  </List.Item>
                </List>
              </List.Item>
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
        <Accordion.Item value='updating'>
          <Accordion.Control>
            <b>Help keep our nogos up to date</b>
          </Accordion.Control>
          <Accordion.Panel>
            <Text mb='sm'>
              At SafeCycle, our job is never done. Roadways and cycle routes
              change and are updated over time, and as a result our data can
              become outdated. Help us keep our nogos up-to-date by{' '}
              <Anchor onClick={() => setView('contact')}>
                sending us a message
              </Anchor>{' '}
              if you find:
            </Text>
            <List ml='md' mr='md'>
              <List.Item>
                SafeCycle is routing on a high-traffic road that lacks dedicated
                space for cyclists which you think should be added as a nogo,
              </List.Item>
              <List.Item>
                SafeCycle is routing on a road that does not allow public access
                (e.g., private road or Indigenous land), or
              </List.Item>
              <List.Item>
                SafeCycle is avoiding a road that has been recently updated and
                improved for cycling, and so should no longer be a nogo.
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='contact'>
          <Accordion.Control>
            <b>Contact us</b>
          </Accordion.Control>
          <Accordion.Panel>
            <ContactForm />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Text mt='lg' ta='center'>
        SafeCycle is made possible thanks to the following:
      </Text>
      <Group position='center' mt='md' spacing='xl'>
        <MantineTooltip label='XYZ Digital Inc.'>
          <Image
            src={LogoXYZ}
            height={75}
            width='min(max-content, 100%)'
            fit='contain'
            withPlaceholder
            style={{ cursor: 'pointer' }}
            onClick={() => {
              window.open('https://www.xyzdigital.com/', '_blank');
            }}
          />
        </MantineTooltip>
        <MantineTooltip label='Share the Road Essex County'>
          <Image
            src={LogoSTR}
            height={150}
            width='min(max-content, 100%)'
            fit='contain'
            withPlaceholder
            style={{ cursor: 'pointer' }}
            onClick={() => {
              window.open(
                'https://www.facebook.com/ShareTheRoadEssexCounty',
                '_blank'
              );
            }}
          />
        </MantineTooltip>
      </Group>
      <Text align='center' fs='italic' mt='xl'>
        Roadway conditions are ever changing. Although SafeCycle can help make
        your route choices safer, users bear full responsibility for their own
        safety. Ride at your own risk.
      </Text>
    </Container>
  );
};

const ContactForm: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [pendingResponse, setPendingResponse] = useState(false);

  const form = useForm({
    initialValues: {
      name: {
        first: '',
        last: '',
      },
      email: '',
      subject: '',
      message: '',
    } as ContactFormValues,
    validate: {
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
      email: (value) => {
        if (!value) return 'Email is required';
        return validateEmail(value) ? null : 'Invalid email';
      },
      subject: (value) => {
        if (!value) return 'Subject is required';
        return null;
      },
      message: (value) => {
        if (!value) return 'Message is required';
        return null;
      },
    },
  });

  const handleSubmit = (values: ContactFormValues) => {
    setPendingResponse(true);
    EmailApi.submitContactForm(values)
      .then((success) => {
        if (!success) throw new Error('Email could not be sent');
        setFormSubmitted(true);
        setPendingResponse(false);
      })
      .catch((error) => {
        showNotification({
          title: 'Error submiting form',
          message: error.message || 'Undefined error',
          color: 'red',
        });
        setPendingResponse(false);
      });
  };

  return (
    <Stack spacing='md'>
      <Text>
        If you would like to report a bug or incorrect nogo data, are interested
        in becoming a regional contributor, or have any questions and/or
        concerns about SafeCycle, please get in touch by submitting the
        following form.
      </Text>
      {formSubmitted ? (
        <Text h={200} mt='xl' align='center' italic>
          Thank you for contacting us! We'll be in touch soon.
        </Text>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Container h={500} maw={400} m='auto' pos='relative'>
            <LoadingOverlay visible={pendingResponse} overlayBlur={2} />
            <Stack spacing='xs'>
              <Group position='apart' grow>
                <TextInput
                  withAsterisk
                  label='First Name'
                  placeholder='John'
                  {...form.getInputProps('name.first')}
                />
                <TextInput
                  withAsterisk
                  label='Last Name'
                  placeholder='Smith'
                  {...form.getInputProps('name.last')}
                />
              </Group>
              <TextInput
                withAsterisk
                label='Email'
                placeholder='your@email.com'
                {...form.getInputProps('email')}
              />
              <TextInput
                withAsterisk
                label='Subject'
                placeholder='Enter a subject'
                {...form.getInputProps('subject')}
              />
              <Textarea
                withAsterisk
                label='Message'
                placeholder='Enter your message'
                minRows={8}
                {...form.getInputProps('message')}
              />
            </Stack>
            <Group position='right' mt='md'>
              <Button type='submit'>Submit</Button>
            </Group>
          </Container>
        </form>
      )}
    </Stack>
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
