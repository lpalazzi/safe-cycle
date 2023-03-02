import axios from 'axios';
import { injectable } from 'tsyringe';
import { Position, Viewbox } from 'types';
import { IGeocodeSearchResult } from 'interfaces';

@injectable()
export class NominatimService {
  constructor() {}
  private nominatimBaseUrl = 'https://nominatim.openstreetmap.org';

  public async reverse(position: Position) {
    const { data } = await axios.get<NominatimSearchResult>(
      `${this.nominatimBaseUrl}/reverse?lat=${position.latitude}&lon=${position.longitude}&format=json`
    );
    return data.display_name;
  }

  public async search(query: string, viewbox: Viewbox) {
    let searchResults: NominatimSearchResult[] = [];

    const viewboxStr = [
      viewbox.southeast.longitude,
      viewbox.southeast.latitude,
      viewbox.northwest.longitude,
      viewbox.northwest.latitude,
    ].join();

    if (viewboxStr) {
      const { data } = await axios.get<NominatimSearchResult[]>(
        `${this.nominatimBaseUrl}/search?q=${query}&viewbox=${viewboxStr}&bounded=1&addressdetails=1&format=json`
      );
      searchResults.push(...data);
    }

    if (searchResults.length < 10) {
      const { data } = await axios.get<NominatimSearchResult[]>(
        `${
          this.nominatimBaseUrl
        }/search?q=${query}&addressdetails=1&format=json${
          viewboxStr ? `&viewbox=${viewboxStr}` : ''
        }`
      );
      searchResults.push(
        ...data.filter((unboundedResult) => {
          return !searchResults.find((searchResult) => {
            return searchResult.place_id === unboundedResult.place_id;
          });
        })
      );
    }

    return searchResults.map((searchResult) => {
      return {
        label: searchResult.display_name,
        position: {
          latitude: Number(searchResult.lat),
          longitude: Number(searchResult.lon),
        },
      } as IGeocodeSearchResult;
    });
  }
}

interface NominatimSearchResult {
  place_id: number;
  osm_id: number;
  osm_type: string;
  boundingbox: [number, number, number, number];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: NominatimAddress;
  extratags?: {
    capital?: string;
    website?: string;
    wikidata?: string;
    wikipedia?: string;
    population?: string;
  };
  namedetails?: any;
  licence?: string;
}

interface NominatimAddress {
  continent?: string;

  country?: string;
  country_code?: string;

  region?: string;
  state?: string;
  state_district?: string;
  county?: string;

  municipality?: string;
  city?: string;
  town?: string;
  village?: string;

  city_district?: string;
  district?: string;
  borough?: string;
  suburb?: string;
  subdivision?: string;

  hamlet?: string;
  croft?: string;
  isolated_dwelling?: string;

  neighbourhood?: string;
  allotments?: string;
  quarter?: string;

  city_block?: string;
  residential?: string;
  farm?: string;
  farmyard?: string;
  industrial?: string;
  commercial?: string;
  retail?: string;

  road?: string;

  house_number?: string;
  house_name?: string;

  emergency?: string;
  historic?: string;
  military?: string;
  natural?: string;
  landuse?: string;
  place?: string;
  railway?: string;
  man_made?: string;
  aerialway?: string;
  boundary?: string;
  amenity?: string;
  aeroway?: string;
  club?: string;
  craft?: string;
  leisure?: string;
  office?: string;
  mountain_pass?: string;
  shop?: string;
  tourism?: string;
  bridge?: string;
  tunnel?: string;
  waterway?: string;

  postcode?: string;
}
