export type UserRole = null | 'admin' | 'verified contributor';

export type UserSettings = {};

export type ContributorProfile = {
  title: string;
  bio: string;
  imageFilename: string;
};
