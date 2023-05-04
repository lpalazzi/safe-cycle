import { ID } from 'types';

class FeatureFlag {
  private userIds;

  constructor(userIds: ID[]) {
    this.userIds = userIds;
  }

  public isEnabledForUser(userId?: ID) {
    if (!userId) return false;
    return this.userIds.includes(userId);
  }
}

export const FeatureFlags = {
  TurnInstructions: new FeatureFlag([
    '63af4f33e82801490125705a', // Lucas dev
    '63c068b419395f46b8a65c94', // Lucas
    '63c2f08440bcca4499f0d543', // Tom
    '63c2eeac40bcca4499f0d52d', // Adam
  ]),
};
