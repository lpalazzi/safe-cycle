export interface BingAutosuggestResult {
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

export interface BingLocationResult {
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
          coordinates: [number, number]; // lat,lon
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
