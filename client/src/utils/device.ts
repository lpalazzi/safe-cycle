import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isTouchDevice = () =>
  Capacitor.isNativePlatform() ||
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  (navigator as any).msMaxTouchPoints > 0;

export const setAndroidStatusBar = () => {
  if (
    Capacitor.getPlatform() === 'android' &&
    Capacitor.isPluginAvailable('StatusBar')
  ) {
    StatusBar.setOverlaysWebView({ overlay: false });
    StatusBar.setBackgroundColor({ color: '#ffffff' });
    StatusBar.setStyle({ style: Style.Light });
  }
};
