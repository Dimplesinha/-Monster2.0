require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const { swaggerUi, swaggerSpec } = require('./swagger/swagger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');

const app = express();

/* Security */
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* Body parsing */
app.use(express.json({ limit: '1mb' }));

/* Docs */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

/* Health */
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

/* 404 */
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

/* Error handler */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
