import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import postsRoutes from './modules/posts/posts.routes';
import feedRoutes from './modules/feed/feed.routes';
import trendingRoutes from './modules/trending/trending.routes';
import recommendationsRoutes from './modules/recommendations/recommendations.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/recommendations', recommendationsRoutes);

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