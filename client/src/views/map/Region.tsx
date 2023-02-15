import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { useGlobalContext } from 'contexts/globalContext';
import { Region as RegionModel } from 'models';

export const Region: React.FC = () => {
  const { editingGroupOrRegion } = useGlobalContext();

  return editingGroupOrRegion?.isRegion ? (
    <GeoJSON
      key={editingGroupOrRegion._id}
      data={(editingGroupOrRegion as RegionModel).polygon}
      interactive={false}
      style={{
        color: 'grey',
        weight: 4,
        opacity: 1.0,
        fillOpacity: 0.1,
      }}
    />
  ) : null;
};
