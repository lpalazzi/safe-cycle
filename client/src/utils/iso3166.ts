import { iso31661, ISO31662Entry } from 'iso-3166';

export const countryCodeToName = (alpha2: string) =>
  iso31661.find((entry) => entry.alpha2 === alpha2)?.name ?? 'Undefined';

export const getSubdivisionNameWithCountry = (subdivision: ISO31662Entry) =>
  countryCodeToName(subdivision.parent) + '/' + subdivision.name;
