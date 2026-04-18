import { Schema, model, Document } from 'mongoose';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

export interface IUserProps {
    address?: string;
    photo?: string;
    birthDate?: string;
    joiningDate?: String,
    bloodGroup?: string;
    [key: string]: any;
}

export interface IUser extends Document {
    name: string;
    contactNumber: string;
    email: string;
    password: string;
    type: 'user' | 'admin' | 'superadmin';
    companyId: string;
    gender?: String,
    divisionId?: number;
    districtId?: number;
    thanaId?: number | null;

    props: IUserProps;
    createdAt: Date;
    updatedAt?: Date;
    comparePassword(password: string): Promise<boolean>;
}

const userPropsSchema = new Schema({
    address: String,
    photo: String,
    birthDate: String,
    joiningDate: String,
    bloodGroup: String,
}, { strict: false, _id: false });

const userSchema = new Schema<IUser>(
    {
        _id: {
            type: String,
            default: () => randomUUID(),
        },
        name: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['user', 'admin', 'superadmin'],
            required: true,
        },
        companyId: {
            type: String,
            required: true
        },
        divisionId: {
            type: Number,
            required: false,
        },
        districtId: {
            type: Number,
            required: false,
        },
        thanaId: {
            type: Number,
            default: null,
        },
        gender: {
            type: String,
            required: true,
        },
        props: {
            type: userPropsSchema,
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
    }
);

// Pre-save middleware to hash password before saving
userSchema.pre<IUser>('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as any);
    }
});

// Method to compare password with hashed password
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export const User = model<IUser>('User', userSchema);
