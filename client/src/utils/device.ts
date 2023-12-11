import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

export const isTouchDevice = () =>
  Capacitor.isNativePlatform() ||
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  (navigator as any).msMaxTouchPoints > 0;

export const setAndroidStatusBar = async () => {
  if (
    Capacitor.getPlatform() === 'android' &&
    Capacitor.isPluginAvailable('StatusBar')
  ) {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
  }
};
