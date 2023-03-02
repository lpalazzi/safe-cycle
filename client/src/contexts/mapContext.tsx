import React, { createContext, useContext, useState, useEffect } from 'react';
import L from 'leaflet';
import { useGlobalContext } from './globalContext';
import { ID, Location, Waypoint } from 'types';
import { Nogo } from 'models';
import { GeocodingApi, NogoApi, RouterApi } from 'api';
import { BrouterProperties } from 'api/interfaces/Router';
import { showNotification } from '@mantine/notifications';

type MapContextType =
  | {
      // states
      map: L.Map | null;
      currentLocation: Location | null;
      followUser: boolean;
      waypoints: Waypoint[];
      route: GeoJSON.LineString | null;
      routeProperties: BrouterProperties | null;
      nogoRoutes: Nogo[];
      lineToCursor: [L.LatLng, L.LatLng] | null;
      loadingRoute: boolean;
      // functions
      setMap: (map: L.Map) => void;
      setCurrentLocation: (location: Location | null) => void;
      setFollowUser: (val: boolean) => void;
      addWaypoint: (latlng: L.LatLng, label?: string) => void;
      updateWaypoint: (index: number, latlng: L.LatLng, label?: string) => void;
      reorderWaypoint: (sourceIndex: number, destIndex: number) => void;
      removeWaypoint: (index: number) => void;
      clearWaypoints: () => void;
      deleteNogo: (nogoId: ID) => void;
      clearNogoWaypoints: () => void;
      refreshWaypointLineToCursor: (mousePosition: L.LatLng | null) => void;
    }
  | undefined;

const MapContext = createContext<MapContextType>(undefined);
MapContext.displayName = 'MapContext';

type MapContextProviderType = {
  children?: React.ReactNode;
};

