import axios, { AxiosError } from 'axios';
import { injectable } from 'tsyringe';
import config from 'config';
import { Position, Viewbox } from 'types';
import { IGeocodeSearchResult, IReverseGeocodeResult } from 'interfaces';
import { fixOutOfBoundsLat, fixOutOfBoundsLon } from 'utils/geo';
import { asyncCallWithTimeout } from 'utils/async';

@injectable()
export class BingMapsService {
  constructor() {}
  private bingMapsBaseUrl = 'http://dev.virtualearth.net/REST/v1';

  public async geocode(query: string) {
    if (!config.bingMapsApiKey) return null;

    const { data } = await axios.get<BingResponse<BingLocationsResource>>(
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

  public async reverse(position: Position) {
    if (!config.bingMapsApiKey) return null;

    const { data } = await axios.get<
      BingResponse<BingLocationRecognitionResource>
    >(
      `${this.bingMapsBaseUrl}/LocationRecog/${position.latitude},${position.longitude}?radius=1&top=1&includeEntityTypes=address&verboseplacenames=true&key=${config.bingMapsApiKey}`
    );

    const addressObj =
      data?.resourceSets?.[0]?.resources?.[0]?.addressOfLocation?.[0];

    if (
      data.statusCode !== 200 ||
      !addressObj ||
      !addressObj.formattedAddress
    ) {
      return null;
    }

    return {
      label: addressObj.formattedAddress,
      address: {
        road: undefined,
      },
      position: {
        latitude: addressObj.latitude,
        longitude: addressObj.longitude,
      },
    } as IReverseGeocodeResult;
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
      .get<BingResponse<BingAutosuggestResource>>(
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

  public async bulkReverse(positions: Position[]) {
    const results: (IReverseGeocodeResult | null)[] = [];
    for (const position of positions) {
      let tries = 0;
      let result: IReverseGeocodeResult | null = null;
      let resultFetched = false;
      while (tries < 3 && !result && !resultFetched) {
        tries++;
        try {
          result = await asyncCallWithTimeout<IReverseGeocodeResult | null>(
            this.reverse(position),
            5000
          );
          resultFetched = true;
        } catch (e) {
          result = null;
        }
      }
      results.push(result);
    }
    return results;
  }
}

interface BingResponse<ResourceType> {
  statusCode: number;
  statusDescription: string;
  authenticationResultCode: string;
  traceId: string;
  coptyright: string;
  brandLogoUri: string;
  resourceSets: [
    {
      estimatedTotal: number;
      resources: ResourceType[];
    }
  ];
  errorDetails?: string[];
}

interface BingAddress {
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

interface BingLocationsResource {
  name: string;
  point: {
    coordinates: [lat: number, lon: number];
    bbox: [number, number, number, number];
    entityType: string;
    address: BingAddress;
    confidence: 'High' | 'Medium' | 'Low';
  };
}

interface BingLocationRecognitionResource {
  addressOfLocation: [
    {
      latitude: number;
      longitude: number;
      addressLine: string;
      locality: string;
      neighborhood: string;
      adminDivision: string;
      countryIso2: string;
      postalCode: string;
      formattedAddress: string;
    }
  ];
  businessesAtLocation: any[];
}

interface BingAutosuggestResource {
  __type: string;
  value: [
    {
      __type: 'Address' | 'Place' | 'LocalBusiness';
      name?: string;
      address: BingAddress;
    }
  ];
}
