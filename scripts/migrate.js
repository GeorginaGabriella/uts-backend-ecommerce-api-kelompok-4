/**
 * Migration Script
 * Run database migrations
 */
require('dotenv').config();

const DatabaseConfig = require('../src/config/database');
const OrderContext = require('../src/orders/OrderContext');

async function runMigrations() {
  try {
    console.log('Starting migrations...\n');

    const dbConfig = DatabaseConfig.getInstance();
    const database = await dbConfig.initialize();

    const orderContext = new OrderContext(database);
    await orderContext.runMigrations();

    await dbConfig.closeConnection();

    console.log('\n All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
