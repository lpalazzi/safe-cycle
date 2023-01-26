import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-marker-rotation';
import { useMapEvents } from 'react-leaflet';
import { useMapContext } from 'contexts/mapContext';
import { showNotification } from '@mantine/notifications';
import { useGlobalContext } from 'contexts/globalContext';

export const MapHandlers: React.FC = () => {
  const {
    currentLocation,
    refreshWaypointLineToCursor,
    setCurrentLocation,
    addWaypoint,
    clearWaypoints,
    clearNogoWaypoints,
  } = useMapContext();
  const { isNavModeOn } = useGlobalContext();
  const [navMarker, setNavMarker] = useState<L.RotatedMarker | null>(null);

  const map = useMapEvents({
    click: (e) => {
      addWaypoint(e.latlng);
    },
    mousemove: (e) => {
      refreshWaypointLineToCursor(e.latlng);
    },
    keyup: (e) => {
      if (e.originalEvent.key === 'Escape') {
        clearNogoWaypoints();
        refreshWaypointLineToCursor(null);
      }
    },
    locationfound: (e) => {
      const { latlng, heading } = e;
      map.flyTo(latlng, isNavModeOn ? 19 : 14);
      setCurrentLocation({ latlng, heading });
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

  useEffect(() => {
    if (currentLocation && isNavModeOn && navMarker) {
      navMarker.setLatLng(currentLocation.latlng);
      if (currentLocation.heading) {
        navMarker.setRotationAngle(currentLocation.heading);
      }
    }
  }, [currentLocation]);

  useEffect(() => {
    if (isNavModeOn) {
      map.locate({ watch: true, enableHighAccuracy: true });
      setNavMarker(
        new L.RotatedMarker(currentLocation?.latlng || [0, 0], {
          rotationAngle: currentLocation?.heading ?? 0,
          rotationOrigin: 'center center',
          icon: L.divIcon({
            className: `nav-icon marker-nav`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        }).addTo(map)
      );
    } else {
      navMarker && map.removeLayer(navMarker);
      map.stopLocate();
      map.setZoom(14);
    }
  }, [isNavModeOn]);

  const buildEasyButtons = () => {
    L.easyButton(
      'fa-location-crosshairs',
      () => {
        map.locate();
      },
      'Current location'
    )
      .addTo(map)
      .setPosition('bottomright');
    L.easyButton(
      'fa-eraser',
      () => {
        clearWaypoints();
      },
      'Clear all waypoints'
    )
      .addTo(map)
      .setPosition('bottomright');
  };

  useEffect(() => {
    buildEasyButtons();
  }, []);

  return <></>;
};
