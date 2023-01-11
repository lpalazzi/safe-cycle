import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

export const createMarker = (
  content: JSX.Element,
  color: 'blue' | 'orange' = 'blue'
) => {
  return L.divIcon({
    className: `number-icon marker-${color}`,
    shadowSize: [20, 30],
    iconSize: [43, 50],
    iconAnchor: [20, 48],
    shadowAnchor: [4, 30],
    popupAnchor: [0, -45],
    html: renderToStaticMarkup(content),
  });
};
