/**
 * Main Application Entry Point
 */
require('dotenv').config();

const express = require('express');
const DatabaseConfig = require('./config/database');
const authMiddleware = require('./middleware/authMiddleware');
const OrderContext = require('./orders/OrderContext');
const { initializeOrderRoutes } = require('./orders/presentation/routes/orderRoutes');

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });

  return app;
}

const app = createApp();
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) {
    return app;
  }

  const dbConfig = DatabaseConfig.getInstance();
  const database = await dbConfig.initialize();

  const orderContext = new OrderContext(database);
  await orderContext.runMigrations();

  const orderController = orderContext.getController();
  const orderRoutes = initializeOrderRoutes(orderController, authMiddleware);

  app.use('/orders', orderRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  });

  isInitialized = true;
  return app;
}

async function startServer() {
  try {
    await initializeApp();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
      console.log('Order & Transaction Module Ready\n');
    });
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  const dbConfig = DatabaseConfig.getInstance();
  await dbConfig.closeConnection();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  createApp,
  initializeApp,
  startServer
};
