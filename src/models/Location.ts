import { Schema, model, Document } from 'mongoose';
import { Counter } from './Counter';

export interface ILocation extends Document {
  _id?: number;
  parentId?: number | null;
  type: 'division' | 'district' | 'thana' | 'area';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>(
  {
    _id: {
      type: Number,
      required: false,
    },
    parentId: {
      type: Number,
      default: null,
    },
    type: {
      type: String,
      enum: ['division', 'district', 'thana', 'area'],
      required: true,
    },
    name: {
      type: String,
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
  }
);

// Pre-save hook to auto-increment _id
locationSchema.pre('save', async function (next) {
  // Only assign new ID if this is a new document and _id is not set
  if (this.isNew && !this._id) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'location',
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );
      this._id = counter.sequence;
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const Location = model<ILocation>('Location', locationSchema);
