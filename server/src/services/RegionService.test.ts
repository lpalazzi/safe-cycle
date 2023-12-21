import setupDB from 'test/setupDB';
import { container } from 'tsyringe';
import { RegionService } from 'services';
import { createTestUser, createTestRegion, createTestNogo } from 'test/data';
import { RegionModel } from 'models';

setupDB('RegionService');
const regionService = container.resolve(RegionService);

describe('isUserContributorOnRegion', () => {
  test('returns true if user is a contributor on the region', async () => {
    const user = await createTestUser();
    const region = await createTestRegion([user._id]);
    const userOwnsRegion = await regionService.isUserContributorOnRegion(
      user._id,
      region._id
    );
    expect(userOwnsRegion).toBe(true);
  });

  test('returns false if user is not a contributor on the region', async () => {
    const user = await createTestUser();
    const region = await createTestRegion();
    const userOwnsRegion = await regionService.isUserContributorOnRegion(
      user._id,
      region._id
    );
    expect(userOwnsRegion).toBe(false);
  });
});

describe('isLineStringInRegion', () => {
  test('returns true if the lineString is within the region', async () => {
    const region = await createTestRegion();
    const lineString: GeoJSON.LineString = {
      type: 'LineString',
      coordinates: [
        [-82.88413, 42.034199, 191],
        [-82.8857995, 42.0342715, 191.25],
        [-82.887471, 42.034342, 191.5],
      ],
    };
    const lineStringOnRegion = await regionService.isLineStringInRegion(
      lineString,
      region._id
    );
    expect(lineStringOnRegion).toBe(true);
  });

  test('returns false if the lineString is not within the region', async () => {
    const region = await createTestRegion();
    const lineString: GeoJSON.LineString = {
      type: 'LineString',
      coordinates: [
        [82.88413, -42.034199, 191],
        [82.8857995, -42.0342715, 191.25],
        [82.887471, -42.034342, 191.5],
      ],
    };
    const lineStringOnRegion = await regionService.isLineStringInRegion(
      lineString,
      region._id
    );
    expect(lineStringOnRegion).toBe(false);
  });
});

describe('addToNogoLength', () => {
  test("adds correct amount to a region's nogoLength field", async () => {
    const region = await createTestRegion();
    const updated = await regionService.addToNogoLength(region._id, 1000);
    expect(updated).toBe(true);
    const updatedRegion = await RegionModel.findById(region._id);
    expect(updatedRegion?.nogoLength).toBe(1000);
  });
});

describe('subtractFromNogoLength', () => {
  test("subtracts correct amount from a region's nogoLength field", async () => {
    const { _id: regionId } = await createTestRegion();
    await createTestNogo(undefined, regionId);
    const region = await RegionModel.findById(regionId);
    const expectedNogoLength = (region?.nogoLength || 0) - 1000;
    const updated = await regionService.subtractFromNogoLength(regionId, 1000);
    expect(updated).toBe(true);
    const updatedRegion = await RegionModel.findById(regionId);
    expect(updatedRegion?.nogoLength).toBe(expectedNogoLength);
  });
});
