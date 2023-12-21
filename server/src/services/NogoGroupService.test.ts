import setupDB from 'test/setupDB';
import { container } from 'tsyringe';
import { NogoGroupService } from 'services';
import { createTestUser, createTestNogoGroup, createTestNogo } from 'test/data';
import { NogoGroupModel } from 'models';

setupDB('NogoGroupService');
const nogoGroupService = container.resolve(NogoGroupService);

describe('doesUserOwnNogoGroup', () => {
  test('returns true if user owns group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup(user._id);
    const userOwnsNogoGroup = await nogoGroupService.doesUserOwnNogoGroup(
      user._id,
      nogoGroup._id
    );
    expect(userOwnsNogoGroup).toBe(true);
  });

  test('returns false if user does not own group', async () => {
    const user = await createTestUser();
    const nogoGroup = await createTestNogoGroup();
    const userOwnsNogoGroup = await nogoGroupService.doesUserOwnNogoGroup(
      user._id,
      nogoGroup._id
    );
    expect(userOwnsNogoGroup).toBe(false);
  });
});

describe('addToNogoLength', () => {
  test("adds correct amount to a nogo group's nogoLength field", async () => {
    const nogoGroup = await createTestNogoGroup();
    const updated = await nogoGroupService.addToNogoLength(nogoGroup._id, 1000);
    expect(updated).toBe(true);
    const updatedNogoGroup = await NogoGroupModel.findById(nogoGroup._id);
    expect(updatedNogoGroup?.nogoLength).toBe(1000);
  });
});

describe('subtractFromNogoLength', () => {
  test("subtracts correct amount from a nogo group's nogoLength field", async () => {
    const { _id: nogoGroupId } = await createTestNogoGroup();
    await createTestNogo(nogoGroupId, undefined);
    const nogoGroup = await NogoGroupModel.findById(nogoGroupId);
    const expectedNogoLength = (nogoGroup?.nogoLength || 0) - 1000;
    const updated = await nogoGroupService.subtractFromNogoLength(
      nogoGroupId,
      1000
    );
    expect(updated).toBe(true);
    const updatedNogoGroup = await NogoGroupModel.findById(nogoGroupId);
    expect(updatedNogoGroup?.nogoLength).toBe(expectedNogoLength);
  });
});
