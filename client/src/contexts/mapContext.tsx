import React, { createContext, useContext, useState, useEffect } from 'react';
import L from 'leaflet';

type MapContextType =
  | {
      // states
      markers: L.LatLng[];
      currentLocation: L.LatLng | null;
      // functions
      addMarker: (newMarker: L.LatLng) => void;
      setCurrentLocation: (latlng: L.LatLng | null) => void;
    }
  | undefined;

const MapContext = createContext<MapContextType>(undefined);
MapContext.displayName = 'MapContext';

type MapContextProviderType = {
  children?: React.ReactNode;
};

export const MapContextProvider: React.FC<MapContextProviderType> = (props) => {
  const [markers, setMarkers] = useState<L.LatLng[]>([]);
  const [currentLocation, setCurrentLocation] = useState<L.LatLng | null>(null);

  const addMarker = (newMarker: L.LatLng) => {
    setMarkers([...markers, newMarker]);
  };

  return (
    <MapContext.Provider
      value={{ markers, currentLocation, addMarker, setCurrentLocation }}
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
