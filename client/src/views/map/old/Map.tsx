import React, { useEffect } from 'react';
import { initMap } from './initMap';

// This component instantiates a leaflet map without the react-leaflet library
// Not used, but saving in case needed in future

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
        cursor: 'crosshair',
      }}
    />
  );
};
