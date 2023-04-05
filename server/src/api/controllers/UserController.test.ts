import setupDB from 'test/setupDB';
import { makeRequest, makeLoginRequest } from 'test/helpers';
import { createTestUser, createMultipleTestUsers } from 'test/data';
import mongoose from 'mongoose';
import { IUser, IUserChangePasswordDTO, IUserSignupDTO } from 'interfaces';
import { UserModel } from 'models';
import { UserSettings } from 'types';

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
  test('successfully creates new user', async () => {
    const userSignup: IUserSignupDTO = {
      email: 'test@email.com',
      name: { first: 'Jack', last: 'White' },
      password: 'whitestripes',
    };
    const res = await makeRequest({
      url: '/user/signup',
      method: 'POST',
      data: { userSignup },
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.user).toBeTruthy();
    const user: IUser | null = await UserModel.findById(res.body?.user?._id);
    expect(user).toBeTruthy();
    expect(user?.email).toBe(userSignup.email);
    expect(user?.name).toEqual(userSignup.name);
  });

  test('throws BadRequestError if email is not valid', async () => {
    const userSignup: IUserSignupDTO = {
      email: 'not_an_email',
      name: { first: 'Jack', last: 'White' },
      password: 'whitestripes',
    };
    const res = await makeRequest({
      url: '/user/signup',
      method: 'POST',
      data: { userSignup },
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"email" must be a valid email');
    const usersWithEmail = await UserModel.count({ email: userSignup.email });
    expect(usersWithEmail).toBe(0);
  });

  test('throws BadRequestError if password is too short', async () => {
    const userSignup: IUserSignupDTO = {
      email: 'test@email.com',
      name: { first: 'Jack', last: 'White' },
      password: 'white',
    };
    const res = await makeRequest({
      url: '/user/signup',
      method: 'POST',
      data: { userSignup },
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      '"password" length must be at least 8 characters long'
    );
    const usersWithEmail = await UserModel.count({ email: userSignup.email });
    expect(usersWithEmail).toBe(0);
  });

  test('throws BadRequestError if user already exists with email', async () => {
    const user = await createTestUser();
    const userSignup: IUserSignupDTO = {
      email: user.email,
      name: { first: 'Jack', last: 'White' },
      password: 'whitestripes',
    };
    const res = await makeRequest({
      url: '/user/signup',
      method: 'POST',
      data: { userSignup },
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('A user already exists with this email');
    const usersWithEmail = await UserModel.count({ email: user.email });
    expect(usersWithEmail).toBe(1);
  });
});

describe('POST /user/login', () => {
  test('successfully logs in user and sets cookie', async () => {
    const user = await createTestUser();
    const res = await makeLoginRequest({
      email: user.email,
      password: 'password',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.user?.email).toEqual(user.email);
    expect(res.body?.user?.name).toEqual(user.name);
    expect(user._id.equals(res.body?.user?._id)).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('throws BadRequestError if email is not provided', async () => {
    await createTestUser();
    const res = await makeLoginRequest({ password: 'password' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"email" is required');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('throws BadRequestError if password is not provided', async () => {
    const user = await createTestUser();
    const res = await makeLoginRequest({ email: user.email });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"password" is required');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('throws BadRequestError if incorrect password is provided', async () => {
    const user = await createTestUser();
    const res = await makeLoginRequest({
      email: user.email,
      password: 'not the correct password',
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Incorrect password');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('throws ModelNotFoundError if user does not exist with provided email', async () => {
    const res = await makeLoginRequest({
      email: 'test@email.com',
      password: 'password',
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('User with email test@email.com not found');
    expect(res.headers['set-cookie']).toBeUndefined();
  });
});

describe('POST /user/changePassword', () => {
  test("successfully changes a user's password", async () => {
    const user = await createTestUser();
    const changePasswordDTO: IUserChangePasswordDTO = {
      currentPassword: 'password',
      newPassword: 'new password',
    };
    const res = await makeRequest({
      url: '/user/changePassword',
      method: 'POST',
      data: { changePasswordDTO },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const loginRes = await makeLoginRequest({
      email: user.email,
      password: changePasswordDTO.newPassword,
    });
    expect(loginRes.statusCode).toBe(200);
    expect(user._id.equals(loginRes.body?.user?._id)).toBe(true);
    expect(loginRes.headers['set-cookie']).toBeDefined();
  });

  test('throws BadRequestError if current password is not provided', async () => {
    const user = await createTestUser();
    const changePasswordDTO = {
      newPassword: 'new password',
    };
    const res = await makeRequest({
      url: '/user/changePassword',
      method: 'POST',
      data: { changePasswordDTO },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"currentPassword" is required');
    const loginRes = await makeLoginRequest({
      email: user.email,
      password: changePasswordDTO.newPassword,
    });
    expect(loginRes.statusCode).toBe(400);
    expect(loginRes.headers['set-cookie']).toBeUndefined();
  });

  test('throws BadRequestError if new password is not provided', async () => {
    const user = await createTestUser();
    const changePasswordDTO = {
      currentPassword: 'password',
    };
    const res = await makeRequest({
      url: '/user/changePassword',
      method: 'POST',
      data: { changePasswordDTO },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('"newPassword" is required');
    const loginRes = await makeLoginRequest({
      email: user.email,
      password: changePasswordDTO.currentPassword,
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.headers['set-cookie']).toBeDefined();
  });

  test('throws BadRequestError if incorrect current password is provided', async () => {
    const user = await createTestUser();
    const changePasswordDTO: IUserChangePasswordDTO = {
      currentPassword: 'incorrect password',
      newPassword: 'new password',
    };
    const res = await makeRequest({
      url: '/user/changePassword',
      method: 'POST',
      data: { changePasswordDTO },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Incorrect current password');
    const loginRes = await makeLoginRequest({
      email: user.email,
      password: 'password',
    });
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.headers['set-cookie']).toBeDefined();
  });
});

describe('POST /user/updateUserRole', () => {
  test("successfully updates a user's role to verified contributor when logged in as admin", async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: '/user/updateUserRole',
      method: 'POST',
      data: { userId: user._id, role: 'verified contributor' },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.role).toBe('verified contributor');
  });

  test("successfully updates a user's role to admin when logged in as admin", async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: '/user/updateUserRole',
      method: 'POST',
      data: { userId: user._id, role: 'admin' },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.role).toBe('admin');
  });

  test('throws UnauthorizedError when not logged in as admin', async () => {
    const user = await createTestUser();
    const res = await makeRequest({
      url: '/user/updateUserRole',
      method: 'POST',
      data: { userId: user._id, role: 'verified contributor' },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(401);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.role).toBeFalsy();
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await createTestUser();
    const res = await makeRequest({
      url: '/user/updateUserRole',
      method: 'POST',
      data: { userId: user._id, role: 'verified contributor' },
    });
    expect(res.statusCode).toBe(401);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.role).toBeFalsy();
  });

  test('throws BadRequestError when userId is not provided', async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: '/user/updateUserRole',
      method: 'POST',
      data: { role: 'verified contributor' },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.message).toBe('userId not provided');
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.role).toBeFalsy();
  });

  test('throws BadRequestError when userId is not a valid ObjectId', async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: '/user/updateUserRole',
      method: 'POST',
      data: { userId: 'not an object id', role: 'verified contributor' },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.message).toBe('userId is not a valid ObjectId');
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.role).toBeFalsy();
  });

  test('throws BadRequestError when role is not a valid role', async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser('admin');
    const res = await makeRequest({
      url: '/user/updateUserRole',
      method: 'POST',
      data: { userId: user._id, role: 'not a valid role' },
      loggedInUserEmail: adminUser.email,
    });
    expect(res.statusCode).toBe(400);
    expect(res.body?.message).toBe('Role must be a valid role');
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.role).toBeFalsy();
  });
});

describe('POST /user/updateUserSettings', () => {
  test('successfully enables privateNogosEnabled setting', async () => {
    const user = await createTestUser();
    const userSettings: Partial<UserSettings> = { privateNogosEnabled: true };
    const res = await makeRequest({
      url: '/user/updateUserSettings',
      method: 'POST',
      data: { userSettings },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body?.success).toBe(true);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.settings?.privateNogosEnabled).toBe(true);
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await createTestUser();
    const userSettings: Partial<UserSettings> = { privateNogosEnabled: true };
    const res = await makeRequest({
      url: '/user/updateUserSettings',
      method: 'POST',
      data: { userSettings },
    });
    expect(res.statusCode).toBe(401);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.settings?.privateNogosEnabled).toBeFalsy();
  });

  test('throws BadRequestError when userSettings is not provided', async () => {
    const user = await createTestUser();
    const res = await makeRequest({
      url: '/user/updateUserSettings',
      method: 'POST',
      data: {},
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.settings?.privateNogosEnabled).toBeFalsy();
  });

  test('throws BadRequestError when userSettings is not correct type', async () => {
    const user = await createTestUser();
    const userSettings = { privateNogosEnabled: 'not a boolean' };
    const res = await makeRequest({
      url: '/user/updateUserSettings',
      method: 'POST',
      data: { userSettings },
      loggedInUserEmail: user.email,
    });
    expect(res.statusCode).toBe(400);
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser?.settings?.privateNogosEnabled).toBeFalsy();
  });
});
