export type UserRole = null | 'admin' | 'verified contributor';

export type UserSettings = {
  privateNogosEnabled?: boolean;
};

export type ContributorProfile = {
  title: string;
  bio: string;
  imageFilename: string;
};
