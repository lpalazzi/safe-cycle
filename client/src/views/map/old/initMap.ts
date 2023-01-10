import L from 'leaflet';
import 'leaflet-easybutton';
import 'leaflet-easybutton/src/easy-button.css';
import { showNotification } from '@mantine/notifications';

export const initMap = () => {
  const cyclosm = L.tileLayer(
    'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      minZoom: 0,
      maxZoom: 20,
    }
  );

  const map = L.map('map', { zoomControl: false, layers: [cyclosm] }).setView(
    [42.2759, -83],
    12
  );

  map
    .locate({
      setView: true,
      maxZoom: 14,
    })
    .on('locationerror', (e) => {
      showNotification({
        message: e.message,
        color: 'red',
      });
    });

  L.control.scale().addTo(map);
  L.control
    .zoom({
      position: 'bottomright',
    })
    .addTo(map);
};
