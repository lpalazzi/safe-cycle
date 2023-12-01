import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-marker-rotation';
import { useMapEvents } from 'react-leaflet';
import { useMapContext } from 'contexts/mapContext';
import { Anchor } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useGlobalContext } from 'contexts/globalContext';
import { Capacitor } from '@capacitor/core';

export const MapHandlers: React.FC = () => {
  const {
    currentLocation,
    followUser,
    refreshWaypointLineToCursor,
    setZoomLevel,
    setCurrentLocation,
    setFollowUser,
    addWaypoint,
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
    zoomend: (e) => {
      setZoomLevel(e.target._zoom);
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
    if (Capacitor.isNativePlatform()) {
      map.locate({ setView: true, maxZoom: 14 });
      // Geolocation.checkPermissions().then((status) => {
      //   console.log(status);
      //   if (status.location === 'denied') {
      //     showNotification({
      //       title: 'Cannot access location',
      //       message: (
      //         <>
      //           SafeCycle does not have permission to use your location. Please{' '}
      //           <Anchor
      //             href={
      //               Capacitor.getPlatform() === 'ios'
      //                 ? 'https://support.apple.com/en-ca/HT207092'
      //                 : 'https://support.google.com/accounts/answer/6179507'
      //             }
      //             target='_blank'
      //           >
      //             enable location permissions
      //           </Anchor>{' '}
      //           to use all of SafeCycle's features.
      //         </>
      //       ),
      //       autoClose: false,
      //     });
      //   } else if (status.location === 'granted') {
      //     map.locate({ setView: true, maxZoom: 10 });
      //   } else {
      //     Geolocation.requestPermissions({ permissions: ['location'] })
      //       .then((newStatus) => {
      //         if (newStatus.location === 'granted')
      //           map.locate({ setView: true, maxZoom: 10 });
      //       })
      //       .catch((reason) => {
      //         showNotification({
      //           title: 'System location services not enabled',
      //           message: reason,
      //         });
      //       });
      //   }
      // });
    } else {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        switch (status.state) {
          case 'granted':
            map.locate({ setView: true, maxZoom: 14 });
            break;
          case 'denied':
            showNotification({
              title: 'Cannot access location',
              message: (
                <>
                  SafeCycle does not have permission to use your location.
                  Please{' '}
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
    }
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

  return <></>;
};
