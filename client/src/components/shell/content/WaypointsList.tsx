import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  DndProvider,
  useDrag,
  useDrop,
  useDragLayer,
  XYCoord,
} from 'react-dnd';
import type { Identifier } from 'dnd-core';
import {
  MultiBackend,
  TouchTransition,
  PointerTransition,
  MultiBackendOptions,
} from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
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
  Paper,
  Button,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconX, IconGripHorizontal } from '@tabler/icons-react';

import { GeocodingApi } from 'api';
import { Waypoint } from 'types';
import { GeocodeSearchResult } from 'api/interfaces/Geocoding';
import { useMapContext } from 'contexts/mapContext';

export const WaypointsList: React.FC = () => {
  const {
    map,
    waypoints,
    currentLocation,
    addWaypoint,
    reorderWaypoint,
    removeWaypoint,
    clearWaypoints,
  } = useMapContext();

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
      const res = await GeocodingApi.search(
        query,
        map?.getBounds().pad(Math.max(0, 1 + 0.5 * (map.getZoom() - 10)))
      );
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
    if (value === 'location') {
      handleCurrentLocationSelect();
      return;
    }
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
    if (currentLocation) {
      addWaypoint(currentLocation.latlng, 'Current location');
    } else {
      map?.once('locationfound', (e) => {
        const { latlng, heading } = e;
        addWaypoint(latlng, 'Current location');
      });
      map?.locate();
    }
  };

  useEffect(() => {
    return handleGeoSearchValueChanged.cancel();
  });

  useEffect(() => {
    handleGeoSearchValueChanged(geoSearchValue);
  }, [geoSearchValue]);

  const geoSearchResultOptions: SelectItem[] =
    geoSearchValue === ''
      ? [
          {
            value: 'location',
            label: 'Your current location',
          },
        ]
      : geoSearchResults.map((geoSearchResult) => {
          return {
            value: geoSearchResult.place_id.toString(),
            label: geoSearchResult.display_name,
          };
        });

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <Stack spacing='xl'>
        <Text size='sm'>
          Search for your destination, or select points on the map.
        </Text>
        <Stack spacing={0}>
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
                value={null}
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
          {waypoints.length > 0 ? (
            <Group position='right'>
              <Button
                compact
                size='xs'
                variant='subtle'
                color='gray'
                rightIcon={<IconX size={14} />}
                onClick={clearWaypoints}
              >
                Clear all
              </Button>
            </Group>
          ) : null}
        </Stack>
      </Stack>
      <CustomPreviewLayer />
    </DndProvider>
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

  const label =
    waypoint.label ??
    waypoint.latlng.lat.toFixed(6) + ', ' + waypoint.latlng.lng.toFixed(6);

  const [{ isHoverOutside }, drag, preview] = useDrag({
    type: 'waypoint',
    item: () => {
      return { id, curIndex: index, srcIndex: index, label: label };
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

  return (
    <Paper ref={ref} data-handler-id={handlerId} pt={8} pb={8}>
      <Group position='apart' noWrap style={{ opacity }}>
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
      <div ref={preview} style={{ display: 'none' }} />
    </Paper>
  );
};

const CustomPreviewLayer: React.FC = () => {
  const { isDragging, item, initialOffset, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );
  if (!isDragging) return null;
  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div style={getItemStyles(initialOffset, currentOffset)}>
        <Paper p={8} w={350} withBorder>
          <Group position='apart' noWrap>
            <Text lineClamp={1} size='sm' style={{ lineHeight: '36px' }}>
              {item.label}
            </Text>
          </Group>
        </Paper>
      </div>
    </div>
  );
};

const HTML5toTouch: MultiBackendOptions = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: PointerTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { delayTouchStart: 100 },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  let { x, y } = currentOffset;
  x -= 275;
  y -= 25;

  const transform = `translate(${x}px, ${y}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}
