import { Location, ILocation } from '../models/Location';

export class LocationService {
  /**
   * Get all locations
   */
  async getAllLocations(): Promise<ILocation[]> {
    return Location.find().sort({ type: 1, name: 1 });
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
  async getDistrictsByDivision(divisionId: number): Promise<ILocation[]> {
    return Location.find({ parentId: divisionId, type: 'district' }).sort({ name: 1 });
  }

  /**
   * Get thanas by district ID
   */
  async getThanasByDistrict(districtId: number): Promise<ILocation[]> {
    return Location.find({ parentId: districtId, type: 'thana' }).sort({ name: 1 });
  }

  /**
   * Get areas by thana ID
   */
  async getAreasByThana(thanaId: number): Promise<ILocation[]> {
    return Location.find({ parentId: thanaId, type: 'area' }).sort({ name: 1 });
  }

  /**
   * Get locations by type
   */
  async getLocationsByType(type: 'division' | 'district' | 'thana' | 'area'): Promise<ILocation[]> {
    return Location.find({ type }).sort({ name: 1 });
  }

  /**
   * Get child locations
   */
  async getChildLocations(parentId: number): Promise<ILocation[]> {
    return Location.find({ parentId }).sort({ name: 1 });
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
  async searchLocations(name: string): Promise<ILocation[]> {
    return Location.find({ name: { $regex: name, $options: 'i' } }).sort({ name: 1 });
  }
}
