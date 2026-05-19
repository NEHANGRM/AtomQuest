const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/error');

dotenv.config();

// DB connection moved to startServer()

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/goals', require('./src/routes/goalRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/shared-goals', require('./src/routes/sharedGoalRoutes'));
app.use('/api/checkins', require('./src/routes/checkInRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));

// Basic route for health check
app.get('/', (req, res) => {
  res.send('Performix API is running');
});

// Error Middleware
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
