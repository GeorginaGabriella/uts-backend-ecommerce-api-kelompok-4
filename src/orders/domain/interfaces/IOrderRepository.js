/**
 * IOrderRepository Interface
 * Defines contract for Order persistence operations
 */
class IOrderRepository {
  /**
   * Create a new order
   * @param {Order} order
   * @returns {Promise<Order>}
   */
  async create(order) {
    throw new Error('create() must be implemented');
  }

  /**
   * Create a new order together with its items in a single transaction
   * @param {Order} order
   * @param {OrderItem[]} items
   * @returns {Promise<Order>}
   */
  async createWithItems(order, items) {
    throw new Error('createWithItems() must be implemented');
  }

  /**
   * Find order by ID
   * @param {string|number} id
   * @returns {Promise<Order|null>}
   */
  async findById(id) {
    throw new Error('findById() must be implemented');
  }

  /**
   * Find all orders by user ID
   * @param {string|number} userId
   * @returns {Promise<Order[]>}
   */
  async findByUserId(userId) {
    throw new Error('findByUserId() must be implemented');
  }

  /**
   * Find orders with pagination and filters
   * @param {string|number} userId
   * @param {object} options - { status, limit, offset }
   * @returns {Promise<{data: Order[], total: number}>}
   */
  async findByUserIdWithPagination(userId, options = {}) {
    throw new Error('findByUserIdWithPagination() must be implemented');
  }

  /**
   * Update order
   * @param {string|number} id
   * @param {object} data
   * @returns {Promise<Order>}
   */
  async update(id, data) {
    throw new Error('update() must be implemented');
  }

  /**
   * Add item to order
   * @param {OrderItem} orderItem
   * @returns {Promise<OrderItem>}
   */
  async addItem(orderItem) {
    throw new Error('addItem() must be implemented');
  }

  /**
   * Get order items
   * @param {string|number} orderId
   * @returns {Promise<OrderItem[]>}
   */
  async getItems(orderId) {
    throw new Error('getItems() must be implemented');
  }

  /**
   * Delete all items for an order
   * @param {string|number} orderId
   * @returns {Promise<void>}
   */
  async deleteItems(orderId) {
    throw new Error('deleteItems() must be implemented');
  }
}

module.exports = IOrderRepository;
