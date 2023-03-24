import setupDB from 'test/setupDB';
import { container } from 'tsyringe';
import { NogoService } from 'services';
import {
  createTestUser,
  createTestNogo,
  createTestNogoGroup,
  createTestRegion,
} from 'test/data';
import { NogoModel } from 'models';
import mongoose from 'mongoose';

setupDB('NogoService');
const nogoService = container.resolve(NogoService);

describe('transferNogosToRegion', () => {
  test('returns correct number of nogos transferred', async () => {
    const nogoGroup = await createTestNogoGroup();
    const region = await createTestRegion();
    await createTestNogo(nogoGroup._id);
    await createTestNogo(nogoGroup._id);
    let count = await nogoService.transferNogosToRegion(
      nogoGroup._id,
      region._id
    );
    expect(count).toBe(2);
    let nogosInRegion = await NogoModel.find({ region: region._id });
    expect(nogosInRegion.length).toBe(2);
    let nogosInGroup = await NogoModel.find({ nogoGroup: nogoGroup._id });
    expect(nogosInGroup.length).toBe(0);
    await createTestNogo(nogoGroup._id);
    await createTestNogo(nogoGroup._id);
    await createTestNogo(nogoGroup._id);
    count = await nogoService.transferNogosToRegion(nogoGroup._id, region._id);
    expect(count).toBe(3);
    nogosInRegion = await NogoModel.find({ region: region._id });
    expect(nogosInRegion.length).toBe(5);
    nogosInGroup = await NogoModel.find({ nogoGroup: nogoGroup._id });
    expect(nogosInGroup.length).toBe(0);
  });

  test('fails if region does not exist', async () => {
    const nogoGroup = await createTestNogoGroup();
    await createTestNogo(nogoGroup._id);
    await createTestNogo(nogoGroup._id);
    await expect(
      nogoService.transferNogosToRegion(
        nogoGroup._id,
        new mongoose.Types.ObjectId()
      )
    ).rejects.toThrowError('Region does not exist');
  });

  test('fails if nogoGroup does not exist', async () => {
    const region = await createTestRegion();
    await expect(
      nogoService.transferNogosToRegion(
        new mongoose.Types.ObjectId(),
        region._id
      )
    ).rejects.toThrowError('Nogo group does not exist');
  });
});

describe('canUserUpdateNogo', () => {
  test('returns true if user owns nogoGroup the nogo is tied to', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogo = await createTestNogo(nogoGroup._id);
    const userCanUpdateNogo = await nogoService.canUserUpdateNogo(
      nogo._id,
      user._id
    );
    expect(userCanUpdateNogo).toBe(true);
  });

  test('returns false if user does not own nogoGroup the nogo is tied to', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    const nogo = await createTestNogo(nogoGroup._id);
    const userCanUpdateNogo = await nogoService.canUserUpdateNogo(
      nogo._id,
      user._id
    );
    expect(userCanUpdateNogo).toBe(false);
  });

  test('returns true if user is contributor on region the nogo is tied to', async () => {
    const user = await createTestUser();
    const region = await createTestRegion([user._id]);
    const nogo = await createTestNogo(undefined, region._id);
    const userCanUpdateNogo = await nogoService.canUserUpdateNogo(
      nogo._id,
      user._id
    );
    expect(userCanUpdateNogo).toBe(true);
  });

  test('returns false if user is not a contributor on region the nogo is tied to', async () => {
    const user = await createTestUser();
    const region = await createTestRegion([]);
    const nogo = await createTestNogo(undefined, region._id);
    const userCanUpdateNogo = await nogoService.canUserUpdateNogo(
      nogo._id,
      user._id
    );
    expect(userCanUpdateNogo).toBe(false);
  });
});
