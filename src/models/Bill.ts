import { randomUUID } from "crypto";
import { Schema, Document } from 'mongoose';
import { getCompanyConnection } from "../config/database";

export interface IBillAdjustment {
    transactionId: string;
    billAccountId: string;
    billForAccountId: string;
    amount: number;
}
export interface IBill extends Document {
    transactionId: string;
    billAccountId: string | any;
    billForAccountId: string | any;
    amount: number;
    balance?: number;
    billAdjustments?: IBillAdjustment[];
    createdAt: Date;
    updatedAt?: Date;
}

const billAdjustmentSchema = new Schema<IBillAdjustment>({
    // transactionId: { type: String, required: true},
    transactionId: {
        type: String,
        ref: "Transaction",   // <-- this tells Mongoose the collection/model
        required: true
    },
    billAccountId: {
        type: String,
        ref: "Account",
        required: true
    },
    billForAccountId: {
        type: String,
        ref: "Account",
        required: true
    },
    amount: { type: Number, required: true }
}, { _id: false });

const billSchema = new Schema<IBill>(
    {
        _id: {
            type: String,
            default: () => randomUUID(),
        },
        // transactionId: { type: String, required: true},
        transactionId: {
            type: String,
            ref: "Transaction",   // <-- this tells Mongoose the collection/model
            required: true
        },
        // billAccountId: { type: String, required: true },
        billAccountId: {
            type: String,
            ref: "Account",   // <-- this tells Mongoose the collection/model
            required: true
        },
        // billForAccountId: { type: String, required: true },
        billForAccountId: {
            type: String,
            ref: "Account",   // <-- this tells Mongoose the collection/model
            required: true
        },
        amount: { type: Number, required: true },
        balance: { type: Number, required: false },
        billAdjustments: {
            type: [billAdjustmentSchema],
            required: true,
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

export default (companyId: string) => {
    const companyDb = getCompanyConnection(companyId);
    return companyDb.model<IBill>('Bill', billSchema);
};