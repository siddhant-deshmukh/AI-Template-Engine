import { Schema, model, Document, PopulatedDoc } from 'mongoose';
import { ITemplate } from './Template';
import { ITag } from './Tag';

// Interface for the TemplateTag document
export interface ITemplateTag extends Document {
  template_id: PopulatedDoc<ITemplate & Document>; // Reference to Template
  tag_id: PopulatedDoc<ITag & Document>; // Reference to Tag
}

// Mongoose Schema for TemplateTag
const templateTagSchema = new Schema<ITemplateTag>({
  template_id: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
  tag_id: {
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
  },
});

export const TemplateTag = model<ITemplateTag>('TemplateTag', templateTagSchema);