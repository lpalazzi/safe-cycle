import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import { Shell } from 'components/shell/Shell';
import { GlobalContextProvider } from 'contexts/globalContext';

function App() {
  return (
    <GlobalContextProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <NotificationsProvider>
          <ModalsProvider>
            <Shell>
              <div style={{ backgroundColor: '#EEEEEE', height: '100%' }}>
                map will go here
              </div>
            </Shell>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </GlobalContextProvider>
  );
}

export default App;
