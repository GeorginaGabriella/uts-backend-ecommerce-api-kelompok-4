/**
 * Database Migration for Order Module
 * Run this to create/update Order and OrderItems tables
 */
class OrderMigration {
  constructor(database) {
    this.db = database;
  }

  /**
   * Create orders table
   */
  async createOrdersTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT'
          CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'CANCELLED')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await this.db.execute(query);
    console.log('Orders table created/verified');
  }

  /**
   * Create order_items table
   */
  async createOrderItemsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await this.db.execute(query);
    console.log('Order Items table created/verified');
  }

  /**
   * Run all migrations
   */
  async up() {
    console.log('Running Order migrations...');
    try {
      await this.createOrdersTable();
      await this.createOrderItemsTable();
      console.log('Order migrations completed');
    } catch (error) {
      console.error('Migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Rollback migrations
   */
  async down() {
    console.log('Rolling back Order migrations...');
    try {
      await this.db.execute('DROP TABLE IF EXISTS order_items');
      await this.db.execute('DROP TABLE IF EXISTS orders');
      console.log('Order migration rollback completed');
    } catch (error) {
      console.error('Rollback failed:', error.message);
      throw error;
    }
  }
}

module.exports = OrderMigration;
