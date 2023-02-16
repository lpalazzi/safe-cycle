import { makeRequest } from './reqHelpers';
import { GeocodeSearchResult } from './interfaces/Geocoding';
import { LatLng, LatLngBounds } from 'leaflet';

export class GeocodingApi {
  private static baseUrl = 'https://nominatim.openstreetmap.org';

  static async reverse(latlng: LatLng) {
    const result: GeocodeSearchResult = await makeRequest(
      `${this.baseUrl}/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
    );
    return result;
  }

  static async search(query: string, viewbox?: LatLngBounds) {
    let searchResults: GeocodeSearchResult[] = [];

    const viewboxStr = viewbox?.toBBoxString();

    if (viewboxStr) {
      const boundedResults: GeocodeSearchResult[] = await makeRequest(
        `${this.baseUrl}/search?q=${query}&viewbox=${viewboxStr}&bounded=1&addressdetails=1&format=json`
      );
      searchResults.push(...boundedResults);
    }

    if (searchResults.length < 10) {
      const unboundedResults: GeocodeSearchResult[] = await makeRequest(
        `${this.baseUrl}/search?q=${query}&addressdetails=1&format=json${
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
      // searchResults.length = 10;
    }

    return searchResults;
  }
}
