import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Shell } from 'components/shell/Shell';
import { GlobalContextProvider } from 'contexts/globalContext';
import { MapContextProvider } from 'contexts/mapContext';
import { Map } from 'views/map/Map';

function App() {
  return (
    <GlobalContextProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <NotificationsProvider position='top-right' zIndex={100000}>
          <ModalsProvider modalProps={{ zIndex: 10000 }}>
            <MapContextProvider>
              <DndProvider backend={HTML5Backend}>
                <Shell>
                  <Map />
                </Shell>
              </DndProvider>
            </MapContextProvider>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </GlobalContextProvider>
  );
}

export default App;
