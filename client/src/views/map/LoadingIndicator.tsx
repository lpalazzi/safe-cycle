import React from 'react';
import { useMapContext } from 'contexts/mapContext';
import { LoadingOverlay } from '@mantine/core';

export const LoadingIndicator: React.FC = () => {
  const { loadingRoute } = useMapContext();
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: loadingRoute ? 'wait' : 'unset',
      }}
    >
      <LoadingOverlay
        visible={loadingRoute}
        overlayOpacity={0}
        radius='lg'
        transitionDuration={500}
        loaderProps={{ size: 'xl' }}
      />
    </div>
  );
};
