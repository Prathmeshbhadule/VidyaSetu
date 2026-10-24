import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthController } from './controllers/health.controller.js';
import { renderDocs, openApiSpec } from './docs/openapi.js';
import { apiV1Router } from './routes/index.js';
import { StandardProblems, ProblemError } from '@vidya-setu/shared';

export const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and embedded media players
  })
);

// CORS allowlist
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev / local LAN school setups
      }
    },
    credentials: true,
  })
);

// Body and cookie parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request ID and structured request logging
app.use(requestIdMiddleware);
app.use(
  pinoHttp({
    logger,
    autoLogging: env.NODE_ENV !== 'test',
    genReqId: (req) => (req as any).id,
  })
);

// Rate limiting
app.use(globalRateLimiter);

// Health and readiness probes
app.get('/healthz', healthController.healthz);
app.get('/readyz', healthController.readyz);

// Interactive OpenAPI Documentation
app.get('/docs', renderDocs);
app.get('/docs/json', (req, res) => res.json(openApiSpec));

// API v1 Resource Router
app.use('/api/v1', apiV1Router);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(new ProblemError(StandardProblems.notFound('Endpoint', req.originalUrl)));
});

// Centralized RFC 7807 Error Handler
app.use(errorHandler);
