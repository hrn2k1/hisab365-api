import { User, IUser, IMembership } from '../models/User';

export class UserService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<IUser[]> {
    return User.find();
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  /**
   * Get user by email or contact number
   */
  async getUserByEmailOrContact(email: string, contactNumber: string): Promise<IUser | null> {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (contactNumber) {
      return User.findOne({
        $or: [
          { email: { $regex: `^${escapedEmail}$`, $options: 'i' } },
          { contactNumber },
        ],
      });
    } else {
      return User.findOne({ email: { $regex: `^${escapedEmail}$`, $options: 'i' } });
    }
  }

  /**
   * Get users by type (user or superadmin)
   */
  async getUsersByType(type: 'user' | 'superadmin'): Promise<IUser[]> {
    return User.find({ type });
  }

  /**
   * Get users by company membership
   */
  async getUsersByCompanyId(companyId: string): Promise<IUser[]> {
    return User.find({ 'memberships.companyId': companyId });
  }

  /**
   * Get users by location
   */
  async getUsersByLocation(divisionId: number, districtId?: number): Promise<IUser[]> {
    const query: any = { divisionId };
    if (districtId) {
      query.districtId = districtId;
    }
    return User.find(query);
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Update user
   */
  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, userData, { new: true });
  }

  /**
     * Partially update user fields using $set
     */
  async setUser(id: string, userData: Record<string, unknown>): Promise<IUser | null> {
    const fieldsToSet = Object.fromEntries(
      Object.entries(userData).filter(([, value]) => value !== undefined)
    );

    return User.findByIdAndUpdate(
      id,
      { $set: fieldsToSet },
      { new: true, runValidators: true }
    );
  }

  /**
   * Push a membership object into the user's memberships array
   */
  async addMembership(id: string, membership: IMembership): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { $push: { memberships: membership } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Edit an existing membership by companyId
   */
  async editMembership(
    id: string,
    companyId: string,
    membershipData: Partial<IMembership>
  ): Promise<IUser | null> {
    const fieldsToSet: Record<string, any> = {};

    if (membershipData.membershipType !== undefined) {
      fieldsToSet['memberships.$.membershipType'] = membershipData.membershipType;
    }
    if (membershipData.role !== undefined) {
      fieldsToSet['memberships.$.role'] = membershipData.role;
    }
    if (membershipData.joinedAt !== undefined) {
      fieldsToSet['memberships.$.joinedAt'] = membershipData.joinedAt;
    }
    if (membershipData.status !== undefined) {
      fieldsToSet['memberships.$.status'] = membershipData.status;
      fieldsToSet['memberships.$.statusDate'] = membershipData.statusDate ?? new Date();
    } else if (membershipData.statusDate !== undefined) {
      fieldsToSet['memberships.$.statusDate'] = membershipData.statusDate;
    }

    if (Object.keys(fieldsToSet).length === 0) {
      return User.findById(id);
    }

    return User.findOneAndUpdate(
      { _id: id, 'memberships.companyId': companyId },
      { $set: fieldsToSet },
      { new: true, runValidators: true }
    );
  }

  /**
 * Remove a membership from a user by companyId
 */
  async removeMembership(id: string, companyId: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { $pull: { memberships: { companyId } } },
      { new: true, runValidators: true }
    );
  }
  /**
   * Add or edit a membership by companyId. If membership exists, update it; otherwise, add new membership.
   */
  async addOrEditMembership(
    id: string,
    companyId: string,
    membershipData: Partial<IMembership>
  ): Promise<IUser | null> {
    // Try to update existing membership using positional $ operator
    const updateFields: Record<string, any> = {};
    if (membershipData.membershipType !== undefined) {
      updateFields['memberships.$.membershipType'] = membershipData.membershipType;
    }
    if (membershipData.role !== undefined) {
      updateFields['memberships.$.role'] = membershipData.role;
    }
    if (membershipData.joinedAt !== undefined) {
      updateFields['memberships.$.joinedAt'] = membershipData.joinedAt;
    }
    if (membershipData.status !== undefined) {
      updateFields['memberships.$.status'] = membershipData.status;
      updateFields['memberships.$.statusDate'] = membershipData.statusDate ?? new Date();
    } else if (membershipData.statusDate !== undefined) {
      updateFields['memberships.$.statusDate'] = membershipData.statusDate;
    }

    // Try update first
    const updatedUser = await User.findOneAndUpdate(
      { _id: id, 'memberships.companyId': companyId },
      Object.keys(updateFields).length > 0 ? { $set: updateFields } : {},
      { new: true, runValidators: true }
    );
    if (updatedUser) {
      return updatedUser;
    }

    // If not found, add new membership
    const newMembership: IMembership = {
      companyId,
      role: membershipData.role ?? 'user',
      status: membershipData.status ?? 'active',
      membershipType: membershipData.membershipType,
      joinedAt: membershipData.joinedAt ?? new Date(),
      statusDate: membershipData.statusDate ?? new Date(),
      // Add any other fields from IMembership as needed
    } as IMembership;
    return User.findByIdAndUpdate(
      id,
      { $push: { memberships: newMembership } },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<IUser | null> {
    return (await User.findByIdAndDelete(id)) as unknown as IUser | null;
  }

  /**
   * Get users by type and location
   */
  async getUsersByTypeAndLocation(type: string, divisionId?: number, districtId?: number): Promise<IUser[]> {
    const query: any = { type };
    if (divisionId) {
      query.divisionId = divisionId;
    }
    if (districtId) {
      query.districtId = districtId;
    }
    return User.find(query);
  }

  /**
   * Search users by name
   */
  async searchUsers(name: string): Promise<IUser[]> {
    return User.find({ name: { $regex: name, $options: 'i' } });
  }

  /**
   * Login user with email or contact number and password
   */
  async login(loginName: string, password: string): Promise<IUser | null> {
    // Find user by email or contact number
    const user = await User.findOne({
      $or: [
        { email: loginName },
        { contactNumber: loginName }
      ]
    });

    if (!user) {
      return null;
    }

    // Compare password using bcrypt
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<IUser | null> {
    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    // Verify old password
    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    return user.save();
  }
}
