import React, { createContext, useContext, useState, useEffect } from 'react';
import L from 'leaflet';
import { RouterApi } from 'api';
import { showNotification } from '@mantine/notifications';

type MapContextType =
  | {
      // states
      currentLocation: L.LatLng | null;
      waypoints: L.LatLng[];
      route: GeoJSON.FeatureCollection | null;
      // functions
      setCurrentLocation: (latlng: L.LatLng | null) => void;
      addWaypoint: (newMarker: L.LatLng) => void;
      updateWaypoint: (updatedWaypoint: L.LatLng, index: number) => void;
      removeWaypoint: (index: number) => void;
      clearWaypoints: () => void;
      setRoute: (lnstr: GeoJSON.FeatureCollection) => void;
    }
  | undefined;

const MapContext = createContext<MapContextType>(undefined);
MapContext.displayName = 'MapContext';

type MapContextProviderType = {
  children?: React.ReactNode;
};

export const MapContextProvider: React.FC<MapContextProviderType> = (props) => {
  const [currentLocation, setCurrentLocation] = useState<L.LatLng | null>(null);
  const [waypoints, setWaypoints] = useState<L.LatLng[]>([]);
  const [route, setRoute] = useState<GeoJSON.FeatureCollection | null>(null);

  const addWaypoint = (newMarker: L.LatLng) => {
    setWaypoints([...waypoints, newMarker]);
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

  useEffect(() => {
    if (waypoints.length >= 2) {
      RouterApi.generateRoute(waypoints, [], false)
        .then((res) => {
          setRoute(res.route);
        })
        .catch((err) => {
          showNotification({ message: err.message, color: 'red' });
        });
    } else {
      setRoute(null);
    }
  }, [waypoints]);

  return (
    <MapContext.Provider
      value={{
        currentLocation,
        waypoints,
        route,
        setCurrentLocation,
        addWaypoint,
        updateWaypoint,
        removeWaypoint,
        clearWaypoints,
        setRoute,
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
