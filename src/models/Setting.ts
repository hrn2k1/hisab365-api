import { Schema, model, Document } from 'mongoose';

export interface ISetting extends Document {
    _id: string;
    organizationTypes: { [key: string]: string };
}

const settingSchema = new Schema<ISetting>(
    {
        _id: {
            type: String,
            required: true,
        },
        organizationTypes: {
            type: Map,
            of: String,
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