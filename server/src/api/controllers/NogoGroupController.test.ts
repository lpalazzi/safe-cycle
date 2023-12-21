import setupDB from 'test/setupDB';
import { makeRequest } from 'test/helpers';
import { createTestUser, createTestNogoGroup, createTestNogo } from 'test/data';
import {
  INogoGroup,
  INogoGroupCreateDTO,
  INogoGroupReturnDTO,
  INogoGroupUpdateDTO,
} from 'interfaces';
import { NogoGroupModel } from 'models';

setupDB('NogoGroupController');

describe('GET /nogoGroup/getAll', () => {
  test('returns all nogo groups in db when requested by admin', async () => {
    await createTestNogoGroup();
    await createTestNogoGroup();
    const user = await createTestUser('admin');
    const res = await makeRequest({
      url: '/nogoGroup/getAll',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.nogoGroups?.length).toBe(2);
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const user = await createTestUser();
    const res = await makeRequest({
      url: '/nogoGroup/getAll',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const res = await makeRequest({ url: '/nogoGroup/getAll' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /nogoGroup/getAllForUser', () => {
  test('returns all nogo groups for logged in user', async () => {
    const user = await createTestUser();
    await createTestNogoGroup(user._id);
    await createTestNogoGroup(user._id);
    await createTestNogoGroup();
    const res = await makeRequest({
      url: '/nogoGroup/getAllForUser',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.nogoGroups?.length).toBeGreaterThanOrEqual(2);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const res = await makeRequest({ url: '/nogoGroup/getAll' });
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /nogoGroup/create', () => {
  test('successfully creates a new nogo group', async () => {
    const user = await createTestUser();
    const nogoGroup: INogoGroupCreateDTO = {
      name: 'Nogo Group',
    };
    const res = await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.nogoGroup?._id).toBeTruthy();
    expect(res.body?.nogoGroup?.name).toBe('Nogo Group');
    const nogoGroupsInDB = await NogoGroupModel.find();
    expect(nogoGroupsInDB.length).toBe(1);
  });

  test('throws BadRequestError when called with incorrect format', async () => {
    const user = await createTestUser();
    const nogoGroup = {
      notTheNameProperty: 'Nogo Group',
    };
    const res = await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
  });

  test('throws BadRequestError if name is already taken', async () => {
    const user = await createTestUser();
    const nogoGroup: INogoGroupCreateDTO = {
      name: 'Nogo Group',
    };
    const res1 = await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
      loggedInUserEmail: user.email,
    });
    expect(res1.statusCode).toBe(200);
    const res2 = await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
      loggedInUserEmail: user.email,
    });
    expect(res2.statusCode).toBe(400);
    const nogoGroups: INogoGroup[] = await NogoGroupModel.find({
      name: 'Nogo Group',
      user: user._id,
    });
    expect(nogoGroups.length).toBe(1);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const nogoGroup = {
      name: 'Nogo Group',
    };
    const res = await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /nogoGroup/update', () => {
  test("successfully updates a nogo group's name", async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogoGroupUpdate: INogoGroupUpdateDTO = {
      name: 'Updated Nogo Group Name',
    };
    const res = await makeRequest({
      url: `/nogoGroup/update/${nogoGroup._id}`,
      method: 'POST',
      data: { nogoGroupUpdate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const updatedNogoGroup: INogoGroup | null = await NogoGroupModel.findById(
      nogoGroup._id
    );
    expect(updatedNogoGroup?.name).toBe('Updated Nogo Group Name');
  });

  test('throws UnauthorizedError if user does not own group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    const nogoGroupUpdate: INogoGroupUpdateDTO = {
      name: 'Updated Nogo Group Name',
    };
    const res = await makeRequest({
      url: `/nogoGroup/update/${nogoGroup._id}`,
      method: 'POST',
      data: { nogoGroupUpdate },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const nogoGroupUpdate: INogoGroupUpdateDTO = {
      name: 'Updated Nogo Group Name',
    };
    const res = await makeRequest({
      url: `/nogoGroup/update/${nogoGroup._id}`,
      method: 'POST',
      data: { nogoGroupUpdate },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('DELETE /nogoGroup/delete', () => {
  test('successfully deletes a nogo group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const res = await makeRequest({
      url: `/nogoGroup/delete/${nogoGroup._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.deleteResult?.nogoGroupDeleted).toBe(true);
    const deletedNogoGroup: INogoGroup | null = await NogoGroupModel.findById(
      nogoGroup._id
    );
    expect(deletedNogoGroup).toBeNull();
  });

  test('throws UnauthorizedError if user does not own group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    const res = await makeRequest({
      url: `/nogoGroup/delete/${nogoGroup._id}`,
      method: 'DELETE',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const res = await makeRequest({
      url: `/nogoGroup/delete/${nogoGroup._id}`,
      method: 'DELETE',
    });
    expect(res.statusCode).toBe(401);
  });
});
