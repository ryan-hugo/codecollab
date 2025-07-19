import express from 'express';
import cors from 'cors';
import { config } from './config';

const app = express();

// CORS configuration
const corsOptions = {
  origin: config.frontendUrl,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do CodeCollab está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes will be added here
// app.use('/api/auth', authRoutes);
// app.use('/api/snippets', snippetRoutes);
// app.use('/api/users', userRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.isDevelopment ? err.message : 'Something went wrong!'
  });
});

export default app;
