import axios, { AxiosError } from 'axios';
import { injectable } from 'tsyringe';
import config from 'config';
import { Position, Viewbox } from 'types';
import { IGeocodeSearchResult } from 'interfaces';
import { fixOutOfBoundsLat, fixOutOfBoundsLon } from 'utils/geo';

@injectable()
export class BingMapsService {
  constructor() {}
  private bingMapsBaseUrl = 'http://dev.virtualearth.net/REST/v1';

  public async geocode(query: string) {
    if (!config.bingMapsApiKey) return null;

    const { data } = await axios.get<BingLocationResult>(
      `${this.bingMapsBaseUrl}/Locations?query=${encodeURIComponent(
        query
      )}&maxResults=1&key=${config.bingMapsApiKey}`
    );

    const coordinates =
      data?.resourceSets?.[0]?.resources?.[0]?.point?.coordinates;

    if (data.statusCode !== 200 || !coordinates || coordinates.length < 2) {
      return null;
    }
    return {
      latitude: coordinates[0],
      longitude: coordinates[1],
    } as Position;
  }

  public async autosuggest(
    query: string,
    viewbox: Viewbox,
    userLocation?: Position
  ) {
    if (!config.bingMapsApiKey) return null;

    const userMapViewStr = [
      fixOutOfBoundsLat(viewbox.southeast.latitude),
      fixOutOfBoundsLon(viewbox.southeast.longitude),
      fixOutOfBoundsLat(viewbox.northwest.latitude),
      fixOutOfBoundsLon(viewbox.northwest.longitude),
    ].join();

    const userLocationStr = userLocation
      ? [userLocation.latitude, userLocation.longitude].join()
      : '';

    const { data } = await axios
      .get<BingAutosuggestResult>(
        `${this.bingMapsBaseUrl}/Autosuggest?query=${encodeURIComponent(
          query
        )}&userMapView=${userMapViewStr}&userLocation=${userLocationStr}&maxResults=10&key=${
          config.bingMapsApiKey
        }`
      )
      .catch((e: AxiosError) => {
        console.error(e.response?.data);
        throw Error(
          `Autosuggest request failed with status code ${e.response?.status}: ${e.response?.statusText}`
        );
      });

    const places = data?.resourceSets?.[0]?.resources?.[0]?.value;

    if (data.statusCode !== 200 || !places || !places.length) {
      return null;
    }
    return places.map((place) => {
      return {
        label: [place.name, place.address.formattedAddress]
          .filter((r) => !!r)
          .join(', '),
      } as IGeocodeSearchResult;
    });
  }
}

interface BingAutosuggestResult {
  authenticationResultCode: string;
  brandLogoUri: string;
  copyright: string;
  resourceSets: [
    {
      estimatedTotal: number;
      resources: [
        {
          __type: string;
          value: {
            __type: 'Address' | 'Place' | 'LocalBusiness';
            name?: string;
            address: BingMapsAddress;
          }[];
        }
      ];
    }
  ];
  statusCode: number;
  statusDescription: string;
  traceId: string;
}

interface BingLocationResult {
  authenticationResultCode: string;
  brandLogoUri: string;
  copyright: string;
  resourceSets: [
    {
      estimatedTotal: number;
      resources: {
        __type: string;
        bbox: [number, number, number, number];
        name: string;
        point: {
          type: 'Point';
          coordinates: [lat: number, lon: number]; // lat,lon
        };
        address: BingMapsAddress;
        confidence: 'High' | 'Medium' | 'Low';
        entityType: string;
      }[];
    }
  ];
  statusCode: number;
  statusDescription: string;
  traceId: string;
}

interface BingMapsAddress {
  countryRegion: string;
  locality: string;
  adminDistrict: string;
  adminDistrict2?: string;
  countryRegionIso2: string;
  postalCode?: string;
  addressLine?: string;
  houseNumber?: string;
  streetName?: string;
  formattedAddress: string;
  landmark?: string;
}
