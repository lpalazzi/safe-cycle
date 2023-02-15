import { ID, Name, UserRole } from 'types';

interface RegionParams {
  _id: ID;
  name: string;
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
  public polygon;
  public contributors;
  public isRegion = true;

  constructor(params: RegionParams) {
    this._id = params._id;
    this.name = params.name;
    this.polygon = params.polygon;
    this.contributors = params.contributors;
  }

  public isUserContributor(userId: ID) {
    return !!this.contributors.find(
      (contributor) => contributor._id === userId
    );
  }
}
