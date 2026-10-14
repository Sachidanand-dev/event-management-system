require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedDefaultUsers = require('./utils/seeder');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Ensure essential default accounts (admin, volunteer, student) exist with 0 dummy events
    await seedDefaultUsers();

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      console.log(`[NexEvent Server] Running on http://localhost:${PORT}`);
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        const mongoose = require('mongoose');
        mongoose.connection.close(false).then(() => {
          console.log('[Server] Mongoose connection closed. Exiting process.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('[Server Startup Failure]:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
