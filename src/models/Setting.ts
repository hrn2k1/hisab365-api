import { Schema, model, Document } from 'mongoose';

export interface OrganizationType {
    label: string;
    color?: string;
}

export interface AccountType {
    label: string;
    color?: string;
    nature?: 1 | -1;
    lockInAccounts?: boolean;
}

export interface VoucherType {
    label: string;
    short?: string;
    color?: string;
    voucherNoPrefix?: string;
}

export interface VoucherStatus {
    label: string;
    color?: string;
}

export interface ISetting extends Document {
    _id: string;
    organizationTypes: OrganizationType | Record<string, any>;
    accountTypes: AccountType | Record<string, any>;
    voucherTypes: VoucherType | Record<string, any>;
    voucherStatuses: VoucherStatus | Record<string, any>;
}

const settingSchema = new Schema<ISetting>(
    {
        _id: {
            type: String,
            required: true,
        },
        organizationTypes: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },
        accountTypes: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },
        voucherTypes: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },
        voucherStatuses: {
            type: Map,
            of: Schema.Types.Mixed,
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
        toObject: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                return ret;
            },
        },
    }
);

export const Setting = model<ISetting>('Setting', settingSchema);