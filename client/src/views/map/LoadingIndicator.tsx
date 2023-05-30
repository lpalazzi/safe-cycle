import React from 'react';
import { LoadingOverlay } from '@mantine/core';
import { useGlobalContext } from 'contexts/globalContext';

export const LoadingIndicator: React.FC = () => {
  const { isLoading } = useGlobalContext();
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        cursor: isLoading ? 'wait' : 'unset',
      }}
    >
      <LoadingOverlay
        visible={isLoading}
        overlayOpacity={0}
        radius='lg'
        transitionDuration={500}
        loaderProps={{ size: 'xl' }}
      />
    </div>
  );
};
