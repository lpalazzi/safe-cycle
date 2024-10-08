import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import {
  ActionIcon,
  Anchor,
  Collapse,
  Flex,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import {
  IconCheck,
  IconDownload,
  IconEdit,
  IconExclamationCircle,
  IconMapPin,
  IconPlus,
} from '@tabler/icons-react';
import booleanWithin from '@turf/boolean-within';
import { point } from '@turf/helpers';
import { Nogo, Region } from 'models';
import { metresToDistanceString } from 'utils/formatting';
import { RegionContributorCard } from './RegionContributorCard';
import { useMapContext } from 'contexts/mapContext';
import { useGlobalContext } from 'contexts/globalContext';
import { modals } from '@mantine/modals';

export const RegionCard: React.FC<{
  region: Region;
  isSelected: boolean;
  toggleSelect: () => void;
}> = ({ region, isSelected, toggleSelect }) => {
  const theme = useMantineTheme();
  const { currentLocation, map } = useMapContext();
  const { loggedInUser, isMobileSize, setEditingGroupOrRegion } =
    useGlobalContext();
  const [showDetails, setShowDetails] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [nogos, setNogos] = useState<Nogo[]>([]);
  const [userIsWithinRegion, setUserIsWithinRegion] = useState(false);

  const userIsContributor =
    !!loggedInUser && region.isUserContributor(loggedInUser._id);

  useEffect(() => {
    region.getAllNogos().then((nogos) => {
      setNogos(nogos);
    });
  }, []);

  useEffect(() => {
    setUserIsWithinRegion(
      !!currentLocation?.latlng &&
        booleanWithin(
          point([currentLocation.latlng.lng, currentLocation.latlng.lat]),
          region.polygon
        )
    );
  }, [currentLocation]);

  useEffect(() => {
    setTimeout(() => {
      if (showDetails) {
        setShowMap(true);
      }
    }, 300);
  }, [showDetails]);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <Paper
      p='md'
      radius='md'
      withBorder
      bg={isSelected ? theme.colors.green[0] : undefined}
    >
      <Group position='apart' noWrap>
        <Stack spacing={0}>
          {userIsWithinRegion && (
            <Text color='green' size='xs'>
              <IconMapPin size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
              You are currently in this region
            </Text>
          )}
          {userIsContributor && (
            <Text color='gray' size='xs'>
              <IconEdit size={16} style={{ verticalAlign: 'text-bottom' }} />{' '}
              You are a contributor for this region
            </Text>
          )}
          {(userIsContributor || loggedInUser?.role === 'admin') &&
            region.nogoLength < 5000 && (
              <Text color='red' size='xs'>
                <IconExclamationCircle
                  size={16}
                  style={{ verticalAlign: 'text-bottom' }}
                />{' '}
                This region is hidden from users until it has at least 5km of
                nogos
              </Text>
            )}
          <Text>{region.name}</Text>
          {!!region.iso31662?.nameWithCountry && (
            <Text size='sm' color='dimmed'>
              {region.iso31662?.nameWithCountry}
            </Text>
          )}
          <Text size='sm' color='dimmed'>
            Total nogos: {metresToDistanceString(region.nogoLength, 1)}
          </Text>
          <Anchor size='sm' onClick={toggleDetails}>
            {showDetails ? 'Hide details' : 'See details'}
          </Anchor>
        </Stack>
        <Group
          position='right'
          spacing='xs'
          style={{ flexWrap: 'wrap-reverse' }}
        >
          {userIsContributor && (
            <Group spacing={0} noWrap>
              <Tooltip label='Export data' withArrow>
                <ActionIcon
                  size={36}
                  variant='transparent'
                  radius='md'
                  color='gray'
                  onClick={() => region.downloadNogos()}
                >
                  <IconDownload size='1.125rem' />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Edit nogos' withArrow>
                <ActionIcon
                  size={36}
                  variant='transparent'
                  radius='md'
                  color='gray'
                  onClick={() => {
                    setEditingGroupOrRegion(region);
                    map?.flyToBounds(region.getBounds(), { duration: 0 });
                    modals.closeAll();
                  }}
                >
                  <IconEdit size='1.125rem' />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
          <Tooltip label={isSelected ? 'Deselect' : 'Select'} withArrow>
            <ActionIcon
              size={36}
              variant={isSelected ? 'filled' : 'outline'}
              radius='md'
              color='green'
              onClick={toggleSelect}
            >
              {isSelected ? (
                <IconCheck size='1.125rem' />
              ) : (
                <IconPlus size='1.125rem' />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Collapse in={showDetails}>
        <Group
          position='apart'
          spacing='xs'
          align='flex-start'
          noWrap={!isMobileSize}
        >
          {showMap ? (
            <MapContainer
              key={`${isMobileSize}`}
              bounds={region.getBounds()}
              style={{
                height: 300,
                minWidth: isMobileSize ? '100%' : 300,
                borderRadius: '12px',
              }}
              scrollWheelZoom={false}
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
              <GeoJSON
                key={region._id}
                data={region.polygon}
                style={{
                  color: 'grey',
                  weight: 4,
                  opacity: 1.0,
                  fillOpacity: 0.1,
                }}
              ></GeoJSON>
              <Paper
                px='xs'
                py='0.325rem'
                radius='md'
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 100000,
                }}
              >
                <Group noWrap align='center' position='center' spacing='xs'>
                  <Text size='xs'>Nogos</Text>
                  <hr
                    style={{
                      height: 3,
                      borderWidth: 0,
                      backgroundColor: theme.colors.red[7],
                      width: 16,
                      borderRadius: 50,
                    }}
                  />
                </Group>
              </Paper>
            </MapContainer>
          ) : (
            <Flex
              justify='center'
              align='center'
              style={{
                height: 300,
                minWidth: isMobileSize ? '100%' : 300,
                borderRadius: '12px',
                backgroundColor: theme.colors.gray[3],
              }}
            >
              <Loader />
            </Flex>
          )}

          <Paper
            p='xs'
            radius='md'
            bg={theme.colors.gray[1]}
            h={300}
            w={isMobileSize ? '100%' : 'unset'}
          >
            <ScrollArea h='100%'>
              <Stack spacing='xs'>
                <Text size='md' align='center'>
                  The nogos in this region are mantained by:
                </Text>
                {region.contributors.map((contributor) => (
                  <RegionContributorCard contributor={contributor} />
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        </Group>
      </Collapse>
    </Paper>
  );
};
