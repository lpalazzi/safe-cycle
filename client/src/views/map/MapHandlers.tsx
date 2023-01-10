import React, { useEffect } from 'react';
import L from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import { useMapContext } from 'contexts/mapContext';
import { showNotification } from '@mantine/notifications';

export const MapHandlers: React.FC = () => {
  const { addMarker, setCurrentLocation } = useMapContext();
  const map = useMapEvents({
    click: (e) => {
      addMarker(e.latlng);
    },
    locationfound: (e) => {
      map.flyTo(e.latlng, 14);
      setCurrentLocation(e.latlng);
    },
    locationerror: (e) => {
      setCurrentLocation(null);
      showNotification({
        message: e.message,
        color: 'red',
      });
    },
  });

  const buildEasyButtons = () => {
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
