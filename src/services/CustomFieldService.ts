import { Model } from 'mongoose';
import { CustomField, customFieldSchema, ICustomField } from '../models/CustomField';
import { getCompanyConnection } from '../config/database';

export class CustomFieldService {
    private customFieldModel?: Model<ICustomField> | null = null;

    constructor(loggedInUser?: any) {
        if (loggedInUser?.type?.toLowerCase() === 'superadmin') {
            const companyId = loggedInUser?.loggedInCompanyId;
            if (companyId) {
                const companyDb = getCompanyConnection(companyId);
                this.customFieldModel = companyDb.model<ICustomField>('CustomField', customFieldSchema);
            }
        }
    }

    async getAllCustomFields(): Promise<ICustomField[]> {
        const systemFields = CustomField.find();
        const companyFields = this.customFieldModel?.find();
        return [...await systemFields, ...(await companyFields || [])];
    }

    async getCustomFieldById(id: string): Promise<ICustomField | null> {
        const systemField = await CustomField.findById(id);
        if (systemField)
            return systemField;
        const companyField = await this.customFieldModel?.findById(id);
        return companyField || null;
    }

    async getAllCustomFieldsByEntity(entity: string): Promise<ICustomField[]> {
        const systemFields = CustomField.find({ entity: { $regex: `^${entity}`, $options: 'i' } });
        const companyFields = this.customFieldModel?.find({ entity: { $regex: `^${entity}`, $options: 'i' } });
        return [...await systemFields, ...(await companyFields || [])];
    }

    async createCustomField(data: Partial<ICustomField>): Promise<ICustomField> {
        if (!this.customFieldModel) {
            const customField = new CustomField(data);
            return customField.save();
        } else {
            const customField = new this.customFieldModel(data);
            return customField.save();
        }
    }

    async updateCustomField(id: string, data: Partial<ICustomField>): Promise<ICustomField | null> {
        if (!this.customFieldModel) {
            return CustomField.findByIdAndUpdate(id, data, { new: true });
        } else {
            return this.customFieldModel.findByIdAndUpdate(id, data, { new: true });
        }
    }

    async deleteCustomField(id: string): Promise<ICustomField | null> {
        if (!this.customFieldModel) {
            return CustomField.findByIdAndDelete(id);
        } else {
            return this.customFieldModel.findByIdAndDelete(id);
        }
    }
}
