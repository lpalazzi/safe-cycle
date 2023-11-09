import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

export const createMarker = (content: JSX.Element) => {
  return L.divIcon({
    className: `number-icon marker-blue`,
    iconSize: [35, 48],
    iconAnchor: [17, 48],
    popupAnchor: [0, -54],
    html: renderToStaticMarkup(content),
  });
};
