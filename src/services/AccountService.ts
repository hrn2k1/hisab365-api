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
   * Get accounts by types
   */
  async getAccountsByTypes(types: string[]): Promise<IAccount[]> {
    return await this.accountModel.find({ type: { $in: types } }).sort({ createdAt: -1 });
  }

  /**
   * Create new account
   */
  async createAccount(data: Partial<IAccount>): Promise<IAccount> {
    if (data.type === 'CUSTOMER' || data.type === 'SUPPLIER' || data.type === 'MEMBER') {
      if (data.props?.CONTACT_NUMBER) {
        const accounts = await this.accountModel.find({ type: data.type, 'props.CONTACT_NUMBER': data.props?.CONTACT_NUMBER });
        if (accounts.length > 0) {
          throw new Error(`An account of type ${data.type} with the same contact number already exists.`);
        }
      }
      if (data.props?.CONTACT_EMAIL) {
        const accounts = await this.accountModel.find({ type: data.type, 'props.CONTACT_EMAIL': data.props?.CONTACT_EMAIL });
        if (accounts.length > 0) {
          throw new Error(`An account of type ${data.type} with the same contact email already exists.`);
        }
      }
    }
    const account = new this.accountModel(data);
    return await account.save();
  }

  /**
   * Update account
   */
  async updateAccount(id: string, data: Partial<IAccount>): Promise<IAccount | null> {
    if (data.type === 'CUSTOMER' || data.type === 'SUPPLIER' || data.type === 'MEMBER') {
      if (data.props?.CONTACT_NUMBER) {
        const accounts = await this.accountModel.find({ type: data.type, _id: { $ne: id }, 'props.CONTACT_NUMBER': data.props?.CONTACT_NUMBER });
        if (accounts.length > 0) {
          throw new Error(`An account of type ${data.type} with the same contact number already exists.`);
        }
      }
      if (data.props?.CONTACT_EMAIL) {
        const accounts = await this.accountModel.find({ type: data.type, _id: { $ne: id }, 'props.CONTACT_EMAIL': data.props?.CONTACT_EMAIL });
        if (accounts.length > 0) {
          throw new Error(`An account of type ${data.type} with the same contact email already exists.`);
        }
      }
    }
    return await this.accountModel.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Set specific account fields without replacing the whole document
   */
  async setAccount(id: string, accountData: Partial<IAccount>): Promise<IAccount | null> {
    if (accountData.type === 'CUSTOMER' || accountData.type === 'SUPPLIER' || accountData.type === 'MEMBER') {
      if (accountData.props?.CONTACT_NUMBER) {
        const accounts = await this.accountModel.find({ type: accountData.type, _id: { $ne: id }, 'props.CONTACT_NUMBER': accountData.props?.CONTACT_NUMBER });
        if (accounts.length > 0) {
          throw new Error(`An account of type ${accountData.type} with the same contact number already exists.`);
        }
      }
      if (accountData.props?.CONTACT_EMAIL) {
        const accounts = await this.accountModel.find({ type: accountData.type, _id: { $ne: id }, 'props.CONTACT_EMAIL': accountData.props?.CONTACT_EMAIL });
        if (accounts.length > 0) {
          throw new Error(`An account of type ${accountData.type} with the same contact email already exists.`);
        }
      }
    }
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
