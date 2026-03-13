import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import testsRoutes from './routes/tests.js';
import resultsRoutes from './routes/results.js';
import executeRoutes from './routes/execute.js'; 
import questionsRoutes from './routes/questions.js'; // <-- Added questions route
import mentorRoutes from './routes/mentor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/execute', executeRoutes); 
app.use('/api/questions', questionsRoutes); // <-- Added questions route
app.use('/api/mentor', mentorRoutes);

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✅ API server running on http://0.0.0.0:${PORT} (accessible from phone at http://172.20.10.2:${PORT})`);
});
