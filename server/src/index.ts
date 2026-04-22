import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import logger from './config/logger';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import uploadRoutes from './routes/uploadRoutes';
import auditRoutes from './routes/auditRoutes';
import societyRoutes from './routes/societyRoutes';
import eventRoutes from './routes/eventRoutes';
import projectRoutes from './routes/projectRoutes';
import announcementRoutes from './routes/announcementRoutes';
import memberRoutes from './routes/memberRoutes';
import officeBearerRoutes from './routes/officeBearerRoutes';
import speakerRoutes from './routes/speakerRoutes';
import calendarEventRoutes from './routes/calendarEventRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

// Use morgan for HTTP request logging but pipe it into our pino logger
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/societies', societyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/office-bearers', officeBearerRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/calendar-events', calendarEventRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV
  });
});

// Error Handler
app.use(errorHandler);

const PORT = env.PORT;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
}

export default app;
