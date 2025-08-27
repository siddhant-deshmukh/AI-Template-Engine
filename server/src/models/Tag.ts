import { Schema, model, Document } from 'mongoose';

// Interface for the Tag document
export interface ITag extends Document {
  name: string;
}

// Mongoose Schema for Tag
const tagSchema = new Schema<ITag>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
});

export const Tag = model<ITag>('Tag', tagSchema);