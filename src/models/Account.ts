import { Schema, model, Document } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IAccount extends Document {
  _id: string;
  name: string;
  openingBalance: number;
  currentBalance: number;
  type: 'Asset' | 'Cash' | 'Bank' | 'Supplier' | 'Customer' | 'Income' | 'Expense';
  props?: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
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
      default: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense'],
      required: true,
    },
    props: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
accountSchema.index({ type: 1 });
accountSchema.index({ name: 1 });

export default model<IAccount>('Account', accountSchema);
