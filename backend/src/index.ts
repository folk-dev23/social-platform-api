import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Popular Monsters API is running 🐾',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const start = async (): Promise<void> => {
  await connectDB();
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`🐾 Server running on http://localhost:${PORT}`);
  });
};

start();

export default app;