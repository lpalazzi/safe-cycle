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
import {
  IconX,
  IconGripHorizontal,
  IconList,
  IconDownload,
} from '@tabler/icons-react';

import { GeocodingApi } from 'api';
import { Waypoint, GeocodeSearchResult } from 'types';
import { useMapContext } from 'contexts/mapContext';
import { TurnInstructions } from './TurnInstructions';
import { FeatureFlags } from 'featureFlags';
import { useGlobalContext } from 'contexts/globalContext';

export const WaypointsList: React.FC = () => {
  const { loggedInUser, setIsLoading } = useGlobalContext();
  const {
    map,
    waypoints,
    currentLocation,
    routes,
    askForStartingLocation,
    selectedRouteIndex,
    addWaypoint,
    reorderWaypoint,
    removeWaypoint,
    clearWaypoints,
    downloadGPX,
  } = useMapContext();

  const [draggableWaypoints, setDraggableWaypoints] = useState(waypoints);
  const [geoSearchValue, setGeoSearchValue] = useState<string>('');
  const [geoSearchResults, setGeoSearchResults] = useState<
    GeocodeSearchResult[]
  >([]);
  const [showTurnInstructions, setShowTurnInstructions] = useState(false);
  const [savedSearches, setSavedSearches] = useState<GeocodeSearchResult[]>([]);

  useEffect(() => {
    const storedSearchesStr = window.localStorage.getItem('savedSearches');
    if (storedSearchesStr) {
      try {
        const storedSearches = (JSON.parse(storedSearchesStr) as any[]).map(
          (storedSearch) => {
            return {
              label: storedSearch.label,
              latlng:
                storedSearch.latlng?.lat && storedSearch.latlng?.lng
                  ? new LatLng(storedSearch.latlng.lat, storedSearch.latlng.lng)
                  : undefined,
            } as GeocodeSearchResult;
          }
        );
        setSavedSearches(storedSearches);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => setDraggableWaypoints(waypoints), [waypoints]);
  useEffect(
    () => setShowTurnInstructions(false),
    [waypoints, selectedRouteIndex, routes]
  );

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
    if (query === '' || !map) {
      setGeoSearchResults([]);
      return;
    }

    try {
      const res = await GeocodingApi.search(
        query,
        map?.getBounds().pad(Math.max(0, 1 + 0.5 * (map.getZoom() - 10))),
        currentLocation?.latlng
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
  }, [map, currentLocation]);

  const handleLocationSelect = async (value: string | null) => {
    if (value === 'location') {
      handleCurrentLocationSelect();
      return;
    }
    const selectedGeoSearchResult = [
      ...geoSearchResults,
      ...savedSearches,
    ].find((geoSearchResult) => geoSearchResult.label === value);
    if (selectedGeoSearchResult) {
      try {
        const latlng =
          selectedGeoSearchResult.latlng ??
          (await GeocodingApi.geocode(selectedGeoSearchResult.label));

        if (!latlng) throw new Error('Unable to locate selected search result');

        addWaypoint(
          new LatLng(Number(latlng.lat), Number(latlng.lng)),
          selectedGeoSearchResult.label
        );

        const newSavedSearch: GeocodeSearchResult = {
          ...selectedGeoSearchResult,
          latlng,
        };
        const newSavedSearches = [
          newSavedSearch,
          ...savedSearches.filter(
            (savedSearch) => savedSearch.label !== newSavedSearch.label
          ),
        ];
        if (newSavedSearches.length > 10) newSavedSearches.length = 10;
        setSavedSearches(newSavedSearches);
        window.localStorage.setItem(
          'savedSearches',
          JSON.stringify(newSavedSearches)
        );
      } catch (error: any) {
        showNotification({
          title: 'Geocoding error',
          message: error.message || 'Unable to locate selected search result',
          color: 'red',
        });
      }
    }
  };

  const handleCurrentLocationSelect = () => {
    if (currentLocation) {
      addWaypoint(currentLocation.latlng, 'Current location');
    } else {
      setIsLoading(true);
      map?.once('locationfound', (e) => {
        const { latlng, heading } = e;
        addWaypoint(latlng, 'Current location');
        setIsLoading(false);
      });
      map?.once('locationerror', (e) => {
        setIsLoading(false);
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

  const currentLocationItems: SelectItem[] =
    waypoints.length === 0
      ? []
      : [
          {
            value: 'location',
            label: 'Your current location',
          },
        ];

  const geoSearchResultOptions: SelectItem[] =
    geoSearchValue === ''
      ? [
          ...currentLocationItems,
          ...savedSearches
            .filter(
              (savedSearch) =>
                !waypoints.find((waypoint) =>
                  savedSearch.latlng?.equals(waypoint.latlng)
                )
            )
            .map((geoSearchResult) => {
              return {
                value: geoSearchResult.label,
                label: geoSearchResult.label,
              };
            }),
        ]
      : geoSearchResults.map((geoSearchResult) => {
          return {
            value: geoSearchResult.label,
            label: geoSearchResult.label,
          };
        });

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <Stack spacing='xl' className='waypoints'>
        <Text size='sm'>
          Search for your destination, or select points on the map.
        </Text>
        <Stack spacing={0}>
          <Timeline
            style={{ position: 'relative', zIndex: 1 }}
            active={draggableWaypoints.length - 1}
            reverseActive={askForStartingLocation}
            bulletSize={20}
            styles={{
              item: {
                marginTop: '0px !important',
                '::before': {
                  inset: '0px auto -16px -4px',
                },
                ':nth-child(2)': askForStartingLocation
                  ? {
                      marginTop: '8px !important',
                    }
                  : {},
              },
              itemContent: {
                transform: 'translateY(-15px)',
              },
              itemBullet: { zIndex: 2 },
            }}
          >
            {askForStartingLocation ? (
              <Timeline.Item lineVariant='dotted' style={{ zIndex: 2 }}>
                <Select
                  key={draggableWaypoints.length}
                  searchable
                  placeholder='Search for a starting point'
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
            ) : null}
            {draggableWaypoints.map((waypoint, index) => {
              return (
                <Timeline.Item
                  bullet={
                    <Text size={12}>
                      {index + (askForStartingLocation ? 2 : 1)}
                    </Text>
                  }
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
            {!askForStartingLocation ? (
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
            ) : null}
          </Timeline>
          <Stack spacing='md'>
            {waypoints.length > 0 ? (
              <Group position='apart'>
                <Group position='left' spacing={0}>
                  {!!routes &&
                  (selectedRouteIndex || selectedRouteIndex === 0) &&
                  waypoints.length > 1 ? (
                    <>
                      {FeatureFlags.TurnInstructions.isEnabledForUser(
                        loggedInUser?._id
                      ) ? (
                        <Button
                          size='xs'
                          variant='subtle'
                          color='gray'
                          leftIcon={<IconList size={16} />}
                          styles={{ leftIcon: { marginRight: 5 } }}
                          onClick={() =>
                            setShowTurnInstructions((prev) => !prev)
                          }
                        >
                          Details
                        </Button>
                      ) : null}
                      <Button
                        size='xs'
                        variant='subtle'
                        color='gray'
                        leftIcon={<IconDownload size={16} />}
                        styles={{ leftIcon: { marginRight: 5 } }}
                        onClick={downloadGPX}
                      >
                        GPX
                      </Button>
                    </>
                  ) : null}
                </Group>
                <Button
                  size='xs'
                  variant='subtle'
                  color='gray'
                  leftIcon={<IconX size={16} />}
                  styles={{ leftIcon: { marginRight: 5 } }}
                  onClick={() => {
                    setShowTurnInstructions(false);
                    clearWaypoints();
                  }}
                >
                  Clear
                </Button>
              </Group>
            ) : null}
            <TurnInstructions show={showTurnInstructions} />
          </Stack>
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
  const [label, setLabel] = useState<string | null>();

  useEffect(() => {
    Promise.resolve(waypoint.label).then(setLabel);
  }, [waypoint]);

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
          {label ||
            waypoint.latlng.lat.toFixed(6) +
              ', ' +
              waypoint.latlng.lng.toFixed(6)}
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
        zIndex: 1,
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
