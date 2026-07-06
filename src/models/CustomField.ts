import { randomUUID } from 'crypto';
import { Schema, model, Document } from 'mongoose';

export interface ICustomField extends Document {
    _id: string;
    name: string;
    label?: string;
    type: string | "TEXT" | "NUMBER" | "CHECKBOX" | "DATE" | "SELECT" | "HIDDEN";
    options?: any[];
    entity: string | "Company" | "User" | "Account" | "Transaction";
    companyId?: string;
}

const customFieldSchema = new Schema<ICustomField>(
    {
        _id: {
            type: String,
            default: () => randomUUID(),
        },
        name: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: true,
        },
        options: {
            type: [Schema.Types.Mixed],
            default: [],
        },
        entity: {
            type: String,
            required: true,
        },
        companyId: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: false,
        versionKey: false,
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                return ret;
            },
        },
        toObject: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                return ret;
            },
        },
    }
);

export const CustomField = model<ICustomField>('CustomField', customFieldSchema);