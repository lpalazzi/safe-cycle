import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { LatLng } from 'leaflet';
import debounce from 'lodash.debounce';
import {
  Stack,
  Timeline,
  Group,
  ActionIcon,
  Select,
  Text,
  SelectItem,
  Button,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconLocation, IconX, IconGripHorizontal } from '@tabler/icons-react';

import { GeocodingApi } from 'api';
import { GeocodeSearchResult } from 'api/interfaces/Geocoding';
import { useMapContext } from 'contexts/mapContext';
import { Waypoint } from 'types';

export const WaypointsList: React.FC = () => {
  const { map, waypoints, addWaypoint, setWaypoints, removeWaypoint } =
    useMapContext();

  const [draggableWaypoints, setDraggableWaypoints] = useState(waypoints);
  const [geoSearchValue, setGeoSearchValue] = useState<string>('');
  const [geoSearchResults, setGeoSearchResults] = useState<
    GeocodeSearchResult[]
  >([]);

  useEffect(() => setDraggableWaypoints(waypoints), [waypoints]);

  const reorderDraggableWaypoint = (srcIndex: number, destIndex: number) => {
    const newWaypoints = [...draggableWaypoints];
    const [reorderedWaypoint] = newWaypoints.splice(srcIndex, 1);
    newWaypoints.splice(destIndex, 0, reorderedWaypoint);
    setDraggableWaypoints(newWaypoints);
  };

  const executeGeoSearch = async (query: string) => {
    if (query === '') {
      setGeoSearchResults([]);
      return;
    }

    try {
      const res = await GeocodingApi.search(query, map?.getBounds());
      setGeoSearchResults(res);
    } catch (error: any) {
      showNotification({
        title: 'Error searching location',
        message: error.message || 'Undefined error',
        color: 'red',
      });
      setGeoSearchResults([]);
    }
  };

  const handleGeoSearchValueChanged = useMemo(() => {
    return debounce(executeGeoSearch, 300);
  }, [map]);

  const handleLocationSelect = (value: string | null) => {
    const selectedGeoSearchResult = geoSearchResults.find(
      (geoSearchResult) => geoSearchResult.place_id.toString() === value
    );
    if (selectedGeoSearchResult) {
      addWaypoint(
        new LatLng(
          Number(selectedGeoSearchResult.lat),
          Number(selectedGeoSearchResult.lon)
        ),
        selectedGeoSearchResult.display_name
      );
    }
  };

  const handleCurrentLocationSelect = () => {
    map?.once('locationfound', (e) => {
      const { latlng, heading } = e;
      addWaypoint(latlng, 'Current location');
    });
    map?.locate();
  };

  useEffect(() => {
    return handleGeoSearchValueChanged.cancel();
  });

  useEffect(() => {
    handleGeoSearchValueChanged(geoSearchValue);
  }, [geoSearchValue]);

  const geoSearchResultOptions: SelectItem[] = geoSearchResults.map(
    (geoSearchResult) => {
      return {
        value: geoSearchResult.place_id.toString(),
        label: geoSearchResult.display_name,
      };
    }
  );

  return (
    <Stack spacing='xl'>
      <Text size='sm'>
        Search for your destination, or select points on the map to add to your
        route.
      </Text>
      <Timeline
        style={{ zIndex: 100 }}
        active={draggableWaypoints.length - 1}
        bulletSize={20}
        styles={{
          item: { ':not(:first-of-type)': { marginTop: '18px !important' } },
          itemContent: { transform: 'translateY(-8px)' },
        }}
      >
        {draggableWaypoints.length === 0 ? (
          <Timeline.Item lineVariant='dotted'>
            <Button
              leftIcon={<IconLocation size={18} />}
              onClick={handleCurrentLocationSelect}
              fullWidth
            >
              Start at your current location
            </Button>
          </Timeline.Item>
        ) : null}
        {draggableWaypoints.map((waypoint, index) => {
          const ref = useRef(null);
          const [{ handlerId, isOver }, drop] = useDrop<
            DragItem,
            void,
            { handlerId: Identifier | null; isOver: boolean }
          >({
            accept: 'waypoint',
            collect(monitor) {
              return {
                handlerId: monitor.getHandlerId(),
                isOver: monitor.isOver(),
              };
            },
            drop() {
              setWaypoints(draggableWaypoints);
            },
            hover(item: DragItem) {
              if (!ref.current) return;
              const dragIndex = item.index;
              const hoverIndex = index;
              if (dragIndex === hoverIndex) {
                return;
              }
              reorderDraggableWaypoint(dragIndex, hoverIndex);
              item.index = hoverIndex;
            },
          });
          drop(ref);
          return (
            <Timeline.Item
              ref={ref}
              data-handler-id={handlerId}
              bullet={<Text size={12}>{index + 1}</Text>}
              lineVariant='dotted'
            >
              <DraggableWaypointItem
                id={index}
                index={index}
                waypoint={waypoint}
                isHoveredOver={isOver}
                removeWaypoint={removeWaypoint}
              />
            </Timeline.Item>
          );
        })}
        <Timeline.Item lineVariant='dotted'>
          <Select
            key={draggableWaypoints.length}
            searchable
            placeholder='Search for a location'
            data={geoSearchResultOptions}
            onSearchChange={setGeoSearchValue}
            onChange={handleLocationSelect}
            searchValue={geoSearchValue}
            nothingFound='No results found'
            filter={() => true}
            rightSection={<div></div>}
          />
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
};

type DraggableWaypointItemProps = {
  id: number;
  index: number;
  waypoint: Waypoint;
  isHoveredOver: boolean;
  removeWaypoint: (index: number) => void;
};

type DragItem = {
  index: number;
  id: string;
  type: string;
};

const DraggableWaypointItem: React.FC<DraggableWaypointItemProps> = ({
  id,
  index,
  waypoint,
  isHoveredOver,
  removeWaypoint,
}) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'waypoint',
    item: () => {
      return { id, index };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isHoveredOver ? 0 : 1;

  const label =
    waypoint.label ??
    waypoint.latlng.lat.toFixed(6) + ', ' + waypoint.latlng.lng.toFixed(6);

  return (
    <Group
      ref={preview}
      position='apart'
      pt={4}
      pb={4}
      noWrap
      style={{ opacity }}
    >
      <Text lineClamp={1} size='sm'>
        {label}
      </Text>
      <Group position='right' spacing='xs'>
        <ActionIcon ref={drag}>
          <IconGripHorizontal size={18} />
        </ActionIcon>
        <ActionIcon onClick={() => removeWaypoint(index)}>
          <IconX size={18} />
        </ActionIcon>
      </Group>
    </Group>
  );
};
