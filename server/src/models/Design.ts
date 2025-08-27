import { Schema, model, Document, PopulatedDoc } from 'mongoose';
import { ITemplate } from './Template';
import { IUser } from './User';

export interface IDesign extends Document {
  template_id: PopulatedDoc<ITemplate & Document>; 
  name: string;
  canvasData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: PopulatedDoc<IUser & Document>; 
}

const designSchema = new Schema<IDesign>({
  template_id: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    required: [true, 'Template ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Design name is required'],
    trim: true,
  },
  canvasData: {
    type: Schema.Types.Mixed,
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

export const Design = model<IDesign>('Design', designSchema);