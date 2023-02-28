import L from 'leaflet';
import { makeRequest } from './reqHelpers';
import { NominatimSearchResult } from './interfaces/Nominatim';
import {
  BingAutosuggestResult,
  BingLocationResult,
} from './interfaces/BingMaps';
import { GeocodeSearchResult } from 'types';

export class GeocodingApi {
  private static nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
  private static bingMapsBaseUrl = 'http://dev.virtualearth.net/REST/v1';
  private static bingMapsApiKey =
    'Aox0npMYoqh35LofTFVmTh-FMxb6FiHQcex_RhYWdQ2Gt-qx94pHNWMqpqvtchHl';

  static async geocode(query: string) {
    const result: BingLocationResult = await makeRequest(
      `${this.bingMapsBaseUrl}/Locations/${query}?maxResults=1&key=${this.bingMapsApiKey}`
    );

    const coordinates =
      result?.resourceSets?.[0]?.resources?.[0]?.point?.coordinates;
    if (result.statusCode !== 200 || !coordinates) {
      return null;
    }

    return new L.LatLng(coordinates[0], coordinates[1]);
  }

  static async reverse(latlng: L.LatLng) {
    const result: NominatimSearchResult = await makeRequest(
      `${this.nominatimBaseUrl}/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
    );
    return result;
  }

  static async search(
    query: string,
    viewbox: L.LatLngBounds,
    userLocation?: L.LatLng
  ) {
    // TODO: if no Bing Maps API key, call searchWithNominatim

    const userMapView = [
      viewbox.getSouthEast().lat,
      viewbox.getSouthEast().lng,
      viewbox.getNorthWest().lat,
      viewbox.getNorthWest().lng,
    ].join();
    const result: BingAutosuggestResult = await makeRequest(
      `${
        this.bingMapsBaseUrl
      }/Autosuggest?query=${query}&userMapView=${userMapView}&userLocation=${
        userLocation ? [userLocation.lat, userLocation.lng].join() : ''
      }&maxResults=10&key=${this.bingMapsApiKey}`
    );

    const places = result?.resourceSets?.[0]?.resources?.[0]?.value;
    if (result.statusCode !== 200 || !places || !places.length) {
      return this.searchWithNominatim(query, viewbox);
    }

    return places.map((place) => {
      return {
        label: [place.name, place.address.formattedAddress]
          .filter((r) => !!r)
          .join(', '),
      } as GeocodeSearchResult;
    });
  }

  static async searchWithNominatim(query: string, viewbox?: L.LatLngBounds) {
    let searchResults: NominatimSearchResult[] = [];

    const viewboxStr = viewbox?.toBBoxString();

    if (viewboxStr) {
      const boundedResults: NominatimSearchResult[] = await makeRequest(
        `${this.nominatimBaseUrl}/search?q=${query}&viewbox=${viewboxStr}&bounded=1&addressdetails=1&format=json`
      );
      searchResults.push(...boundedResults);
    }

    if (searchResults.length < 10) {
      const unboundedResults: NominatimSearchResult[] = await makeRequest(
        `${
          this.nominatimBaseUrl
        }/search?q=${query}&addressdetails=1&format=json${
          viewboxStr ? `&viewbox=${viewboxStr}` : ''
        }`
      );
      searchResults.push(
        ...unboundedResults.filter((unboundedResult) => {
          return !searchResults.find((searchResult) => {
            return searchResult.place_id === unboundedResult.place_id;
          });
        })
      );
    }

    return searchResults.map((searchResult) => {
      const res: GeocodeSearchResult = {
        label: searchResult.display_name,
        latlng: new L.LatLng(
          Number(searchResult.lat),
          Number(searchResult.lon)
        ),
      };
      return res;
    });
  }
}
