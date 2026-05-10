const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Import Routes
const vehiclesRouter = require('./routes/vehicles');
const tasksRouter = require('./routes/tasks');
const bookingsRouter = require('./routes/bookings');

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Car Rental API is running' });
});

// Use Routes
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/bookings', bookingsRouter);

// Export for Serverless
module.exports.handler = serverless(app);

// Local Development Server (Optional)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
