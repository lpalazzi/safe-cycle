import React, { createContext, useContext, useState, useEffect } from 'react';
import L from 'leaflet';
import { useGlobalContext } from './globalContext';
import { ID, Location, Waypoint } from 'types';
import { Nogo } from 'models';
import { NogoApi, RouterApi } from 'api';
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
      setWaypoints: (waypoints: Waypoint[]) => void;
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
  const { editingNogoGroup, selectedNogoGroups, routeOptions } =
    useGlobalContext();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [followUser, setFollowUser] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  // const [waypoints, setWaypoints] = useState<Waypoint[]>([
  //   {
  //     latlng: new L.LatLng(42.2425451, -82.9843214),
  //     label: 'Current location',
  //   },
  //   {
  //     latlng: new L.LatLng(42.27273618224211, -82.98179626464844),
  //   },
  //   {
  //     latlng: new L.LatLng(42.297373449020185, -83.00634384155275),
  //   },
  //   {
  //     latlng: new L.LatLng(42.31806638425365, -82.98025131225587),
  //   },
  //   {
  //     latlng: new L.LatLng(42.29584977392906, -83.05372238159181),
  //   },
  // ]);
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

  const addWaypoint = (latlng: L.LatLng, label?: string) => {
    const newWaypoint = {
      latlng,
      label,
    };
    if (!editingNogoGroup) {
      setWaypoints([...waypoints, newWaypoint]);
    } else {
      setNogoWaypoints([...nogoWaypoints, latlng]);
    }
  };

  const updateWaypoint = (index: number, latlng: L.LatLng, label?: string) => {
    const updatedWaypoint = {
      latlng,
      label,
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
    if (mousePosition && editingNogoGroup && nogoWaypoints.length === 1) {
      setLineToCursor([nogoWaypoints[0], mousePosition]);
    } else {
      setLineToCursor(null);
    }
  };

  useEffect(() => {
    if (!editingNogoGroup && waypoints.length >= 2) {
      setFetchingCount((prev) => prev + 1);
      RouterApi.generateRoute(
        waypoints.map((waypoint) => waypoint.latlng),
        selectedNogoGroups,
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
  }, [waypoints, selectedNogoGroups, editingNogoGroup, routeOptions]);

  useEffect(() => {
    if (nogoWaypoints.length >= 2 && editingNogoGroup) {
      NogoApi.create(nogoWaypoints, editingNogoGroup._id)
        .then(() => {
          refreshNogoRoutes();
          clearNogoWaypoints();
        })
        .catch((err) => {
          clearNogoWaypoints();
          showNotification({
            title: 'Error creating Nogo',
            message: err.message || 'Undefined error',
            color: 'red',
          });
        });
    }
  }, [nogoWaypoints]);

  const refreshNogoRoutes = async () => {
    try {
      if (editingNogoGroup) {
        NogoApi.getAllByList(editingNogoGroup._id).then(setNogoRoutes);
      } else {
        const fetchedNogos: Nogo[] = (
          await Promise.all(
            selectedNogoGroups.map(async (selectedNogoGroup) => {
              return NogoApi.getAllByList(selectedNogoGroup);
            })
          )
        ).flat();
        setNogoRoutes(fetchedNogos);
      }
    } catch (error: any) {
      showNotification({
        title: 'Error fetching Nogos',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    refreshNogoRoutes();
    if (!editingNogoGroup) {
      clearNogoWaypoints();
    }
  }, [editingNogoGroup, selectedNogoGroups]);

  const deleteNogo = async (nogoId: ID) => {
    try {
      const deletedCount = await NogoApi.delete(nogoId);
      showNotification({
        message:
          deletedCount > 0 ? '1 Nogo was deleted' : 'Nogo was not deleted',
        color: deletedCount > 0 ? 'green' : 'red',
      });
      refreshNogoRoutes();
    } catch (error: any) {
      showNotification({
        title: 'Error deleting Nogo',
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
        setWaypoints,
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
