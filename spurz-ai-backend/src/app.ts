import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './config/env';
import logger from './utils/logger';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Spurz.ai Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth',
      profile: '/profile',
      income: '/income',
      cards: '/cards',
      home: '/home',
      deals: '/deals',
      recommendations: '/recommendations',
      marketCards: '/market-cards',
      categories: '/categories',
      rewards: '/rewards',
    },
  });
});

// API Routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import incomeRoutes from './routes/income.routes';
import cardsRoutes from './routes/cards.routes';
import homeRoutes from './routes/home.routes';
import dealsRoutes from './routes/deals.routes';
import recommendationsRoutes from './routes/recommendations.routes';
import marketCardsRoutes from './routes/market-cards.routes';
import categoriesRoutes from './routes/categories.routes';
import rewardsRoutes from './routes/rewards.routes';

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/income', incomeRoutes);
app.use('/cards', cardsRoutes);
app.use('/home', homeRoutes);
app.use('/deals', dealsRoutes);
app.use('/recommendations', recommendationsRoutes);
app.use('/market-cards', marketCardsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/rewards', rewardsRoutes);

// Error handling middleware
import { errorHandler, notFound } from './middlewares/error.middleware';
app.use(notFound);
app.use(errorHandler);

export default app;
