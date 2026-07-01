import { Schema, model, models, Model } from 'mongoose';
import { IUser } from '../types';


const UserSchema = new Schema<IUser>({
  githubId: { type: Number, required: true, unique: true },
  login: { type: String, required: true },
  name: String,
  email: String,
  avatarUrl: String,
  profileUrl: String,
  isSubscribed: { type: Boolean, default: false },
  subscriptionExpiresAt: { type: Date }
});

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>('User', UserSchema);
