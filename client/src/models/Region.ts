import { iso31662 } from 'iso-3166';
import { NogoApi } from 'api';
import { ID, Name, UserRole } from 'types';
import { getSubdivisionNameWithCountry } from 'utils/iso3166';

interface RegionParams {
  _id: ID;
  name: string;
  iso31662: string;
  polygon: GeoJSON.Polygon;
  contributors: {
    _id: ID;
    name: Name;
    role: UserRole;
  }[];
}

export class Region {
  public _id;
  public name;
  public iso31662;
  public polygon;
  public contributors;
  public isRegion = true;

  constructor(params: RegionParams) {
    this._id = params._id;
    this.name = params.name;
    this.polygon = params.polygon;
    this.contributors = params.contributors;

    const subdivisionEntry = iso31662.find(
      (subd) => subd.code === params.iso31662
    );
    this.iso31662 = subdivisionEntry
      ? {
          ...subdivisionEntry,
          nameWithCountry: getSubdivisionNameWithCountry(subdivisionEntry),
        }
      : undefined;
  }

  public isUserContributor(userId: ID) {
    return !!this.contributors.find(
      (contributor) => contributor._id === userId
    );
  }

  public async downloadNogos() {
    const nogos = await NogoApi.getAllByGroup(this._id, true);

    const link = document.createElement('a');
    link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(nogos)
    )}`;
    link.download =
      this.name.replace(/[^a-zA-Z0-9 ]/g, '').replace(' ', '') + '.json';

    link.click();
    link.remove();
  }
}
