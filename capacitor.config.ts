import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'xyz.safecycle.app',
  appName: 'SafeCycle',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
