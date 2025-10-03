import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the possible roles for a user
export type UserRole = 'admin' | 'user' | 'trackable';

// Interface representing a User document in MongoDB
export interface IUser extends Document {
  username: string;
  password?: string; // Password is not always present, e.g., when fetching user data
  fullName: string;
  role: UserRole;
  tracking: Types.ObjectId[]; // Array of user IDs that this user is tracking
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'user', 'trackable'],
    required: true,
    default: 'user',
  },
  tracking: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

// Middleware to hash password before saving the user document
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with the hashed password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password!);
};

export const User = model<IUser>('User', UserSchema);


