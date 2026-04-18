import { Schema, model, Document } from 'mongoose';

export interface ICounter extends Document {
  _id: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>(
  {
    _id: {
      type: String,
      required: true,
    },
    sequence: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: false }
);

export const Counter = model<ICounter>('Counter', counterSchema);
