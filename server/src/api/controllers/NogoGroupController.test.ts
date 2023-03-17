describe('/getAll', () => {
  test('returns all nogo groups in db when requested by admin', () => {});
  test('throws UnauthorizedError when requested by normal user', () => {});
  test('throws UnauthorizedError when not logged in', () => {});
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
