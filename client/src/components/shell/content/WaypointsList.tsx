import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier } from 'dnd-core';
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
  Paper,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconLocation, IconX, IconGripHorizontal } from '@tabler/icons-react';

import { GeocodingApi } from 'api';
import { GeocodeSearchResult } from 'api/interfaces/Geocoding';
import { useMapContext } from 'contexts/mapContext';
import { Waypoint } from 'types';

export const WaypointsList: React.FC = () => {
  const { map, waypoints, addWaypoint, reorderWaypoint, removeWaypoint } =
    useMapContext();

  const [draggableWaypoints, setDraggableWaypoints] = useState(waypoints);
  const [geoSearchValue, setGeoSearchValue] = useState<string>('');
  const [geoSearchResults, setGeoSearchResults] = useState<
    GeocodeSearchResult[]
  >([]);

  useEffect(() => setDraggableWaypoints(waypoints), [waypoints]);

  const reorderDraggableWaypoint = useCallback(
    (srcIndex: number, destIndex: number) => {
      setDraggableWaypoints((prevWaypoints) => {
        const newWaypoints = [...prevWaypoints];
        const [reorderedWaypoint] = newWaypoints.splice(srcIndex, 1);
        newWaypoints.splice(destIndex, 0, reorderedWaypoint);
        return newWaypoints;
      });
    },
    [waypoints]
  );

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
    <Stack spacing='md'>
      <Text size='sm'>
        Search for your destination, or select points on the map to add to your
        route.
      </Text>
      <Timeline
        style={{ zIndex: 100 }}
        active={draggableWaypoints.length - 1}
        bulletSize={20}
        styles={{
          item: {
            marginTop: '0px !important',
            '::before': {
              inset: '0px auto -16px -4px',
            },
          },
          itemContent: {
            transform: 'translateY(-15px)',
          },
        }}
      >
        {draggableWaypoints.length === 0 ? (
          <Timeline.Item lineVariant='dotted' pt={8} pb={8}>
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
          return (
            <Timeline.Item
              bullet={<Text size={12}>{index + 1}</Text>}
              lineVariant='dotted'
            >
              <DraggableWaypointItem
                id={waypoint.label + waypoint.latlng.toString()}
                index={index}
                waypoint={waypoint}
                disableDrag={draggableWaypoints.length === 1}
                reorderDraggableWaypoint={reorderDraggableWaypoint}
                onDrop={reorderWaypoint}
                onCancel={() => setDraggableWaypoints(waypoints)}
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
            pt={8}
          />
        </Timeline.Item>
      </Timeline>
    </Stack>
  );
};

type DraggableWaypointItemProps = {
  id: string;
  index: number;
  waypoint: Waypoint;
  disableDrag: boolean;
  onDrop: (srcIndex: number, destIndex: number) => void;
  onCancel: () => void;
  reorderDraggableWaypoint: (srcIndex: number, destIndex: number) => void;
  removeWaypoint: (index: number) => void;
};

type DragItem = {
  srcIndex: number;
  curIndex: number;
  id: string;
  type: string;
};

const DraggableWaypointItem: React.FC<DraggableWaypointItemProps> = ({
  id,
  index,
  waypoint,
  disableDrag,
  onDrop,
  onCancel,
  reorderDraggableWaypoint,
  removeWaypoint,
}) => {
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
    drop(item) {
      onDrop(item.srcIndex, index);
    },
    hover(item: DragItem) {
      const dragIndex = isHoverOutside ? item.srcIndex : item.curIndex;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      reorderDraggableWaypoint(dragIndex, hoverIndex);
      item.curIndex = index;
    },
  });

  const [{ isHoverOutside }, drag, preview] = useDrag({
    type: 'waypoint',
    item: () => {
      return { id, curIndex: index, srcIndex: index };
    },
    collect: (monitor) => ({
      isHoverOutside: monitor.getTargetIds().length === 0,
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop();
      if (!didDrop) {
        onCancel();
      }
    },
  });

  useEffect(() => {
    if (isHoverOutside) onCancel();
  }, [isHoverOutside]);

  drop(ref);

  const opacity = isOver ? 0 : 1;

  const label =
    waypoint.label ??
    waypoint.latlng.lat.toFixed(6) + ', ' + waypoint.latlng.lng.toFixed(6);

  return (
    <Paper ref={ref} data-handler-id={handlerId} pt={8} pb={8}>
      <Group ref={preview} position='apart' noWrap style={{ opacity }}>
        <Text lineClamp={1} size='sm' style={{ lineHeight: '36px' }}>
          {label}
        </Text>
        <Group position='right' spacing='xs' noWrap>
          {disableDrag ? null : (
            <ActionIcon ref={drag} style={{ cursor: 'grab' }}>
              <IconGripHorizontal size={20} />
            </ActionIcon>
          )}
          <ActionIcon onClick={() => removeWaypoint(index)}>
            <IconX size={20} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
};