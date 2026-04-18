import Account, { IAccount } from '../models/Account';

export class AccountService {
  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<IAccount[]> {
    return await Account.find().sort({ createdAt: -1 });
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: string): Promise<IAccount | null> {
    return await Account.findById(id);
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(type: string): Promise<IAccount[]> {
    return await Account.find({ type }).sort({ createdAt: -1 });
  }

  /**
   * Create new account
   */
  async createAccount(data: Partial<IAccount>): Promise<IAccount> {
    const account = new Account(data);
    return await account.save();
  }

  /**
   * Update account
   */
  async updateAccount(id: string, data: Partial<IAccount>): Promise<IAccount | null> {
    return await Account.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Delete account
   */
  async deleteAccount(id: string): Promise<boolean> {
    const result = await Account.deleteOne({ _id: id });
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
    return await Account.find({
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
    return await Account.find(filter).sort({ createdAt: -1 });
  }
}
