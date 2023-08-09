import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-marker-rotation';
import { useMapEvents } from 'react-leaflet';
import { useMapContext } from 'contexts/mapContext';
import { Anchor } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useGlobalContext } from 'contexts/globalContext';

export const MapHandlers: React.FC = () => {
  const {
    currentLocation,
    followUser,
    refreshWaypointLineToCursor,
    setCurrentLocation,
    setFollowUser,
    addWaypoint,
    clearWaypoints,
    clearNogoWaypoints,
  } = useMapContext();
  const { editingGroupOrRegion, isNavModeOn, isLoading } = useGlobalContext();
  const [navMarker, setNavMarker] = useState<L.RotatedMarker | null>(null);

  const map = useMapEvents({
    click: (e) => {
      if (!isLoading)
        addWaypoint(e.latlng.wrap(), editingGroupOrRegion ? 'nogo' : undefined);
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
    dragstart: (e) => {
      setFollowUser(false);
    },
    zoomanim: (e) => {
      setFollowUser(false);
    },
    locationfound: (e) => {
      const { latlng, heading } = e;
      setCurrentLocation({ latlng, heading });
      if (followUser) map.flyTo(latlng, isNavModeOn ? 19 : 14);
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
    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
      switch (status.state) {
        case 'granted':
          map.locate({ setView: true, maxZoom: 10 });
          break;
        case 'denied':
          showNotification({
            title: 'Cannot access location',
            message: (
              <>
                SafeCycle does not have permission to use your location. Please{' '}
                <Anchor
                  href='https://www.lifewire.com/denying-access-to-your-location-4027789'
                  target='_blank'
                >
                  enable location permissions
                </Anchor>{' '}
                to use all of SafeCycle's features.
              </>
            ),
            autoClose: false,
          });
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    if (currentLocation && isNavModeOn && navMarker) {
      navMarker.setLatLng(currentLocation.latlng);
      if (currentLocation.heading) {
        navMarker.setRotationAngle(currentLocation.heading);
      }
    }
  }, [currentLocation]);

  useEffect(() => {
    if (followUser && isNavModeOn && currentLocation?.latlng) {
      map.flyTo(currentLocation.latlng, 19);
    }
  }, [followUser]);

  useEffect(() => {
    if (isNavModeOn) {
      map.locate({ watch: true, enableHighAccuracy: true });
      setFollowUser(true);
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
    } else if (navMarker) {
      map.removeLayer(navMarker);
      // map.stopLocate();
      map.setZoom(14);
      setFollowUser(false);
    }
  }, [isNavModeOn]);

  const buildEasyButtons = () => {
    L.easyButton(
      'fa-location-crosshairs',
      () => {
        map.once('locationfound', (e) => {
          const { latlng } = e;
          map.flyTo(latlng, isNavModeOn ? 19 : 14);
        });
        map.locate({ watch: true, enableHighAccuracy: true });
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
