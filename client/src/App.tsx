import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { Shell } from 'components/shell/Shell';
import { GlobalContextProvider } from 'contexts/globalContext';
import { MapContextProvider } from 'contexts/mapContext';
import { Map } from 'views/map/Map';

function App() {
  return (
    <GlobalContextProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <NotificationsProvider position='top-right'>
          <ModalsProvider>
            <Shell>
              <MapContextProvider>
                <Map />
              </MapContextProvider>
            </Shell>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </GlobalContextProvider>
  );
}

export default App;
