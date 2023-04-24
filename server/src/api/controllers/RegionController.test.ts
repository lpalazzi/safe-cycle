import setupDB from 'test/setupDB';
import { makeRequest } from 'test/helpers';
import { createTestUser, createTestRegion } from 'test/data';
import { IRegion, IRegionCreateDTO } from 'interfaces';
import { RegionModel } from 'models';

setupDB('RegionController');

describe('GET /region/getAll', () => {
  test('returns all regions in db', async () => {
    await createTestRegion();
    await createTestRegion();
    const res = await makeRequest({ url: '/region/getAll' });
    expect(res.statusCode).toBe(200);
    expect(res.body?.regions?.length).toBe(2);
  });
});

describe('POST /region/create', () => {
  test('successfully creates a new region as admin', async () => {
    const user = await createTestUser('admin');
    const region: IRegionCreateDTO = {
      name: 'Test Region',
      iso31662: 'CA-ON',
      polygon: {
        type: 'Polygon',
        coordinates: [
          [
            [-83.1496944, 42.041],
            [-83.1488244, 42.0390871],
            [-83.143956, 42.02793],
          ],
        ],
      },
    };
    const res = await makeRequest({
      url: '/region/create',
      method: 'POST',
      data: { region },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.region?._id).toBeTruthy();
    expect(res.body?.region?.name).toBe('Test Region');
    const regionsInDB = await RegionModel.find();
    expect(regionsInDB.length).toBe(1);
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const user = await createTestUser();
    const region: IRegionCreateDTO = {
      name: 'Test Region',
      iso31662: 'CA-ON',
      polygon: {
        type: 'Polygon',
        coordinates: [
          [
            [-83.1496944, 42.041],
            [-83.1488244, 42.0390871],
            [-83.143956, 42.02793],
          ],
        ],
      },
    };
    const res = await makeRequest({
      url: '/region/create',
      method: 'POST',
      data: { region },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
    const regionsInDB = await RegionModel.find();
    expect(regionsInDB.length).toBe(0);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const region: IRegionCreateDTO = {
      name: 'Test Region',
      iso31662: 'CA-ON',
      polygon: {
        type: 'Polygon',
        coordinates: [
          [
            [-83.1496944, 42.041],
            [-83.1488244, 42.0390871],
            [-83.143956, 42.02793],
          ],
        ],
      },
    };
    const res = await makeRequest({
      url: '/region/create',
      method: 'POST',
      data: { region },
    });
    expect(res.statusCode).toBe(401);
    const regionsInDB = await RegionModel.find();
    expect(regionsInDB.length).toBe(0);
  });

  test('throws BadRequestError when called with incorrect format', async () => {
    const user = await createTestUser('admin');
    const region = {
      name: false,
      iso31662: 1,
    };
    const res = await makeRequest({
      url: '/region/create',
      method: 'POST',
      data: { region },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
    const regionsInDB = await RegionModel.find();
    expect(regionsInDB.length).toBe(0);
  });

  test('throws BadRequestError if name is already taken', async () => {
    const user = await createTestUser('admin');
    const region: IRegionCreateDTO = {
      name: 'Test Region',
      iso31662: 'CA-ON',
      polygon: {
        type: 'Polygon',
        coordinates: [
          [
            [-83.1496944, 42.041],
            [-83.1488244, 42.0390871],
            [-83.143956, 42.02793],
          ],
        ],
      },
    };
    const res1 = await makeRequest({
      url: '/region/create',
      method: 'POST',
      data: { region },
      loggedInUserEmail: user.email,
    });
    expect(res1.statusCode).toBe(200);
    const res2 = await makeRequest({
      url: '/region/create',
      method: 'POST',
      data: { region },
      loggedInUserEmail: user.email,
    });
    expect(res2.statusCode).toBe(400);
    const regionsInDB = await RegionModel.find({ name: region.name });
    expect(regionsInDB.length).toBe(1);
  });
});

describe('POST /region/addContributorToRegion', () => {
  test('successfully adds a contributor to a region as admin', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { userId: user._id, regionId: region._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(
      regionInDB?.contributors[0] && user._id.equals(regionInDB.contributors[0])
    ).toBeTruthy();
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const normalUser = await createTestUser();
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { userId: user._id, regionId: region._id },
      loggedInUserEmail: normalUser.email,
    });
    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(0);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { userId: user._id, regionId: region._id },
    });
    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(0);
  });

  test('throws BadRequestError when called with no regionId', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { userId: user._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(0);
  });

  test('throws BadRequestError when called with no userId', async () => {
    const adminUser = await createTestUser('admin');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { regionId: region._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(0);
  });

  test('throws BadRequestError if regionId is not a valid ObjectId', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { userId: user._id, regionId: '12345' },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(0);
  });

  test('throws BadRequestError if userId is not a valid ObjectId', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion();
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { userId: '12345', regionId: region._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(0);
  });

  test('throws BadRequestError if user is already a contributor on region', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/addContributorToRegion',
      method: 'POST',
      data: { userId: user._id, regionId: region._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(1);
  });
});

describe('POST /region/removeContributorFromRegion', () => {
  test('successfully removes a contributor to a region as admin', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/removeContributorFromRegion',
      method: 'POST',
      data: { userId: user._id, regionId: region._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(regionInDB?.contributors?.length).toBe(0);
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const normalUser = await createTestUser();
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/removeContributorFromRegion',
      method: 'POST',
      data: { userId: user._id, regionId: region._id },
      loggedInUserEmail: normalUser.email,
    });
    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(
      regionInDB?.contributors[0] && user._id.equals(regionInDB.contributors[0])
    ).toBeTruthy();
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/removeContributorFromRegion',
      method: 'POST',
      data: { userId: user._id, regionId: region._id },
    });
    expect(res.statusCode).toBe(401);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(
      regionInDB?.contributors[0] && user._id.equals(regionInDB.contributors[0])
    ).toBeTruthy();
  });

  test('throws BadRequestError when called with no regionId', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/removeContributorFromRegion',
      method: 'POST',
      data: { userId: user._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(
      regionInDB?.contributors[0] && user._id.equals(regionInDB.contributors[0])
    ).toBeTruthy();
  });

  test('throws BadRequestError when called with no userId', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/removeContributorFromRegion',
      method: 'POST',
      data: { regionId: region._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(
      regionInDB?.contributors[0] && user._id.equals(regionInDB.contributors[0])
    ).toBeTruthy();
  });

  test('throws BadRequestError if regionId is not a valid ObjectId', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/removeContributorFromRegion',
      method: 'POST',
      data: { userId: user._id, regionId: '12345' },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(
      regionInDB?.contributors[0] && user._id.equals(regionInDB.contributors[0])
    ).toBeTruthy();
  });

  test('throws BadRequestError if userId is not a valid ObjectId', async () => {
    const adminUser = await createTestUser('admin');
    const user = await createTestUser('verified contributor');
    const region = await createTestRegion([user._id]);
    const res = await makeRequest({
      url: '/region/removeContributorFromRegion',
      method: 'POST',
      data: { userId: '12345', regionId: region._id },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.success).toBeFalsy();
    const regionInDB: IRegion | null = await RegionModel.findById(region._id);
    expect(
      regionInDB?.contributors[0] && user._id.equals(regionInDB.contributors[0])
    ).toBeTruthy();
  });
});
