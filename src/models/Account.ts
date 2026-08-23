import { Schema, Document } from 'mongoose';
import { randomUUID } from 'crypto';
import { getCompanyConnection } from '../config/database';

export interface IAccount extends Document {
  _id: string;
  number?: string;
  name: string;
  openingBalance: number;
  openingQty?: number;
  openingBalanceDate?: Date;
  currentBalance: number;
  currentQty: number;
  remarks?: string;
  type: string;
  status?: string;
  props?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

const accountSchema = new Schema<IAccount>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    number: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    openingQty: {
      type: Number,
      required: false,
      default: 0,
    },
    openingBalanceDate: {
      type: Date,
    },
    currentBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currentQty: {
      type: Number,
      required: true,
      default: 0,
    },
    remarks: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    props: {
      type: Schema.Types.Mixed,
      default: {},
    },
    userId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'active',
    },
  },
  {
    // Allow unknown top-level keys, matching [key: string]: any in IAccount.
    strict: false,
    timestamps: true,
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
    versionKey: false,
  }
);

// Indexes
accountSchema.index({ type: 1 });
accountSchema.index({ name: 1 });

export default (companyId: string) => {
  const companyDb = getCompanyConnection(companyId);
  return companyDb.model<IAccount>('Account', accountSchema);
};
