import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import testsRoutes from './routes/tests.js';
import resultsRoutes from './routes/results.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/results', resultsRoutes);

app.listen(PORT, () => {
    console.log(`✅ API server running on http://localhost:${PORT}`);
});
