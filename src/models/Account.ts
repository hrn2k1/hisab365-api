import { Schema, Document } from 'mongoose';
import { randomUUID } from 'crypto';
import { getCompanyConnection } from '../config/database';

export interface IAccount extends Document {
  _id: string;
  name: string;
  openingBalance: number;
  currentBalance: number;
  remarks?: string;
  type: string;
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
    name: {
      type: String,
      required: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    currentBalance: {
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
