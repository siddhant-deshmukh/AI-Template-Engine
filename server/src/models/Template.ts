import { Schema, model, Document, type PopulatedDoc } from 'mongoose';
import type { IUser } from './User';
import { IPolotnoJSON } from '../types/polotno';



export interface ITemplate extends Document {
  name: string;
  description?: string;
  width: number;
  height: number;
  canvasData: IPolotnoJSON;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: PopulatedDoc<IUser & Document>; // Reference to User
}

// Mongoose Schema for Template
const templateSchema = new Schema<ITemplate>({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  width: {
    type: Number,
    required: [true, 'Width is required'],
    min: 0,
  },
  height: {
    type: Number,
    required: [true, 'Height is required'],
    min: 0,
  },
  canvasData: {
    type: Schema.Types.Mixed, // Use Mixed for a flexible JSON object
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

export const Template = model<ITemplate>('Template', templateSchema);