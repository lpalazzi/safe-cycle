import { makeRequest } from './reqHelpers';
import { GeocodeSearchResult } from './interfaces/Geocoding';
import { LatLngBounds } from 'leaflet';

export class GeocodingApi {
  private static baseUrl = 'https://nominatim.openstreetmap.org';

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
          return !!searchResults.find((searchResult) => {
            searchResult.place_id === unboundedResult.place_id;
          });
        })
      );
      searchResults.length = 10;
    }

    return searchResults;
  }
}
