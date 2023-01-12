import React, { createContext, useContext, useState, useEffect } from 'react';
import L from 'leaflet';
import { NogoApi, RouterApi } from 'api';
import { showNotification } from '@mantine/notifications';
import { useGlobalContext } from './globalContext';
import { Nogo } from 'models';
import { ID } from 'types';

type MapContextType =
  | {
      // states
      currentLocation: L.LatLng | null;
      waypoints: L.LatLng[];
      route: GeoJSON.LineString | null;
      nogoRoutes: Nogo[];
      lineToCursor: [L.LatLng, L.LatLng] | null;
      // functions
      setCurrentLocation: (latlng: L.LatLng | null) => void;
      addWaypoint: (newMarker: L.LatLng) => void;
      updateWaypoint: (updatedWaypoint: L.LatLng, index: number) => void;
      removeWaypoint: (index: number) => void;
      clearWaypoints: () => void;
      setRoute: (lnstr: GeoJSON.LineString) => void;
      deleteNogo: (nogoId: ID) => void;
      refreshWaypointLineToCursor: (mousePosition: L.LatLng) => void;
    }
  | undefined;

const MapContext = createContext<MapContextType>(undefined);
MapContext.displayName = 'MapContext';

type MapContextProviderType = {
  children?: React.ReactNode;
};

export const MapContextProvider: React.FC<MapContextProviderType> = (props) => {
  const { editingNogoList, selectedNogoLists } = useGlobalContext();
  const [currentLocation, setCurrentLocation] = useState<L.LatLng | null>(null);
  const [waypoints, setWaypoints] = useState<L.LatLng[]>([]);
  const [nogoWaypoints, setNogoWaypoints] = useState<L.LatLng[]>([]);
  const [route, setRoute] = useState<GeoJSON.LineString | null>(null);
  const [lineToCursor, setLineToCursor] = useState<[L.LatLng, L.LatLng] | null>(
    null
  );
  const [nogoRoutes, setNogoRoutes] = useState<Nogo[]>([]);

  const addWaypoint = (newWaypoint: L.LatLng) => {
    if (!editingNogoList) {
      setWaypoints([...waypoints, newWaypoint]);
    } else {
      setNogoWaypoints([...nogoWaypoints, newWaypoint]);
    }
  };

  const updateWaypoint = (updatedWaypoint: L.LatLng, index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1, updatedWaypoint);
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

  const refreshWaypointLineToCursor = (mousePosition: L.LatLng) => {
    if (editingNogoList && nogoWaypoints.length === 1) {
      setLineToCursor([nogoWaypoints[0], mousePosition]);
    } else {
      setLineToCursor(null);
    }
  };

  useEffect(() => {
    if (waypoints.length >= 2) {
      RouterApi.generateRoute(waypoints, selectedNogoLists, false)
        .then((res) => {
          setRoute(res.route);
        })
        .catch((err) => {
          showNotification({
            title: 'Error fetching route',
            message: err.message || 'Undefined error',
            color: 'red',
          });
        });
    } else {
      setRoute(null);
    }
  }, [waypoints, selectedNogoLists]);

  useEffect(() => {
    if (nogoWaypoints.length >= 2 && editingNogoList) {
      NogoApi.create(nogoWaypoints, editingNogoList)
        .then(() => {
          refreshNogoRoutes();
          setNogoWaypoints([]);
        })
        .catch((err) => {
          showNotification({
            title: 'Error creating NOGO',
            message: err.message || 'Undefined error',
            color: 'red',
          });
        });
    }
  }, [nogoWaypoints]);

  const refreshNogoRoutes = async () => {
    try {
      if (editingNogoList) {
        NogoApi.getAllByList(editingNogoList).then(setNogoRoutes);
      } else {
        const fetchedNogos: Nogo[] = (
          await Promise.all(
            selectedNogoLists.map(async (selectedNogoList) => {
              return NogoApi.getAllByList(selectedNogoList);
            })
          )
        ).flat();
        setNogoRoutes(fetchedNogos);
      }
    } catch (error: any) {
      showNotification({
        title: 'Error fetching NOGOs',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    refreshNogoRoutes();
  }, [editingNogoList, selectedNogoLists]);

  const deleteNogo = async (nogoId: ID) => {
    try {
      const deletedCount = await NogoApi.delete(nogoId);
      showNotification({
        message:
          deletedCount > 0 ? '1 NOGO was deleted' : 'NOGO was not deleted',
        color: deletedCount > 0 ? 'green' : 'red',
      });
      refreshNogoRoutes();
    } catch (error: any) {
      showNotification({
        title: 'Error deleting NOGO',
        message: error.message || 'Undefined error',
        color: 'red',
      });
    }
  };

  return (
    <MapContext.Provider
      value={{
        currentLocation,
        waypoints,
        route,
        nogoRoutes,
        lineToCursor,
        setCurrentLocation,
        addWaypoint,
        updateWaypoint,
        removeWaypoint,
        clearWaypoints,
        setRoute,
        deleteNogo,
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
