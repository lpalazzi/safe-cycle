import React, { createContext, useContext, useState, useEffect } from 'react';
import L from 'leaflet';
import midpoint from '@turf/midpoint';
import { showNotification } from '@mantine/notifications';
import { useGlobalContext } from './globalContext';
import { ID, Location, TurnInstruction, Waypoint } from 'types';
import { Nogo } from 'models';
import { GeocodingApi, NogoApi, RouterApi } from 'api';
import { RouteData } from 'api/interfaces/Router';
import { IReverseGeocodeResult } from 'api/interfaces/Geocoding';
import { distanceBetweenCoords } from 'utils/geojson';

type MapContextType =
  | {
      // states
      map: L.Map | null;
      currentLocation: Location | null;
      followUser: boolean;
      waypoints: Waypoint[];
      routes: RouteData[] | null;
      selectedRouteIndex: number | null;
      turnInstructions: TurnInstruction[] | null;
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
      fetchRoute: () => void;
      selectRouteAlternative: (index: number) => void;
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
    showAlternateRoutes,
    regions,
    clearSelectedNogoGroups,
    setEditingGroupOrRegion,
    setShowAlternateRoutes,
  } = useGlobalContext();

  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [followUser, setFollowUser] = useState(false);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [nogoWaypoints, setNogoWaypoints] = useState<L.LatLng[]>([]);
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
  const loadingRoute = fetchingCount > 0;

  const addWaypoint = (latlng: L.LatLng, label?: string) => {
    const newWaypoint: Waypoint = {
      latlng,
      label:
        label ?? GeocodingApi.reverse(latlng).then((res) => res?.label ?? null),
    };
    if (!editingGroupOrRegion) {
      setWaypoints([...waypoints, newWaypoint]);
      if (label) {
        const bounds = new L.LatLngBounds(latlng, latlng);
        waypoints.forEach((waypoint) => {
          bounds.extend(waypoint.latlng);
        });
        map?.fitBounds(bounds, { maxZoom: 17 });
      }
    } else {
      setNogoWaypoints([...nogoWaypoints, latlng]);
    }
  };

  const updateWaypoint = (index: number, latlng: L.LatLng, label?: string) => {
    const updatedWaypoint: Waypoint = {
      latlng,
      label:
        label ?? GeocodingApi.reverse(latlng).then((res) => res?.label ?? null),
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
    setRoutes(null);
    setSelectedRouteIndex(null);
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

  const fetchRoute = () => {
    if (!editingGroupOrRegion && waypoints.length >= 2) {
      const regionIds: ID[] = routeOptions.avoidNogos
        ? regions.map((region) => region._id)
        : [];
      setFetchingCount((prev) => prev + 1);
      RouterApi.generateRoute(
        waypoints.map((waypoint) => waypoint.latlng),
        selectedNogoGroups,
        regionIds,
        { ...routeOptions, showAlternateRoutes },
        loggedInUser
      )
        .then((fetchedRoutes) => {
          setRoutes(fetchedRoutes);
          setSelectedRouteIndex(fetchedRoutes.length > 1 ? null : 0);
          setFetchingCount((prev) => prev - 1);
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

  const calculateTurnInstructions = async () => {
    if (!routes || !selectedRouteIndex || editingGroupOrRegion)
      setTurnInstructions(null);
    if (routes && (selectedRouteIndex || selectedRouteIndex === 0)) {
      const route = routes[selectedRouteIndex];
      const voiceHints = route.properties.voicehints;
      const newTurnInstructions = voiceHints.map((voiceHint) => {
        const command = voiceHint[1];
        const position = route.lineString.coordinates[voiceHint[0]];
        const nextPosition = route.lineString.coordinates[voiceHint[0] + 1];
        const mid = midpoint(position, nextPosition).geometry.coordinates;
        const latLng = new L.LatLng(mid[1], mid[0]);
        const streetName = new Promise<string | null>(async (resolve) => {
          let tries = 0;
          let result: IReverseGeocodeResult | null = null;
          while (tries < 3 && !result) {
            tries++;
            try {
              result = await GeocodingApi.reverse(latLng, 16);
            } catch (error) {
              result = null;
            }
          }
          if (
            result &&
            distanceBetweenCoords(
              latLng.lng,
              latLng.lat,
              result.position.longitude,
              result.position.latitude
            ) < 5
          ) {
            resolve(result.address.road ?? null);
          } else {
            resolve(null);
          }
        });
        const distanceAfter = voiceHint[3];
        const roundaboutExit = voiceHint[2];
        const turnInstruction: TurnInstruction = {
          command,
          latLng,
          distanceAfter,
          roundaboutExit,
          streetName,
        };
        return turnInstruction;
      });
      setTurnInstructions(newTurnInstructions);
    }
  };

  const refreshNogoRoutes = () => {
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
      Promise.all(
        selectedNogoGroups.map((selectedNogoGroup) =>
          NogoApi.getAllByGroup(selectedNogoGroup, false)
        )
      )
        .then((val) => setNogoRoutes(val.flat()))
        .catch((error) =>
          showNotification({
            title: 'Error fetching private nogos',
            message: error.message || 'Undefined error',
            color: 'red',
          })
        );
    }
  };

  const selectRouteAlternative = (index: number) => {
    setSelectedRouteIndex(index);
    setShowAlternateRoutes(false);
  };

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

  const deleteNogo = (nogoId: ID) => {
    NogoApi.delete(nogoId)
      .then(() => refreshNogoRoutes())
      .catch((error) =>
        showNotification({
          title: 'Error deleting nogo',
          message: error.message || 'Undefined error',
          color: 'red',
        })
      );
  };

  useEffect(() => {
    fetchRoute();
  }, [waypoints, editingGroupOrRegion, selectedNogoGroups, routeOptions]);

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
  }, [selectedNogoGroups]);

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
        currentLocation,
        followUser,
        waypoints,
        routes,
        selectedRouteIndex,
        turnInstructions,
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
        fetchRoute,
        selectRouteAlternative,
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
