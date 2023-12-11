import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Shell } from 'components/shell/Shell';
import { MapContextProvider } from 'contexts/mapContext';
import { GlobalContextProvider } from 'contexts/globalContext';
import { Map } from 'views/map/Map';
import { LoadingIndicator } from 'views/map/LoadingIndicator';
import { Capacitor } from '@capacitor/core';

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
        <Notifications position='top-right' />
        <MapContextProvider>
          <ModalsProvider
            modalProps={
              Capacitor.getPlatform() === 'ios'
                ? {
                    styles: {
                      inner: { marginTop: 'env(safe-area-inset-top)' },
                    },
                  }
                : undefined
            }
          >
            <LoadingIndicator />
            <Shell>
              <Map />
            </Shell>
          </ModalsProvider>
        </MapContextProvider>
      </MantineProvider>
    </GlobalContextProvider>
  );
}

export default App;
