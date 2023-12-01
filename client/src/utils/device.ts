import { Capacitor } from '@capacitor/core';

export const isTouchDevice = () =>
  Capacitor.isNativePlatform() ||
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  (navigator as any).msMaxTouchPoints > 0;
