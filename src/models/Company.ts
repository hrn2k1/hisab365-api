import { Schema, model, Document } from 'mongoose';
import { randomUUID } from 'crypto';

export interface ICompanyProps {
    [key: string]: any;
}

export interface ICompany extends Document {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    phone: string;
    email: string;
    website?: string;
    logoUrl?: string;
    type: string | 'Mess' | 'Masjid' | 'Building';
    contactPerson: string;
    contactNumber: string;
    contactEmail: string;
    status?: 'active' | 'inactive' | 'pending';
    props?: ICompanyProps;
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
        addressLine1: {
            type: String,
            required: true,
        },
        addressLine2: {
            type: String,
            required: false,
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        website: {
            type: String,
            required: false,
        },
        logoUrl: {
            type: String,
            required: false,
        },
        type: {
            type: String,
            required: true,
        },
        contactPerson: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        contactEmail: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'pending',
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