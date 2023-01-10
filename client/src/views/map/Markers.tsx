import React from 'react';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { useMapContext } from '../../contexts/mapContext';

export const Markers: React.FC = () => {
  const { markers, currentLocation } = useMapContext();
  L.AwesomeMarkers.Icon.prototype.options.prefix = 'fa';

  return (
    <>
      {markers.map((marker) => (
        <Marker position={marker}></Marker>
      ))}
      {currentLocation ? (
        <Marker
          position={currentLocation}
          icon={L.AwesomeMarkers.icon({
            icon: 'user-large',
            markerColor: 'orange',
            iconColor: 'black',
          })}
          eventHandlers={{
            click: (e) => {
              console.log(e.latlng);
            },
          }}
        />
      ) : null}
    </>
  );
};
