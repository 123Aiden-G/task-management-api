// Import necessary modules
const express = require('express'); // Express framework to build the server
const mongoose = require('mongoose'); // Mongoose to interact with MongoDB
const dotenv = require('dotenv'); // dotenv to load environment variables from .env file
const cors = require('cors'); // CORS middleware for handling cross-origin requests
const authRoutes = require('./routes/authRoutes'); // Authentication routes
const taskRoutes = require('./routes/taskRoutes'); // Task management routes
const errorHandler = require('./middleware/errorHandler'); // Error handling middleware
const cleanupJob = require('./jobs/cleanupJob'); // Ensure this path is correct

// Load environment variables from the .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Error: Missing required environment variable ${varName}`);
    process.exit(1);
  }
});

// Create an Express application instance
const app = express();

// Middleware setup
app.use(express.json()); // Middleware to parse incoming JSON data
app.use(cors()); // Middleware to enable Cross-Origin Resource Sharing (CORS)

// Register routes
app.use('/api/auth', authRoutes); // Routes for user authentication
app.use('/api/tasks', taskRoutes); // Routes for task management

// Error handling middleware
app.use(errorHandler);

// Set up environment variables for the server port and MongoDB URI
const PORT = process.env.PORT || 3000; // Use the Vercel-assigned port or fallback to 3000

const MONGO_URI = process.env.MONGO_URI; // MongoDB connection URI from the .env file

// Connect to MongoDB using Mongoose
mongoose
  .connect('mongodb://127.0.0.1:27017/taskmanagement') // Deprecated options removed
  .then(() => {
    console.log('Successfully connected to MongoDB');
    // Start the server on the specified port
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Schedule the cleanup job
    cleanupJob(); // Call the cleanup job function

    // Graceful shutdown
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
    // If an error occurs while connecting to MongoDB, log the error and exit the process
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process with an error code
  });

// Default route to confirm that the server is running
app.get('/', (req, res) => {
  res.send('Task Management API is running!'); // Basic response for the root URL
});
