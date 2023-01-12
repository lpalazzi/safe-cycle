import React, { useEffect } from 'react';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import { useMapContext } from 'contexts/mapContext';
import { showNotification } from '@mantine/notifications';

export const MapHandlers: React.FC = () => {
  const {
    refreshWaypointLineToCursor,
    setCurrentLocation,
    addWaypoint,
    clearWaypoints,
  } = useMapContext();

  const map = useMapEvents({
    click: (e) => {
      addWaypoint(e.latlng);
    },
    mousemove: (e) => {
      refreshWaypointLineToCursor(e.latlng);
    },
    locationfound: (e) => {
      map.flyTo(e.latlng, 14);
      setCurrentLocation(e.latlng);
    },
    locationerror: (e) => {
      setCurrentLocation(null);
      showNotification({
        title: 'Error getting location',
        message: e.message || 'Undefined error',
        color: 'red',
      });
    },
  });

  const buildEasyButtons = () => {
    L.easyButton(
      'fa-eraser',
      () => {
        clearWaypoints();
      },
      'Clear all waypoints'
    )
      .addTo(map)
      .setPosition('topright');

    L.easyButton('fa-location-crosshairs', () => {
      map.locate();
    })
      .addTo(map)
      .setPosition('bottomright');
  };

  useEffect(() => {
    map.locate();
    buildEasyButtons();
  }, []);

  return <></>;
};
