import { Schema, model } from 'mongoose';

export type UserRole = 'admin' | 'user';

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const User = model<IUser>('User', UserSchema);


