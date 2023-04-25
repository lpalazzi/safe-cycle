import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { Shell } from 'components/shell/Shell';
import { GuidedTour } from 'components/tour/GuidedTour';
import { MapContextProvider } from 'contexts/mapContext';
import { GlobalContextProvider } from 'contexts/globalContext';
import { Map } from 'views/map/Map';
import { LoadingIndicator } from 'views/map/LoadingIndicator';

function App() {
  return (
    <GlobalContextProvider>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          fontFamily: 'Noto Sans, sans-serif',
          headings: { fontFamily: 'Noto Sans, sans-serif' },
          components: {
            Accordion: { styles: { control: { lineHeight: 1.55 } } },
          },
        }}
      >
        <GuidedTour />
        <NotificationsProvider position='top-right' zIndex={100000}>
          <ModalsProvider modalProps={{ zIndex: 10000 }}>
            <MapContextProvider>
              <LoadingIndicator />
              <Shell>
                <Map />
              </Shell>
            </MapContextProvider>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </GlobalContextProvider>
  );
}

export default App;
