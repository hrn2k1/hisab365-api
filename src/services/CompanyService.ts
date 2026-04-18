import { Company, ICompany } from '../models/Company';

export class CompanyService {
  /**
   * Get all companies
   */
  async getAllCompanies(): Promise<ICompany[]> {
    return Company.find();
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string): Promise<ICompany | null> {
    return Company.findById(id);
  }

  /**
   * Get company by email
   */
  async getCompanyByEmail(email: string): Promise<ICompany | null> {
    return Company.findOne({ email });
  }

  /**
   * Create a new company
   */
  async createCompany(companyData: Partial<ICompany>): Promise<ICompany> {
    const company = new Company(companyData);
    return company.save();
  }

  /**
   * Update company
   */
  async updateCompany(id: string, companyData: Partial<ICompany>): Promise<ICompany | null> {
    return Company.findByIdAndUpdate(id, companyData, { new: true });
  }

  /**
   * Delete company
   */
  async deleteCompany(id: string): Promise<ICompany | null> {
    return (await Company.findByIdAndDelete(id)) as unknown as ICompany | null;
  }

  /**
   * Search companies by name
   */
  async searchCompanies(name: string): Promise<ICompany[]> {
    return Company.find({ name: { $regex: name, $options: 'i' } });
  }

  /**
   * Get companies by business type
   */
  async getCompaniesByBusinessType(businessType: string): Promise<ICompany[]> {
    return Company.find({ businessType });
  }
}