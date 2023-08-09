import React from 'react';
import {
  MapContainer,
  ScaleControl,
  TileLayer,
  ZoomControl,
} from 'react-leaflet';
import 'leaflet-easybutton';
import 'leaflet-easybutton/src/easy-button.css';
import 'leaflet.awesome-markers';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import './Map.css';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';
import { MapHandlers } from './MapHandlers';
import { Markers } from './Markers';
import { Route } from './Route';
import { Nogos } from './Nogos';
import { Region } from './Region';
import { EditingNogoIndicator } from './EditingNogoIndicator';
import { RecenterButton } from './RecenterButton';
import { RouteProperties } from './RouteProperties';

export const Map: React.FC = () => {
  const { editingGroupOrRegion, isNavModeOn } = useGlobalContext();
  const { followUser, routes, setMap } = useMapContext();
  return (
    <>
      <MapContainer
        ref={setMap}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 0,
          cursor: 'crosshair',
        }}
        center={[0, -80]}
        zoom={2}
        scrollWheelZoom={true}
        zoomControl={false}
        worldCopyJump={true}
      >
        <TileLayer
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          minZoom={0}
          maxZoom={19}
        />
        <ScaleControl />
        <ZoomControl position='bottomright' />
        <MapHandlers />
        {!editingGroupOrRegion ? (
          <>
            <Markers />
            <Route />
          </>
        ) : null}
        <Region />
        <Nogos />
      </MapContainer>
      {routes ? <RouteProperties /> : null}
      {editingGroupOrRegion ? <EditingNogoIndicator /> : null}
      {isNavModeOn && !followUser ? <RecenterButton /> : null}
    </>
  );
};
