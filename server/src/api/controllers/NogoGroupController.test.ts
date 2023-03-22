import { useDB, useServer } from 'test/services';
import { makeRequest } from 'test/helpers';
import { getTestUser, createTestNogoGroup } from 'test/data';

useDB();
useServer();

describe('/getAll', () => {
  test('returns all nogo groups in db when requested by admin', async () => {
    await createTestNogoGroup();
    const user = await getTestUser('admin');
    await makeRequest({
      url: '/nogoGroup/getAll',
      method: 'GET',
      loggedInUserEmail: user.email,
    })
      .then((res) => {
        expect(res.data?.nogoGroups?.length).toBeGreaterThanOrEqual(1);
      })
      .catch((err) => {
        fail('UnauthorizedError was thrown');
      });
  });

  test('throws UnauthorizedError when requested by normal user', async () => {
    const user = await getTestUser();
    await makeRequest({
      url: '/nogoGroup/getAll',
      method: 'GET',
      loggedInUserEmail: user.email,
    })
      .then((res) => {
        fail('Expected UnauthorizedError to be thrown');
      })
      .catch((err) => {
        if (err.response) {
          expect(err.response.status).toBe(401);
        } else {
          throw err;
        }
      });
  });

  test('throws UnauthorizedError when not logged in', async () => {
    await makeRequest({
      url: '/nogoGroup/getAll',
      method: 'GET',
    })
      .then((res) => {
        fail('Expected UnauthorizedError to be thrown');
      })
      .catch((err) => {
        if (err.response) {
          expect(err.response.status).toBe(401);
        } else {
          throw err;
        }
      });
  });
});

describe('/getAllForUser', () => {
  test('returns all nogo groups for logged in user', () => {});
  test('throws UnauthorizedError when not logged in', () => {});
});

describe('/create', () => {
  test('successfully creates a new nogo group', () => {});
  test('throws BadRequestError when called with incorrect format', () => {});
  test('throws UnauthorizedError when not logged in', () => {});
});

describe('/update', () => {
  test("successfully updates a nogo group's name", () => {});
  test('throws UnauthorizedError if user does not own group', () => {});
  test('throws UnauthorizedError when not logged in', () => {});
});

describe('/delete', () => {
  test('successfully deletes a nogo group', () => {});
  test('throws UnauthorizedError if user does not own group', () => {});
  test('throws UnauthorizedError when not logged in', () => {});
});
