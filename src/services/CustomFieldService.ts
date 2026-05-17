import { CustomField, ICustomField } from '../models/CustomField';

export class CustomFieldService {
    async getAllCustomFields(): Promise<ICustomField[]> {
        return CustomField.find();
    }

    async getCustomFieldById(id: string): Promise<ICustomField | null> {
        return CustomField.findById(id);
    }

    async getAllCustomFieldsByEntity(entity: string): Promise<ICustomField[]> {
        return CustomField.find({ entity });
    }

    async createCustomField(data: Partial<ICustomField>): Promise<ICustomField> {
        const customField = new CustomField(data);
        return customField.save();
    }

    async updateCustomField(id: string, data: Partial<ICustomField>): Promise<ICustomField | null> {
        return CustomField.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCustomField(id: string): Promise<ICustomField | null> {
        return CustomField.findByIdAndDelete(id);
    }
}
