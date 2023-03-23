import { useServer } from 'test/server';
import { makeRequest } from 'test/helpers';
import { getTestUser, createTestNogoGroup } from 'test/data';
import { INogoGroupCreateDTO, INogoGroupReturnDTO } from 'interfaces';

useServer();

describe('/getAll', () => {
  test('returns all nogo groups in db when requested by admin', async () => {
    await createTestNogoGroup();
    await createTestNogoGroup();
    const user = await getTestUser('admin');
    await makeRequest({
      url: '/nogoGroup/getAll',
      method: 'GET',
      loggedInUserEmail: user.email,
    })
      .then((res) => {
        expect(res.data?.nogoGroups?.length).toBe(2);
      })
      .catch((err) => {
        throw new Error(
          `${err.response.status} Error: ${err.response.data.message}`
        );
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
        throw new Error('Expected UnauthorizedError to be thrown');
      })
      .catch((err) => {
        if (err.response) {
          expect(err.response.status).toBe(401);
        } else {
          throw new Error(
            `${err.response.status} Error: ${err.response.data.message}`
          );
        }
      });
  });

  test('throws UnauthorizedError when not logged in', async () => {
    await makeRequest({
      url: '/nogoGroup/getAll',
      method: 'GET',
    })
      .then((res) => {
        throw new Error('Expected UnauthorizedError to be thrown');
      })
      .catch((err) => {
        if (err.response) {
          expect(err.response.status).toBe(401);
        } else {
          throw new Error(
            `${err.response.status} Error: ${err.response.data.message}`
          );
        }
      });
  });
});

describe('/getAllForUser', () => {
  test('returns all nogo groups for logged in user', async () => {
    const user = await getTestUser();
    await createTestNogoGroup(user._id);
    await createTestNogoGroup(user._id);
    await createTestNogoGroup();
    await makeRequest({
      url: '/nogoGroup/getAllForUser',
      method: 'GET',
      loggedInUserEmail: user.email,
    })
      .then((res) => {
        expect(res.data?.nogoGroups?.length).toBeGreaterThanOrEqual(2);
      })
      .catch((err) => {
        throw new Error(
          `${err.response.status} Error: ${err.response.data.message}`
        );
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
          throw new Error(
            `${err.response.status} Error: ${err.response.data.message}`
          );
        }
      });
  });
});

describe('/create', () => {
  test('successfully creates a new nogo group', async () => {
    const user = await getTestUser();
    const nogoGroup: INogoGroupCreateDTO = {
      name: 'Nogo Group',
    };
    await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
      loggedInUserEmail: user.email,
    })
      .then((res) => {
        const nogoGroup = res.data.nogoGroup as INogoGroupReturnDTO;
        expect(nogoGroup?._id).toBeTruthy();
        expect(nogoGroup?.name).toBe('Nogo Group');
      })
      .catch((err) => {
        throw new Error(
          `${err.response.status} Error: ${err.response.data.message}`
        );
      });
  });

  test('throws BadRequestError when called with incorrect format', async () => {
    const user = await getTestUser();
    const nogoGroup = {
      notTheNameProperty: 'Nogo Group',
    };
    await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
      loggedInUserEmail: user.email,
    })
      .then((res) => {
        throw new Error('Expected BadRequestError to be thrown');
      })
      .catch((err) => {
        if (err.response) {
          expect(err.response.status).toBe(400);
        } else {
          throw new Error(
            `${err.response.status} Error: ${err.response.data.message}`
          );
        }
      });
  });

  test('throws UnauthorizedError when not logged in', async () => {
    const user = await getTestUser();
    const nogoGroup = {
      name: 'Nogo Group',
    };
    await makeRequest({
      url: '/nogoGroup/create',
      method: 'POST',
      data: { nogoGroup },
    })
      .then((res) => {
        throw new Error('Expected UnauthorizedError to be thrown');
      })
      .catch((err) => {
        if (err.response) {
          expect(err.response.status).toBe(401);
        } else {
          throw new Error(
            `${err.response.status} Error: ${err.response.data.message}`
          );
        }
      });
  });
});

describe('/update', () => {
  test("successfully updates a nogo group's name", async () => {});
  test('throws UnauthorizedError if user does not own group', async () => {});
  test('throws UnauthorizedError when not logged in', async () => {});
});

describe('/delete', () => {
  test('successfully deletes a nogo group', async () => {});
  test('throws UnauthorizedError if user does not own group', async () => {});
  test('throws UnauthorizedError when not logged in', async () => {});
});
