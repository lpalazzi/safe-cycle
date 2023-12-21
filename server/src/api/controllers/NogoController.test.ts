import mongoose from 'mongoose';
import setupDB from 'test/setupDB';
import { makeRequest } from 'test/helpers';
import {
  createTestUser,
  createTestNogo,
  createTestNogoGroup,
  createTestRegion,
} from 'test/data';
import { NogoGroupModel, NogoModel, RegionModel } from 'models';
import { INogo, INogoCreateDTO } from 'interfaces';
import { getLengthForLineString } from 'utils/geo';

setupDB('NogoController');

describe('GET /nogo/getAllByGroup', () => {
  test('returns all nogos in a region', async () => {
    const region = await createTestRegion();
    await createTestNogo(undefined, region._id);
    await createTestNogo(undefined, region._id);
    await createTestNogo();
    const res = await makeRequest({
      url: `/nogo/getAllByGroup/${region._id}/region`,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.nogos).toBeTruthy();
    expect(res.body?.nogos.length).toBe(2);
  });

  test("returns all nogos in a nogo group when logged in as group's owner", async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo();
    const res = await makeRequest({
      url: `/nogo/getAllByGroup/${nogoGroup._id}/nogoGroup`,
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.nogos).toBeTruthy();
    expect(res.body?.nogos.length).toBe(2);
  });

  test('throws UnauthorizedError if user does not own nogo group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo();
    const res = await makeRequest({
      url: `/nogo/getAllByGroup/${nogoGroup._id}/nogoGroup`,
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws BadRequestError if groupId is not valid ObjectId', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo();
    const res = await makeRequest({
      url: `/nogo/getAllByGroup/12345/nogoGroup`,
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /nogo/create', () => {
  test('successfully creates a nogo in a nogo group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogoCreate: INogoCreateDTO = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      nogoGroup: nogoGroup._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.nogo).toBeTruthy();
    expect(nogoGroup._id.equals(res.body?.nogo?.nogoGroup)).toBeTruthy();
    expect(res.body?.nogo?.region).toBeFalsy();
  });

  test('successfully creates a nogo in a region', async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const nogoCreate: INogoCreateDTO = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      region: region._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.nogo).toBeTruthy();
    expect(region._id.equals(res.body?.nogo?.region)).toBeTruthy();
    expect(res.body?.nogo?.nogoGroup).toBeFalsy();
  });

  test('throws BadRequestError if less than 2 points are provided', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogoCreate = {
      points: [[-83.017787, 42.320941]],
      nogoGroup: nogoGroup._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws BadRequestError if groupId is not valid ObjectId', async () => {
    const user = await createTestUser();
    const nogoCreate = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      nogoGroup: '12345',
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws BadRequestError if nogo is outside of region', async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const nogoCreate: INogoCreateDTO = {
      points: [
        [105.09168505668642, 34.90910013239023],
        [105.09448528289796, 34.90696211766489],
      ],
      region: region._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws UnauthorizedError if user does not own nogo group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    const nogoCreate: INogoCreateDTO = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      nogoGroup: nogoGroup._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError if user is not contributor on region', async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([]);
    const nogoCreate: INogoCreateDTO = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      region: region._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogoCreate: INogoCreateDTO = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      nogoGroup: nogoGroup._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
    });
    expect(res.statusCode).toBe(401);
  });

  test('adds the appropriate nogoLength to its nogo group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogoCreate: INogoCreateDTO = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      nogoGroup: nogoGroup._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    const expectedNogoLength = res.body?.nogo?.lineString
      ? getLengthForLineString(res.body?.nogo?.lineString)
      : undefined;
    const updatedNogoGroup = await NogoGroupModel.findById(nogoGroup._id);
    expect(updatedNogoGroup?.nogoLength).toBe(expectedNogoLength);
  });

  test('adds the appropriate nogoLength to its region', async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const nogoCreate: INogoCreateDTO = {
      points: [
        [-83.017787, 42.320941],
        [-83.017072, 42.321212],
      ],
      region: region._id,
    };
    const res = await makeRequest({
      url: '/nogo/create',
      method: 'POST',
      data: { nogoCreate },
      loggedInUserEmail: user.email,
    });
    const expectedNogoLength = res.body?.nogo?.lineString
      ? getLengthForLineString(res.body?.nogo?.lineString)
      : undefined;
    const updatedRegion = await RegionModel.findById(region._id);
    expect(updatedRegion?.nogoLength).toBe(expectedNogoLength);
  });
});

