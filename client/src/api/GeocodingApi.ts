import L from 'leaflet';
import { GeocodeSearchResult } from 'types';
import { IGeocodeSearchResult } from './interfaces/Geocoding';
import { makeRequest } from './reqHelpers';

export class GeocodingApi {
  private static baseUrl = '/geocoding';

  static async search(
    query: string,
    bounds: L.LatLngBounds,
    userLocation?: L.LatLng
  ) {
    const viewboxStr = [
      bounds.getSouthEast().lat,
      bounds.getSouthEast().lng,
      bounds.getNorthWest().lat,
      bounds.getNorthWest().lng,
    ].join();

    const userLocationStr = userLocation
      ? [userLocation.lat, userLocation.lng].join()
      : undefined;

    const response = await makeRequest(
      `${this.baseUrl}/search/${query}?viewbox=${viewboxStr}${
        userLocationStr ? '&userLocation=' + userLocationStr : ''
      }`
    );

    const searchResults: IGeocodeSearchResult[] = response.searchResults;
    return searchResults.map((searchResult) => {
      return {
        label: searchResult.label,
        latlng: searchResult.position
          ? new L.LatLng(
              searchResult.position.latitude,
              searchResult.position.longitude
            )
          : undefined,
      } as GeocodeSearchResult;
    });
  }

  static async geocode(query: string) {
    const response = await makeRequest(`${this.baseUrl}/geocode/${query}`);
    const position: { latitude: number; longitude: number } = response.position;
    return new L.LatLng(position.latitude, position.longitude);
  }

  static async reverse(latlng: L.LatLng) {
    try {
      const response = await makeRequest(
        `${this.baseUrl}/reverse/${latlng.lat}/${latlng.lng}`
      );
      return response.label as string;
    } catch (error: any) {
      if (error.message === 'Reverse geo search timed out') return null;
      throw error;
    }
  }
}
