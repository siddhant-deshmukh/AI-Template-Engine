import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express, { type Application, type Request, type Response } from 'express';

import PromptRouter from './routes/prompt.routes';
import TemplatesRouter from './routes/templates.routes';

dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT || '5000', 10);
const mongoUri: string = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canva';

app.use(express.json());
app.use(cors());

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

app.get('/', (req: Request, res: Response) => {
  res.send('API is running!');
});

app.use('/prompt', PromptRouter);
app.use('/template', TemplatesRouter);

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

startServer();