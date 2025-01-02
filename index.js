// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');
const cleanupJob = require('./jobs/cleanupJob');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: Missing required environment variable ${varName}`);
    process.exit(1);
  }
});

// Set port and MongoDB URI from environment variables or defaults
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Create Express app
const app = express();

// Middleware setup for JSON parsing and Cross-Origin Resource Sharing (CORS)
app.use(express.json());
app.use(cors());

// Register routes for authentication and task management
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use(errorHandler); // Global error handling middleware

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    
    // Start the server on the specified port
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Schedule a cleanup job for periodic maintenance
    cleanupJob();

    // Graceful shutdown for server and database connection
    const shutdown = () => {
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Default route for health check or basic response
app.get('/', (req, res) => {
  res.send('Task Management API is running!');
});