describe('POST /nogo/transferNogosToRegion', () => {
  test('successfully transfers nogos from a nogo group to a region when logged in as admin', async () => {
    const user = await createTestUser('admin');
    const nogoGroup = await createTestNogoGroup();
    const region = await createTestRegion();
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(undefined, region._id);
    await createTestNogo(undefined, undefined);
    const res = await makeRequest({
      url: '/nogo/transferNogosToRegion',
      method: 'POST',
      data: {
        nogoGroupId: nogoGroup._id,
        regionId: region._id,
      },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.updateCount).toBe(2);
    const nogosOnRegion: INogo[] = await NogoModel.find({
      region: region._id,
    });
    expect(nogosOnRegion.length).toBe(3);
  });

  test('throws BadRequestError if nogoGroupId is not valid ObjectId', async () => {
    const user = await createTestUser('admin');
    const nogoGroup = await createTestNogoGroup();
    const region = await createTestRegion();
    await createTestNogo(nogoGroup._id, undefined);
    const res = await makeRequest({
      url: '/nogo/transferNogosToRegion',
      method: 'POST',
      data: {
        nogoGroupId: '12345',
        regionId: region._id,
      },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws BadRequestError if regionId is not valid ObjectId', async () => {
    const user = await createTestUser('admin');
    const nogoGroup = await createTestNogoGroup();
    const res = await makeRequest({
      url: '/nogo/transferNogosToRegion',
      method: 'POST',
      data: {
        nogoGroupId: nogoGroup._id,
        regionId: '12345',
      },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws BadRequestError if region referenced by regionId does not exist', async () => {
    const user = await createTestUser('admin');
    const nogoGroup = await createTestNogoGroup();
    const res = await makeRequest({
      url: '/nogo/transferNogosToRegion',
      method: 'POST',
      data: {
        nogoGroupId: nogoGroup._id,
        regionId: new mongoose.Types.ObjectId(),
      },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws BadRequestError if nogoGroup referenced by nogoGroupId does not exist', async () => {
    const user = await createTestUser('admin');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/nogo/transferNogosToRegion',
      method: 'POST',
      data: {
        nogoGroupId: new mongoose.Types.ObjectId(),
        regionId: region._id,
      },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    const region = await createTestRegion();
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(undefined, region._id);
    await createTestNogo(undefined, undefined);
    const res = await makeRequest({
      url: '/nogo/transferNogosToRegion',
      method: 'POST',
      data: {
        nogoGroupId: nogoGroup._id,
        regionId: region._id,
      },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
    const nogosOnRegion: INogo[] = await NogoModel.find({
      region: region._id,
    });
    expect(nogosOnRegion.length).toBe(1);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const nogoGroup = await createTestNogoGroup();
    const region = await createTestRegion();
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(nogoGroup._id, undefined);
    await createTestNogo(undefined, region._id);
    await createTestNogo(undefined, undefined);
    const res = await makeRequest({
      url: '/nogo/transferNogosToRegion',
      method: 'POST',
      data: {
        nogoGroupId: nogoGroup._id,
        regionId: region._id,
      },
    });
    expect(res.statusCode).toBe(401);
    const nogosOnRegion: INogo[] = await NogoModel.find({
      region: region._id,
    });
    expect(nogosOnRegion.length).toBe(1);
  });
});

describe('DELETE /nogo/delete', () => {
  test('successfully deletes a nogo from a group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogo = await createTestNogo(nogoGroup._id);
    await createTestNogo(nogoGroup._id);
    const res = await makeRequest({
      url: `/nogo/delete/${nogo._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.deletedCount).toBe(1);
    const nogosOnGroup: INogo[] = await NogoModel.find({
      nogoGroup: nogoGroup._id,
    });
    expect(nogosOnGroup.length).toBe(1);
  });

  test('successfully deletes a nogo from a region', async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const nogo = await createTestNogo(undefined, region._id);
    await createTestNogo(undefined, region._id);
    const res = await makeRequest({
      url: `/nogo/delete/${nogo._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.deletedCount).toBe(1);
    const nogosOnRegion: INogo[] = await NogoModel.find({
      region: region._id,
    });
    expect(nogosOnRegion.length).toBe(1);
  });

  test("throws UnauthorizedError if user does not own nogo's group", async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    const nogo = await createTestNogo(nogoGroup._id);
    await createTestNogo(nogoGroup._id);
    const res = await makeRequest({
      url: `/nogo/delete/${nogo._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
    const nogosOnGroup: INogo[] = await NogoModel.find({
      nogoGroup: nogoGroup._id,
    });
    expect(nogosOnGroup.length).toBe(2);
  });

  test("throws UnauthorizedError if user is not contributor on nogo's region", async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([]);
    const nogo = await createTestNogo(undefined, region._id);
    await createTestNogo(undefined, region._id);
    const res = await makeRequest({
      url: `/nogo/delete/${nogo._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
    const nogosOnRegion: INogo[] = await NogoModel.find({
      region: region._id,
    });
    expect(nogosOnRegion.length).toBe(2);
  });

  test('subtracts the appropriate nogoLength from its nogo group', async () => {
    const user = await createTestUser();
    const { _id: nogoGroupId } = await createTestNogoGroup(user._id);
    const nogo = await createTestNogo(nogoGroupId);
    await createTestNogo(nogoGroupId);
    const nogoGroupBefore = await NogoGroupModel.findById(nogoGroupId);
    const nogoLengthBefore = nogoGroupBefore?.nogoLength || 0;
    await makeRequest({
      url: `/nogo/delete/${nogo._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    const nogoGroupAfter = await NogoGroupModel.findById(nogoGroupId);
    const expectedNogoLength =
      nogoLengthBefore - getLengthForLineString(nogo.lineString);
    expect(nogoGroupAfter?.nogoLength).toBe(expectedNogoLength);
  });

  test('subtracts the appropriate nogoLength from its region', async () => {
    const user = await createTestUser('verified contributor');
    const { _id: regionId } = await createTestRegion([user._id]);
    const nogo = await createTestNogo(undefined, regionId);
    await createTestNogo(undefined, regionId);
    const regionBefore = await RegionModel.findById(regionId);
    const nogoLengthBefore = regionBefore?.nogoLength || 0;
    await makeRequest({
      url: `/nogo/delete/${nogo._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    const regionAfter = await RegionModel.findById(regionId);
    const expectedNogoLength =
      nogoLengthBefore - getLengthForLineString(nogo.lineString);
    expect(regionAfter?.nogoLength).toBe(expectedNogoLength);
  });
});
