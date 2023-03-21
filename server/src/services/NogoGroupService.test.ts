import { container } from 'tsyringe';
import { NogoGroupService } from 'services';
import { getTestUser } from 'test/data.user';
import { createTestNogoGroup } from 'test/data.nogoGroup';

const nogoGroupService = container.resolve(NogoGroupService);

describe('doesUserOwnNogoGroup', () => {
  test('returns true if user owns group', async () => {
    const user = await getTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const userOwnsNogoGroup = await nogoGroupService.doesUserOwnNogoGroup(
      user._id,
      nogoGroup._id
    );
    expect(userOwnsNogoGroup).toBe(true);
  });
  test('returns false if user does not own group', async () => {
    const user = await getTestUser();
    const nogoGroup = await createTestNogoGroup();
    const userOwnsNogoGroup = await nogoGroupService.doesUserOwnNogoGroup(
      user._id,
      nogoGroup._id
    );
    expect(userOwnsNogoGroup).toBe(false);
  });
});
