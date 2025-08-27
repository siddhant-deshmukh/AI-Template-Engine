import { Schema, model, Document } from 'mongoose';

// Interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional because of Google OAuth
  email_verified: boolean;
  google_sub?: string; // Optional for users not using Google sign-in
}

// Mongoose Schema for User
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    // Basic email validation regex
    match: [/.+@.+\..+/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    // Password will be required for non-OAuth users
    // We can add a custom validator later to check based on google_sub existence
  },
  email_verified: {
    type: Boolean,
    default: false,
  },
  google_sub: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to not be unique
  },
});

export const User = model<IUser>('User', userSchema);