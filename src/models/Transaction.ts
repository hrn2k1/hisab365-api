import { Schema, Document } from 'mongoose';
import { randomUUID } from 'crypto';
import { getCompanyConnection } from '../config/database';

export interface ITransactionDetail {
    accountId: string | any;
    qty?: number;
    unit?: string;
    unitPrice?: number;
    drAmount: number;
    crAmount: number;
    balance?: number;
}

export interface ITransactionAttachment {
    id?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
}

export interface ITransactionActivityLog {
    timestamp: Date;
    userId: string | any;
    action: string;
    comment: string;
}
export interface IBillReference {
    transactionId: string;
    accountId: string;
    amount: number;
}

export interface ITransaction extends Document {
    date: Date;
    voucherNo: string;
    voucherType: string | 'CREDIT' | 'DEBIT' | 'JOURNAL';
    category: string;
    amount: number;
    description: string;
    transAccountId?: string;
    details: ITransactionDetail[];
    attachments: ITransactionAttachment[];
    status: string;
    createdBy: string;
    checkedBy?: string[];
    checked?: boolean;
    checkedAt?: Date;
    approvedBy?: string[];
    approved?: boolean;
    approvedAt?: Date;
    props: Record<string, any>;
    activityLog: ITransactionActivityLog[];
    referencedBills?: IBillReference[];
    createdAt: Date;
    updatedAt?: Date;
}

const transactionDetailSchema = new Schema<ITransactionDetail>({
    // accountId: { type: String, required: true },
    accountId: {
        type: String,
        ref: "Account",   // <-- this tells Mongoose the collection/model
        required: true
    },
    qty: { type: Number, required: false },
    unit: { type: String, required: false },
    unitPrice: { type: Number, required: false },
    drAmount: { type: Number, required: true },
    crAmount: { type: Number, required: true },
    balance: { type: Number, required: false },
}, { _id: false });

const transactionAttachmentSchema = new Schema<ITransactionAttachment>({
    id: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: false },
    url: { type: String, required: true },
}, { _id: false });

const transactionActivityLogSchema = new Schema<ITransactionActivityLog>({
    timestamp: { type: Date, required: true },
    userId: { type: String, required: true, ref: "User" },
    action: { type: String, required: true },
    comment: { type: String, required: false },
}, { _id: false });

const transactionSchema = new Schema<ITransaction>(
    {
        _id: {
            type: String,
            default: () => randomUUID(),
        },
        date: {
            type: Date,
            required: true,
        },
        voucherNo: {
            type: String,
            required: true,
        },
        voucherType: {
            type: String,
            enum: ['CREDIT', 'DEBIT', 'JOURNAL'],
            required: true,
        },
        category: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        transAccountId: {
            type: String,
            ref: "Account",   // <-- this tells Mongoose the collection/model
            required: false
        },
        description: {
            type: String,
            required: false,
        },
        details: {
            type: [transactionDetailSchema],
            required: true,
        },
        attachments: {
            type: [transactionAttachmentSchema],
            default: [],
        },
        status: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String,
            ref: "User",   // <-- this tells Mongoose the collection/model
            required: true,
        },
        checkedBy: {
            type: [String],
            ref: "User",   // <-- this tells Mongoose the collection/model
            default: [],
        },
        checked: {
            type: Boolean,
            default: false,
        },
        checkedAt: {
            type: Date,
            default: null,
        },
        approvedBy: {
            type: [String],
            ref: "User",   // <-- this tells Mongoose the collection/model
            default: [],
        },
        approved: {
            type: Boolean,
            default: false,
        },
        approvedAt: {
            type: Date,
            default: null,
        },
        props: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },
        activityLog: {
            type: [transactionActivityLogSchema],
            default: [],
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
    return companyDb.model<ITransaction>('Transaction', transactionSchema);
};