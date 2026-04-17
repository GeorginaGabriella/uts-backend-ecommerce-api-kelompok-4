/**
 * OrderRepository
 * MySQL implementation of IOrderRepository
 */
const Order = require('../../domain/entities/Order');
const OrderItem = require('../../domain/entities/OrderItem');
const IOrderRepository = require('../../domain/interfaces/IOrderRepository');
const { transaction } = require('../../../utils/database');

class OrderRepository extends IOrderRepository {
  /**
   * @param {object} database - MySQL connection pool
   */
  constructor(database) {
    super();
    this.db = database;
  }

  /**
   * Create a new order
   * @param {Order} order
   * @returns {Promise<Order>}
   */
  async create(order) {
    return this.createOrderRecord(this.db, order);
  }

  /**
   * Create an order and its items in a single transaction
   * @param {Order} order
   * @param {OrderItem[]} items
   * @returns {Promise<Order>}
   */
  async createWithItems(order, items = []) {
    return transaction(this.db, async (connection) => {
      const savedOrder = await this.createOrderRecord(connection, order);
      const savedItems = [];

      for (const item of items) {
        const itemToSave = new OrderItem({
          ...item,
          orderId: savedOrder.id
        });
        const savedItem = await this.addItem(itemToSave, connection);
        savedItems.push(savedItem);
      }

      savedOrder.items = savedItems;
      return savedOrder;
    });
  }

  /**
   * Find order by ID
   * @param {string|number} id
   * @returns {Promise<Order|null>}
   */
  async findById(id) {
    const query = `SELECT * FROM orders WHERE id = ?`;

    const [rows] = await this.db.execute(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return new Order({
      id: row.id,
      userId: row.user_id,
      totalPrice: row.total_price,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  /**
   * Find all orders by user ID
   * @param {string|number} userId
   * @returns {Promise<Order[]>}
   */
  async findByUserId(userId) {
    const query = `
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    const [rows] = await this.db.execute(query, [userId]);

    return rows.map(row => new Order({
      id: row.id,
      userId: row.user_id,
      totalPrice: row.total_price,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  /**
   * Find orders with pagination and filters
   * @param {string|number} userId
   * @param {object} options - { status, limit, offset }
   * @returns {Promise<{data: Order[], total: number}>}
   */
  async findByUserIdWithPagination(userId, options = {}) {
    let query = 'SELECT * FROM orders WHERE user_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const params = [userId];

    // Add status filter if provided
    if (options.status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(options.status);
    }

    // Add ordering
    query += ' ORDER BY created_at DESC';

    // Add pagination
    if (options.limit && options.offset !== undefined) {
      query += ' LIMIT ? OFFSET ?';
      params.push(options.limit, options.offset);
    }

    // Get total count
    const countParams = params.slice(0, options.status ? 2 : 1);
    const [countResults] = await this.db.execute(countQuery, countParams);
    const total = countResults[0].total;

    // Get paginated data
    const [rows] = await this.db.execute(query, params);

    const data = rows.map(row => new Order({
      id: row.id,
      userId: row.user_id,
      totalPrice: row.total_price,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return { data, total };
  }

  /**
   * Update order
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<Order>}
   */
  async update(id, data) {
    const allowedFields = ['status', 'total_price', 'updated_at'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(snakeKey)) {
        updates.push(`${snakeKey} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;

    await this.db.execute(query, values);

    return this.findById(id);
  }

  /**
   * Add item to order
   * @param {OrderItem} orderItem
   * @returns {Promise<OrderItem>}
   */
  async addItem(orderItem, executor = this.db) {
    const query = `
      INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await executor.execute(query, [
      orderItem.orderId,
      orderItem.productId,
      orderItem.quantity,
      orderItem.price,
      orderItem.createdAt
    ]);

    orderItem.id = result.insertId;
    return orderItem;
  }

  /**
   * Get order items
   * @param {string|number} orderId
   * @returns {Promise<OrderItem[]>}
   */
  async getItems(orderId) {
    const query = `
      SELECT * FROM order_items
      WHERE order_id = ?
      ORDER BY created_at ASC
    `;

    const [rows] = await this.db.execute(query, [orderId]);

    return rows.map(row => new OrderItem({
      id: row.id,
      orderId: row.order_id,
      productId: row.product_id,
      quantity: row.quantity,
      price: row.price,
      createdAt: row.created_at
    }));
  }

  /**
   * Delete all items for an order
   * @param {string|number} orderId
   * @returns {Promise<void>}
   */
  async deleteItems(orderId) {
    const query = 'DELETE FROM order_items WHERE order_id = ?';
    await this.db.execute(query, [orderId]);
  }

  async createOrderRecord(executor, order) {
    const query = `
      INSERT INTO orders (user_id, total_price, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await executor.execute(query, [
      order.userId,
      order.totalPrice,
      order.status,
      order.createdAt,
      order.updatedAt
    ]);

    return new Order({
      ...order,
      id: result.insertId
    });
  }
}

module.exports = OrderRepository;
