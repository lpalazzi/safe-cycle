import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useMapContext } from '../../contexts/mapContext';

export const Route: React.FC = () => {
  const { route } = useMapContext();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(key + 1);
  }, [route]);

  return route ? (
    <GeoJSON
      key={key}
      data={route}
      style={{
        color: '#002d75',
        weight: 5,
        opacity: 1.0,
      }}
    />
  ) : null;
};
