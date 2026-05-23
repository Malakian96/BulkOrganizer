import { Schema, model } from 'mongoose';

export interface IUserDocument {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    _id:      { type: String, required: true },
    googleId: { type: String, required: true },
    email:    { type: String, required: true },
    name:     { type: String, required: true },
    avatarUrl:{ type: String, default: null },
  },
  { _id: false, timestamps: true, collection: 'users' }
);

userSchema.index({ googleId: 1 }, { unique: true });

export const UserModel = model<IUserDocument>('User', userSchema);
