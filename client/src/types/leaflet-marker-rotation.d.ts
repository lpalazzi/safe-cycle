import L from 'leaflet';

declare module 'leaflet' {
  export class RotatedMarker extends Marker {
    constructor(
      latlng: L.LatLngExpression,
      options: L.RotatedMarkerOptions | L.MarkerOptions
    );
    /*
     * Sets the rotation angle value.
     */
    setRotationAngle(newAngle: number): void;

    /*
     * Sets the rotation origin value.
     */
    setRotationOrigin(newOrigin: string): void;
  }

  interface RotatedMarkerOptions extends L.MarkerOptions {
    /*
     * Rotation angle, in degrees, clockwise. Defaults to 0.
     */
    rotationAngle?: number;
    /*
     * Rotation angle, in degrees, clockwise. Defaults to 'bottom center'
     */
    rotationOrigin?: string;
  }
}