export const MapContextProvider: React.FC<MapContextProviderType> = (props) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const {
    loggedInUser,
    editingGroupOrRegion,
    selectedNogoGroups,
    routeOptions,
    regions,
    clearSelectedNogoGroups,
    setEditingGroupOrRegion,
  } = useGlobalContext();

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [followUser, setFollowUser] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [nogoWaypoints, setNogoWaypoints] = useState<L.LatLng[]>([]);
  const [route, setRoute] = useState<GeoJSON.LineString | null>(null);
  const [routeProperties, setRouteProperties] =
    useState<BrouterProperties | null>(null);
  const [lineToCursor, setLineToCursor] = useState<[L.LatLng, L.LatLng] | null>(
    null
  );
  const [nogoRoutes, setNogoRoutes] = useState<Nogo[]>([]);
  const [fetchingCount, setFetchingCount] = useState(0);
  const loadingRoute = fetchingCount > 0;

  const addWaypoint = async (latlng: L.LatLng, label?: string) => {
    const newWaypoint = {
      latlng,
      label,
    };
    if (!label) {
      newWaypoint.label = await GeocodingApi.reverse(latlng);
    } else if (!editingGroupOrRegion) {
      const bounds = new L.LatLngBounds(latlng, latlng);
      waypoints.forEach((waypoint) => {
        bounds.extend(waypoint.latlng);
      });
      map?.fitBounds(bounds, { maxZoom: 17 });
    }
    if (!editingGroupOrRegion) {
      setWaypoints([...waypoints, newWaypoint]);
    } else {
      setNogoWaypoints([...nogoWaypoints, latlng]);
    }
  };

  const updateWaypoint = async (
    index: number,
    latlng: L.LatLng,
    label?: string
  ) => {
    const updatedWaypoint = {
      latlng,
      label: label ?? (await GeocodingApi.reverse(latlng)),
    };
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1, updatedWaypoint);
    setWaypoints(newWaypoints);
  };

  const reorderWaypoint = (srcIndex: number, destIndex: number) => {
    const newWaypoints = [...waypoints];
    const [reorderedWaypoint] = newWaypoints.splice(srcIndex, 1);
    newWaypoints.splice(destIndex, 0, reorderedWaypoint);
    setWaypoints(newWaypoints);
  };

  const removeWaypoint = (index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);
  };

  const clearWaypoints = () => {
    setWaypoints([]);
  };

  const clearNogoWaypoints = () => {
    setNogoWaypoints([]);
  };

  const refreshWaypointLineToCursor = (mousePosition: L.LatLng | null) => {
    if (mousePosition && editingGroupOrRegion && nogoWaypoints.length === 1) {
      setLineToCursor([nogoWaypoints[0], mousePosition]);
    } else {
      setLineToCursor(null);
    }
  };

  useEffect(() => {
    if (!editingGroupOrRegion && waypoints.length >= 2) {
      const regionIds: ID[] = routeOptions.avoidLowComfort
        ? regions.map((region) => region._id)
        : [];
      setFetchingCount((prev) => prev + 1);
      RouterApi.generateRoute(
        waypoints.map((waypoint) => waypoint.latlng),
        selectedNogoGroups,
        regionIds,
        routeOptions
      )
        .then((res) => {
          setRoute(res.route);
          setRouteProperties(res.properties);
          setFetchingCount((prev) => prev - 1);
        })
        .catch((err) => {
          setFetchingCount((prev) => prev - 1);
          if (
            !String(err.message).includes(
              'operation killed by thread-priority-watchdog'
            )
          ) {
            showNotification({
              title: 'Error fetching route',
              message: err.message || 'Undefined error',
              color: 'red',
            });
          }
        });
    } else {
      setRoute(null);
      setRouteProperties(null);
    }
  }, [waypoints, selectedNogoGroups, editingGroupOrRegion, routeOptions]);

  useEffect(() => {
    if (nogoWaypoints.length >= 2 && editingGroupOrRegion) {
      NogoApi.create(
        nogoWaypoints,
        editingGroupOrRegion._id,
        editingGroupOrRegion.isRegion
      )
        .then(() => {
          refreshNogoRoutes();
          clearNogoWaypoints();
        })
        .catch((err) => {
          clearNogoWaypoints();
          showNotification({
            title: 'Error creating nogo',
            message: err.message || 'Undefined error',
            color: 'red',
          });
        });
    }
  }, [nogoWaypoints]);

  const refreshNogoRoutes = async () => {
    try {
      if (editingGroupOrRegion) {
        NogoApi.getAllByGroup(
          editingGroupOrRegion._id,
          editingGroupOrRegion.isRegion
        ).then(setNogoRoutes);
      } else {
        const fetchedNogos: Nogo[] = (
          await Promise.all(
            selectedNogoGroups.map(async (selectedNogoGroup) => {
              return NogoApi.getAllByGroup(selectedNogoGroup, false);
            })
          )
        ).flat();
        if (routeOptions.avoidLowComfort) {
          const fetchedRegionNogos: Nogo[] = (
            await Promise.all(
              regions.map(async (region) => {
                return NogoApi.getAllByGroup(region._id, true);
              })
            )
          ).flat();
          fetchedNogos.push(...fetchedRegionNogos);
        }
        setNogoRoutes(fetchedNogos);
      }
    } catch (error: any) {
      showNotification({
        title: 'Error fetching n',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    refreshNogoRoutes();
    if (!editingGroupOrRegion) {
      clearNogoWaypoints();
    }
  }, [editingGroupOrRegion, selectedNogoGroups, routeOptions.avoidLowComfort]);

  useEffect(() => {
    if (!loggedInUser) {
      clearNogoWaypoints();
      clearWaypoints();
      clearSelectedNogoGroups();
      setEditingGroupOrRegion(null);
    }
  }, [loggedInUser]);

  const deleteNogo = async (nogoId: ID) => {
    try {
      const deletedCount = await NogoApi.delete(nogoId);
      showNotification({
        message:
          deletedCount > 0 ? '1 nogo was deleted' : 'Nogo was not deleted',
        color: deletedCount > 0 ? 'green' : 'red',
      });
      refreshNogoRoutes();
    } catch (error: any) {
      showNotification({
        title: 'Error deleting nogo',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <MapContext.Provider
      value={{
        map,
        currentLocation,
        followUser,
        waypoints,
        route,
        routeProperties,
        nogoRoutes,
        lineToCursor,
        loadingRoute,
        setMap,
        setCurrentLocation,
        setFollowUser,
        addWaypoint,
        updateWaypoint,
        reorderWaypoint,
        removeWaypoint,
        clearWaypoints,
        deleteNogo,
        clearNogoWaypoints,
        refreshWaypointLineToCursor,
      }}
    >
      {props.children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be inside a MapContextProvider');
  }
  return context;
};
