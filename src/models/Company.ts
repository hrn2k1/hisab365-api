import { Schema, model, Document } from 'mongoose';
import { randomUUID } from 'crypto';

export interface ICompanyProps {
    [key: string]: any;
}

export interface ICompany extends Document {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    logoUrl?: string;
    businessType: string;
    props: ICompanyProps;
    createdAt: Date;
    updatedAt?: Date;
}

const companyPropsSchema = new Schema({
    foundedYear: Number,
    numberOfEmployees: Number,
}, { strict: false, _id: false });

const companySchema = new Schema<ICompany>(
    {
        _id: {
            type: String,
            default: () => randomUUID(),
        },
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        website: {
            type: String,
            required: false,
        },
        logoUrl: {
            type: String,
            required: false,
        },
        businessType: {
            type: String,
            required: true,
        },
        props: {
            type: companyPropsSchema,
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                return ret;
            },
        },
    }
);

export const Company = model<ICompany>('Company', companySchema);