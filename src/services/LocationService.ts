import { Location, ILocation } from '../models/Location';
import { LocationDto } from '../types/LocationDto';


export class LocationService {
  private async getLocationsWithParentName(
    match: Record<string, unknown>,
    sort: Record<string, 1 | -1>
  ): Promise<LocationDto[]> {
    const locations = await Location.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: 'locations',
          localField: 'parentId',
          foreignField: '_id',
          as: 'parent',
        },
      },
      {
        $addFields: {
          parentName: {
            $ifNull: [{ $arrayElemAt: ['$parent.name', 0] }, null],
          },
        },
      },
      {
        $project: {
          parent: 0,
        },
      },
      {
        $sort: sort,
      },
    ]);

    return locations.map(location => ({ ...location, id: location._id, _id: undefined } as LocationDto));
  }

  /**
   * Get all locations
   */
  async getAllLocations(): Promise<LocationDto[]> {
    return this.getLocationsWithParentName({}, { type: 1, name: 1 });
  }

  /**
   * Get location by ID
   */
  async getLocationById(id: string): Promise<ILocation | null> {
    return Location.findById(id);
  }

  /**
   * Get all divisions
   */
  async getDivisions(): Promise<ILocation[]> {
    return Location.find({ type: 'division' }).sort({ name: 1 });
  }

  /**
   * Get districts by division ID
   */
  async getDistrictsByDivision(divisionId: number): Promise<LocationDto[]> {
    return this.getLocationsWithParentName({ parentId: divisionId, type: 'district' }, { name: 1 });
  }

  /**
   * Get thanas by district ID
   */
  async getThanasByDistrict(districtId: number): Promise<LocationDto[]> {
    return this.getLocationsWithParentName({ parentId: districtId, type: 'thana' }, { name: 1 });
  }

  /**
   * Get areas by thana ID
   */
  async getAreasByThana(thanaId: number): Promise<LocationDto[]> {
    return this.getLocationsWithParentName({ parentId: thanaId, type: 'area' }, { name: 1 });
  }

  /**
   * Get locations by type
   */
  async getLocationsByType(type: 'division' | 'district' | 'thana' | 'area'): Promise<LocationDto[]> {
    return this.getLocationsWithParentName({ type }, { name: 1 });
  }

  /**
   * Get child locations
   */
  async getChildLocations(parentId: number): Promise<LocationDto[]> {
    return this.getLocationsWithParentName({ parentId }, { name: 1 });
  }

  /**
   * Create a new location
   */
  async createLocation(locationData: Partial<ILocation>): Promise<ILocation> {
    const location = new Location(locationData);
    return location.save();
  }

  /**
   * Update location
   */
  async updateLocation(id: string, locationData: Partial<ILocation>): Promise<ILocation | null> {
    return Location.findByIdAndUpdate(id, locationData, { new: true });
  }

  /**
   * Delete location
   */
  async deleteLocation(id: string): Promise<ILocation | null> {
    return (await Location.findByIdAndDelete(id)) as unknown as ILocation | null;
  }

  /**
   * Search locations by name
   */
  async searchLocations(name: string): Promise<LocationDto[]> {
    return this.getLocationsWithParentName({ name: { $regex: name, $options: 'i' } }, { name: 1 });
  }
}
