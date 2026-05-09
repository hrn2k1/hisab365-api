import { Model } from 'mongoose';
import Account, { IAccount } from '../models/Account';

export class AccountService {
  private accountModel: Model<IAccount>;

  constructor(companyId: string) {
    this.accountModel = Account(companyId);
  }

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<IAccount[]> {
    return await this.accountModel.find().sort({ createdAt: -1 });
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: string): Promise<IAccount | null> {
    return await this.accountModel.findById(id);
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(type: string): Promise<IAccount[]> {
    return await this.accountModel.find({ type }).sort({ createdAt: -1 });
  }

  /**
   * Create new account
   */
  async createAccount(data: Partial<IAccount>): Promise<IAccount> {
    const account = new this.accountModel(data);
    return await account.save();
  }

  /**
   * Update account
   */
  async updateAccount(id: string, data: Partial<IAccount>): Promise<IAccount | null> {
    return await this.accountModel.findByIdAndUpdate(id, data, { new: true });
  }

    /**
     * Set specific account fields without replacing the whole document
     */
    async setAccount(id: string, accountData: Partial<IAccount>): Promise<IAccount | null> {
      const fieldsToSet = Object.fromEntries(
        Object.entries(accountData).filter(([, value]) => value !== undefined)
      );
  
      return this.accountModel.findByIdAndUpdate(
        id,
        { $set: fieldsToSet },
        { new: true, runValidators: true }
      );
    }

  /**
   * Delete account
   */
  async deleteAccount(id: string): Promise<boolean> {
    const result = await this.accountModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Update account balance
   */
  async updateBalance(id: string, amount: number): Promise<IAccount | null> {
    const account = await this.getAccountById(id);
    if (!account) return null;

    account.currentBalance += amount;
    return await account.save();
  }

  /**
   * Search accounts by name
   */
  async searchAccounts(query: string): Promise<IAccount[]> {
    return await this.accountModel.find({
      name: { $regex: query, $options: 'i' },
    }).sort({ createdAt: -1 });
  }

  /**
   * Get accounts by type with optional name filter
   */
  async getAccountsByTypeAndName(type: string, nameQuery?: string): Promise<IAccount[]> {
    const filter: any = { type };
    if (nameQuery) {
      filter.name = { $regex: nameQuery, $options: 'i' };
    }
    return await this.accountModel.find(filter).sort({ createdAt: -1 });
  }
}
