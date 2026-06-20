import { Schema, model, Document } from 'mongoose';

export interface ISetting extends Document {
    _id: string;
    organizationTypes: { [key: string]: string | { label: string } & Record<string, any> };
    accountTypes: { [key: string]: string | { label: string } & Record<string, any> };
    voucherTypes: { [key: string]: string | { label: string } & Record<string, any> };
    voucherStatuses: { [key: string]: string | { label: string } & Record<string, any> };
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