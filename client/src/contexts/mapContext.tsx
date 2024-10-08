import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import L from 'leaflet';
import { showNotification } from '@mantine/notifications';
import { useGlobalContext } from './globalContext';
import { ID, Location, Waypoint } from 'types';
import { Nogo, TurnInstruction } from 'models';
import { GeocodingApi, NogoApi, RouterApi } from 'api';
import { RouteData } from 'api/interfaces/Router';
import { FeatureFlags } from 'featureFlags';
import { isTouchDevice } from 'utils/device';

type MapContextType =
  | {
      // states
      map: L.Map | null;
      zoomLevel: number | null;
      currentLocation: Location | null;
      followUser: boolean;
      waypoints: Waypoint[];
      nogoWaypoints: L.LatLng[];
      askForStartingLocation: boolean;
      routes: RouteData[] | null;
      selectedRouteIndex: number | null;
      turnInstructions: TurnInstruction[] | null;
      nogoRoutes: Nogo[];
      lineToCursor: [L.LatLng, L.LatLng] | null;
      // functions
      setMap: (map: L.Map) => void;
      setZoomLevel: (zoomLevel: number | null) => void;
      setCurrentLocation: (location: Location | null) => void;
      setFollowUser: (val: boolean) => void;
      addWaypoint: (latlng: L.LatLng, label?: string) => void;
      updateWaypoint: (index: number, latlng: L.LatLng, label?: string) => void;
      reorderWaypoint: (sourceIndex: number, destIndex: number) => void;
      removeWaypoint: (index: number) => void;
      clearWaypoints: () => void;
      selectRouteAlternative: (index: number) => void;
      deleteNogo: (nogoId: ID) => void;
      clearNogoWaypoints: () => void;
      refreshWaypointLineToCursor: (mousePosition: L.LatLng | null) => void;
      downloadGPX: () => void;
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
    selectedRegions,
    routeOptions,
    showAlternateRoutes,
    isNavbarOpen,
    clearSelectedNogoGroups,
    setEditingGroupOrRegion,
    setShowAlternateRoutes,
    setIsLoading,
  } = useGlobalContext();

  const [zoomLevel, setZoomLevel] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [followUser, setFollowUser] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [nogoWaypoints, setNogoWaypoints] = useState<L.LatLng[]>([]);
  const [askForStartingLocation, setAskForStartingLocation] = useState(false);
  const [routes, setRoutes] = useState<RouteData[] | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(
    null
  );
  const [turnInstructions, setTurnInstructions] = useState<
    TurnInstruction[] | null
  >(null);
  const [lineToCursor, setLineToCursor] = useState<[L.LatLng, L.LatLng] | null>(
    null
  );
  const [nogoRoutes, setNogoRoutes] = useState<Nogo[]>([]);
  const [fetchingCount, setFetchingCount] = useState(0);

  useEffect(() => {
    setIsLoading(fetchingCount > 0);
  }, [fetchingCount]);

  const addWaypoint = useCallback(
    (latlng: L.LatLng, label?: string) => {
      const newWaypoint: Waypoint = {
        latlng,
        label:
          label ??
          GeocodingApi.reverse(latlng).then((res) => res?.label ?? null),
      };
      if (!editingGroupOrRegion) {
        const newWaypoints: Waypoint[] = [];
        if (label && waypoints.length === 0 && !askForStartingLocation) {
          setAskForStartingLocation(true);
        } else setAskForStartingLocation(false);
        newWaypoints.push(newWaypoint);

        setWaypoints(
          askForStartingLocation && label
            ? [newWaypoint, ...waypoints]
            : [...waypoints, ...newWaypoints]
        );
        if (label) {
          const bounds = new L.LatLngBounds(latlng, latlng);
          [...waypoints, ...newWaypoints].forEach((waypoint) => {
            bounds.extend(waypoint.latlng);
          });
        }
      } else {
        setNogoWaypoints([...nogoWaypoints, latlng]);
      }
    },
    [editingGroupOrRegion, askForStartingLocation, waypoints, nogoWaypoints]
  );

  const updateWaypoint = useCallback(
    (index: number, latlng: L.LatLng, label?: string) => {
      const updatedWaypoint: Waypoint = {
        latlng,
        label:
          label ??
          GeocodingApi.reverse(latlng).then((res) => res?.label ?? null),
      };
      const newWaypoints = [...waypoints];
      newWaypoints.splice(index, 1, updatedWaypoint);
      setWaypoints(newWaypoints);
    },
    [waypoints]
  );

  const reorderWaypoint = useCallback(
    (srcIndex: number, destIndex: number) => {
      if (srcIndex === destIndex) return;
      const newWaypoints = [...waypoints];
      const [reorderedWaypoint] = newWaypoints.splice(srcIndex, 1);
      newWaypoints.splice(destIndex, 0, reorderedWaypoint);
      setWaypoints(newWaypoints);
    },
    [waypoints]
  );

  const removeWaypoint = useCallback(
    (index: number) => {
      const newWaypoints = [...waypoints];
      newWaypoints.splice(index, 1);
      setWaypoints(newWaypoints);
      if (waypoints.length > 1 && index === 0) setAskForStartingLocation(true);
      if (waypoints.length === 1) setAskForStartingLocation(false);
    },
    [waypoints]
  );

  const clearWaypoints = useCallback(() => {
    setWaypoints([]);
    setRoutes(null);
    setSelectedRouteIndex(null);
    setAskForStartingLocation(false);
  }, []);

  const clearNogoWaypoints = useCallback(() => {
    setNogoWaypoints([]);
  }, []);

  const refreshWaypointLineToCursor = useCallback(
    (mousePosition: L.LatLng | null) => {
      if (
        !isTouchDevice() &&
        mousePosition &&
        editingGroupOrRegion &&
        nogoWaypoints.length === 1
      ) {
        setLineToCursor([nogoWaypoints[0], mousePosition]);
      } else {
        setLineToCursor(null);
      }
    },
    [editingGroupOrRegion, nogoWaypoints]
  );

  const fetchRoute = () => {
    if (!editingGroupOrRegion && waypoints.length >= 2) {
      setFetchingCount((prev) => prev + 1);
      RouterApi.generateRoute(
        waypoints.map((waypoint) => waypoint.latlng),
        selectedNogoGroups,
        selectedRegions,
        { ...routeOptions, showAlternateRoutes },
        loggedInUser
      )
        .then((fetchedRoutes) => {
          setRoutes(fetchedRoutes);
          setSelectedRouteIndex(fetchedRoutes.length > 1 ? null : 0);
          setFetchingCount((prev) => prev - 1);
          const bounds = fetchedRoutes.map((fetchedRoute) =>
            fetchedRoute.lineString.coordinates.map((coord) =>
              L.latLng(coord[1], coord[0])
            )
          );
          map?.fitBounds(L.latLngBounds(bounds.flat()), {
            paddingTopLeft: isNavbarOpen ? [0, 340] : [0, 0],
            paddingBottomRight: [50, 100],
          });
        })
        .catch((err) => {
          setFetchingCount((prev) => prev - 1);
          setRoutes(null);
          setSelectedRouteIndex(null);
          showNotification({
            title: 'Error fetching route',
            message: err.message || 'Undefined error',
            color: 'red',
          });
        });
    } else {
      setRoutes(null);
      setSelectedRouteIndex(null);
    }
  };

  const downloadGPX = () => {
    RouterApi.downloadGPX(
      waypoints.map((waypoint) => waypoint.latlng),
      selectedNogoGroups,
      selectedRegions,
      { ...routeOptions, showAlternateRoutes: false },
      loggedInUser,
      selectedRouteIndex ?? 0
    ).catch((err) => {
      showNotification({
        title: 'Error fetching route',
        message: err.message || 'Undefined error',
        color: 'red',
      });
    });
  };

  const calculateTurnInstructions = async () => {
    if (
      FeatureFlags.TurnInstructions.isEnabledForUser(loggedInUser?._id) &&
      !editingGroupOrRegion &&
      routes &&
      (selectedRouteIndex || selectedRouteIndex === 0)
    ) {
      const route = routes[selectedRouteIndex];
      const voiceHints = route.properties.voicehints;
      const newTurnInstructions = voiceHints.map((voiceHint) => {
        return new TurnInstruction(voiceHint, route.lineString);
      });
      setTurnInstructions(newTurnInstructions);
    } else setTurnInstructions(null);
  };

  const refreshNogoRoutes = useCallback(() => {
    if (editingGroupOrRegion) {
      NogoApi.getAllByGroup(
        editingGroupOrRegion._id,
        editingGroupOrRegion.isRegion
      )
        .then(setNogoRoutes)
        .catch((error) =>
          showNotification({
            title: `Error fetching nogos for ${editingGroupOrRegion.name}`,
            message: error.message || 'Undefined error',
            color: 'red',
          })
        );
    } else {
      Promise.all([
        ...selectedNogoGroups.map((groupId) =>
          NogoApi.getAllByGroup(groupId, false)
        ),
        ...selectedRegions.map((regionId) =>
          NogoApi.getAllByGroup(regionId, true)
        ),
      ])
        .then((val) => setNogoRoutes(val.flat()))
        .catch((error) =>
          showNotification({
            title: 'Error fetching private nogos',
            message: error.message || 'Undefined error',
            color: 'red',
          })
        );
    }
  }, [editingGroupOrRegion, selectedNogoGroups, selectedRegions]);

  const selectRouteAlternative = useCallback((index: number) => {
    setSelectedRouteIndex(index);
    setShowAlternateRoutes(false);
  }, []);

  const createNogo = () => {
    if (editingGroupOrRegion && nogoWaypoints.length >= 2) {
      NogoApi.create(
        nogoWaypoints,
        editingGroupOrRegion.isRegion ? undefined : editingGroupOrRegion._id,
        editingGroupOrRegion.isRegion ? editingGroupOrRegion._id : undefined
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
  };

  const deleteNogo = useCallback(
    (nogoId: ID) => {
      NogoApi.delete(nogoId)
        .then(() => refreshNogoRoutes())
        .catch((error) =>
          showNotification({
            title: 'Error deleting nogo',
            message: error.message || 'Undefined error',
            color: 'red',
          })
        );
    },
    [refreshNogoRoutes]
  );

  useEffect(() => {
    fetchRoute();
  }, [
    waypoints,
    editingGroupOrRegion,
    selectedNogoGroups,
    selectedRegions,
    routeOptions,
  ]);

  useEffect(() => {
    calculateTurnInstructions();
  }, [routes, selectedRouteIndex, editingGroupOrRegion]);

  useEffect(() => {
    if (showAlternateRoutes) {
      if (routes && routes?.length > 1) setSelectedRouteIndex(null);
      else fetchRoute();
    } else {
      if (!selectedRouteIndex && selectedRouteIndex !== 0) fetchRoute();
    }
  }, [showAlternateRoutes]);

  useEffect(() => {
    createNogo();
  }, [editingGroupOrRegion, nogoWaypoints]);

  useEffect(() => {
    refreshNogoRoutes();
  }, [selectedNogoGroups, selectedRegions]);

  useEffect(() => {
    refreshNogoRoutes();
    if (!editingGroupOrRegion) clearNogoWaypoints();
    if (routes) setRoutes(null);
  }, [editingGroupOrRegion]);

  useEffect(() => {
    if (!loggedInUser) {
      clearNogoWaypoints();
      clearWaypoints();
      clearSelectedNogoGroups();
      setEditingGroupOrRegion(null);
    }
  }, [loggedInUser]);

  return (
    <MapContext.Provider
      value={{
        map,
        zoomLevel,
        currentLocation,
        followUser,
        waypoints,
        nogoWaypoints,
        routes,
        askForStartingLocation,
        selectedRouteIndex,
        turnInstructions,
        nogoRoutes,
        lineToCursor,
        setMap,
        setZoomLevel,
        setCurrentLocation,
        setFollowUser,
        addWaypoint,
        updateWaypoint,
        reorderWaypoint,
        removeWaypoint,
        clearWaypoints,
        selectRouteAlternative,
        deleteNogo,
        clearNogoWaypoints,
        refreshWaypointLineToCursor,
        downloadGPX,
      }}
    >
      {props.children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be inside a MapContextProvider');
  }
  return context;
};
