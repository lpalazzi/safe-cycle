import { makeRequest } from './reqHelpers';

export class GeocodingApi {
  private static baseUrl = 'https://nominatim.openstreetmap.org';

  static async search(query: string) {
    const response = await makeRequest(
      `${this.baseUrl}/search?q=${query}&format=json`
    );
    console.log(response);

    return null;
  }
}
