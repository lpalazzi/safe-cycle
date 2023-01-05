import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { initMap } from './initMap';

export const Map: React.FC = () => {
  useEffect(initMap, []);
  return (
    <div
      id='map'
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      }}
    />
  );
};
