export interface NominatimSearchResult {
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
