import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { requireAuth } from './middleware/auth.js';
import practitionersRouter from './routes/practitioners.js';
import patientsRouter from './routes/patients.js';
import appointmentsRouter from './routes/appointments.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/practitioners', requireAuth, practitionersRouter);
app.use('/api/patients', requireAuth, patientsRouter);
app.use('/api/appointments', requireAuth, appointmentsRouter);
app.use('/api/dashboard', requireAuth, dashboardRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
});

app.listen(PORT, () => {
  console.log(`API No-Show Manager demarree sur le port ${PORT}`);
});
