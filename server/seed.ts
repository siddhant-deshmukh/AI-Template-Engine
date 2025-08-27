import mongoose from 'mongoose';
import { Template } from './src/models/Template';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertPolotnoJSONToImage } from './src/utils/polotno'



// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// MongoDB connection URI
const mongoUri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/my-ts-db';

// Path to the templates JSON file
const templatesPath = path.resolve(__dirname, '../data/combined_templates_mini.json');

// Function to generate a descriptive name based on dimensions
const guessTemplateName = (width: number, height: number, index: number): string => {
  const aspectRatio = width / height;

  if (Math.abs(aspectRatio - 1) < 0.01) {
    return `Instagram Post ${index + 1}`;
  }
  if (Math.abs(aspectRatio - 1.91) < 0.05) {
    return `Facebook Post ${index + 1}`;
  }
  if (Math.abs(aspectRatio - 9 / 16) < 0.01) {
    return `Instagram Story ${index + 1}`;
  }
  if (Math.abs(aspectRatio - 16 / 9) < 0.01) {
    return `YouTube Thumbnail ${index + 1}`;
  }

  // Fallback for other dimensions
  return `Custom Template ${width}x${height} ${index + 1}`;
};

// Seed function to add data
const seedTemplates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');

    // Read templates from the JSON file
    const templatesData = JSON.parse(readFileSync(templatesPath, 'utf-8'));
    console.log(`Read ${templatesData.length} templates from JSON file.`);

    // Clear existing templates to avoid duplicates
    await Template.deleteMany({});
    console.log('Existing templates cleared.');

    // Prepare new templates for insertion
    const templatesToInsert = templatesData.map((template: any, index: number) => ({
      name: guessTemplateName(template.width, template.height, index),
      description: 'A beautifully designed template.',
      width: template.width,
      height: template.height,
      canvasData: template,
    }));
    
    
    await convertPolotnoJSONToImage({ polotnoJSON: templatesData[0], templateId: 'anyrandomstring' })

    console.log(templatesToInsert[0]);

    // Insert templates into the database
    const result = await Template.insertMany(templatesToInsert);
    console.log(`Successfully added ${result.length} templates to the database.`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedTemplates();