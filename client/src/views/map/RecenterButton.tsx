import React from 'react';
import { Button } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';
import { useMapContext } from 'contexts/mapContext';

export const RecenterButton: React.FC = () => {
  const { isMobileSize } = useGlobalContext();
  const { setFollowUser } = useMapContext();
  return (
    <Button
      style={{
        position: 'fixed',
        top: 25,
        right: isMobileSize ? '50%' : 10,
        transform: isMobileSize ? 'translate(50%, 0)' : 'none',
        zIndex: 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        setFollowUser(true);
      }}
    >
      Recenter
    </Button>
  );
};
