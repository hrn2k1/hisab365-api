import e from 'express';
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

  async addUserToCompany(companyId: string, userData: Partial<IUser>, membershipData: Partial<IMembership>): Promise<IUser | null> {
    // 1. Check if user exists by email or contactNumber
    let user: IUser | null = null;
    if (userData.email || userData.contactNumber) {
      user = await this.getUserByEmailOrContact(userData.email ?? '', userData.contactNumber ?? '');
    }

    // 2. If user does not exist, create user
    if (!user) {
      user = await this.createUser(userData);
    }

    if (!user) {
      // Could not create or find user
      return null;
    }

    // 3. Check if membership for this company already exists
    const existingMembership = user.memberships?.find(m => m.companyId === companyId);

    if (existingMembership) {
      // 4. If membership exists, update it
      await this.editMembership(user._id.toString(), companyId,
        {
          ...membershipData,
          statusDate: membershipData.statusDate ?? new Date()
        });
    } else {
      // 5. If not, add new membership
      const newMembership: IMembership = {
        companyId,
        role: membershipData.role ?? 'user',
        status: membershipData.status ?? 'active',
        membershipType: membershipData.membershipType ?? 'general',
        joinedAt: membershipData.joinedAt ?? new Date(),
        statusDate: membershipData.statusDate ?? new Date()
      } as IMembership;
      await this.addMembership(user._id.toString(), newMembership);
    }

    // 6. Return the updated user
    return this.getUserById(user._id.toString());
  }

  async editUserInCompany(companyId: string, userId: string, userData: Partial<IUser>, membershipData: Partial<IMembership>): Promise<IUser | null> {
    // 1. Check if user exists by email or contactNumber
    let user: IUser | null = null;
    if (userData.email || userData.contactNumber) {
      user = await this.getUserByEmailOrContact(userData.email ?? '', userData.contactNumber ?? '');
    }

    // 2. If user exists and it's not the same user being edited, throw an error
    if (user && user._id.toString() !== userId) {
      throw new Error('User with the provided email or contact number already exists.');
    }
    user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    await this.setUser(userId, userData);

    // 3. Check if membership for this company already exists
    const existingMembership = user.memberships?.find(m => m.companyId === companyId);

    if (existingMembership) {
      // 4. If membership exists, update it
      await this.editMembership(user._id.toString(), companyId,
        {
          ...membershipData,
          statusDate: membershipData.statusDate ?? new Date()
        });
    } else {
      // 5. If not, add new membership
      const newMembership: IMembership = {
        companyId,
        role: membershipData.role ?? 'user',
        status: membershipData.status ?? 'active',
        membershipType: membershipData.membershipType ?? 'general',
        joinedAt: membershipData.joinedAt ?? new Date(),
        statusDate: membershipData.statusDate ?? new Date()
      } as IMembership;
      await this.addMembership(user._id.toString(), newMembership);
    }

    // 6. Return the updated user
    return this.getUserById(user._id.toString());
  }

  /**
   * Remove a user's membership for a specific company
  */
  async removeUserFromCompany(userId: string, companyId: string): Promise<IUser | null> {
    // Check if user has membership with the company
    const user = await this.getUserById(userId);
    if (!user || !user.memberships?.some(m => m.companyId === companyId)) {
      // User not found or no such membership
      return user;
    }
    // Remove the membership
    return this.removeMembership(userId, companyId);
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
   * Search users by name, email, or contact number (OR logic)
   * Returns users and matched criteria string
   */
  async searchUsers(name?: string, email?: string, contactNumber?: string, companyId?: string): Promise<IUser[] | any[]> {
    // Helper to escape regex special characters
    function escapeRegex(str: string) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const or: any[] = [];
    if (name) {
      or.push({ name: { $regex: escapeRegex(name), $options: 'i' } });
    }
    if (email) {
      or.push({ email: { $regex: '^' + escapeRegex(email) + '$', $options: 'i' } });
    }
    if (contactNumber) {
      or.push({ contactNumber: { $regex: escapeRegex(contactNumber), $options: 'i' } });
    }
    const query = or.length > 0 ? { $or: or } : {};
    const users = await User.find(query);

    const usersWithCriteria = users.map(user => {
      let matchedCriteria = '';
      if (email && user.email?.toLowerCase() === email.toLowerCase() && contactNumber && user.contactNumber?.toLowerCase() === contactNumber.toLowerCase()) {
        matchedCriteria = 'email, contactNumber';
      } else if (email && user.email?.toLowerCase() === email.toLowerCase()) {
        matchedCriteria = 'email';
      } else if (contactNumber && user.contactNumber?.toLowerCase() === contactNumber.toLowerCase()) {
        matchedCriteria = 'contactNumber';
      } else if (name && user.name?.toLowerCase().includes(name.toLowerCase())) {
        matchedCriteria = 'name';
      }
      const membershipIndex = user.memberships?.findIndex(m => m.companyId === companyId);
      return { ...user.toObject(), password: undefined, matchedCriteria, isCompanyUser: membershipIndex !== undefined && membershipIndex !== -1 };
    });

    return usersWithCriteria;
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
