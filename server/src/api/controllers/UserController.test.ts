import setupDB from 'test/setupDB';
import { makeRequest } from 'test/helpers';
import { createTestUser, createMultipleTestUsers } from 'test/data';
import mongoose from 'mongoose';

setupDB('UserController');

describe('GET /user/getAll', () => {
  test('returns all users when requested by admin', async () => {
    await createMultipleTestUsers(10);
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: '/user/getAll',
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.users?.length).toBe(11);
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const user = await createTestUser();
    const res = await makeRequest({
      url: '/user/getAll',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when requested by verified contributor', async () => {
    const user = await createTestUser('verified contributor');
    const res = await makeRequest({
      url: '/user/getAll',
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const res = await makeRequest({ url: '/user/getAll' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /user/getById', () => {
  test('returns the user when requested by admin', async () => {
    const userToFetch = await createTestUser();
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: `/user/getById/${userToFetch._id.toString()}`,
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(200);
    expect(userToFetch._id.equals(res.body?.user?._id)).toBe(true);
  });

  test('throws ModelNotFoundError when requested by admin but user does not exist', async () => {
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: `/user/getById/${new mongoose.Types.ObjectId().toString()}`,
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(404);
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const user = await createTestUser();
    const userToFetch = await createTestUser();
    const res = await makeRequest({
      url: `/user/getById/${userToFetch._id.toString()}`,
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when requested by verified contributor', async () => {
    const user = await createTestUser('verified contributor');
    const userToFetch = await createTestUser();
    const res = await makeRequest({
      url: `/user/getById/${userToFetch._id.toString()}`,
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const userToFetch = await createTestUser();
    const res = await makeRequest({
      url: `/user/getById/${userToFetch._id.toString()}`,
    });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /user/getActiveUser', () => {
  test('returns user that is logged in', async () => {
    const user = await createTestUser();
    const res = await makeRequest({
      url: '/user/getActiveUser',
      loggedInUserEmail: user.email,
    });
    expect(user._id.equals(res.body?.user?._id)).toBe(true);
  });

  test('returns null when not logged in', async () => {
    const res = await makeRequest({
      url: '/user/getActiveUser',
    });
    expect(res.body?.user).toBeNull();
  });
});

describe('POST /user/signup', () => {
  test('', async () => {});
});

describe('POST /user/changePassword', () => {
  test('', async () => {});
});

describe('POST /user/updateUserRole', () => {
  test('', async () => {});
});

describe('POST /user/updateUserSettings', () => {
  test('', async () => {});
});
