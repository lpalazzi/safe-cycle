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
import { MapHandlers } from './MapHandlers';
import { Markers } from './Markers';
import { Route } from './Route';
import { Nogos } from './Nogos';
import { useGlobalContext } from 'contexts/globalContext';

export const Map: React.FC = () => {
  const { editingNogoGroup } = useGlobalContext();
  return (
    <MapContainer
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        cursor: 'crosshair',
      }}
      center={[42.2686, -83.1194]}
      zoom={11}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
        minZoom={0}
        maxZoom={20}
      />
      <ScaleControl />
      <ZoomControl position='bottomright' />
      <MapHandlers />
      {!editingNogoGroup ? (
        <>
          <Markers />
          <Route />
        </>
      ) : null}
      <Nogos />
    </MapContainer>
  );
};
