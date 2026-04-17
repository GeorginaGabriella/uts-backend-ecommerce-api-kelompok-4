/**
 * GetOrderDetailUseCase
 * Business logic for retrieving a specific order detail
 */
class GetOrderDetailUseCase {
  /**
   * @param {IOrderRepository} orderRepository
   */
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   * @param {string|number} orderId
   * @param {string|number} userId - For authorization check
   * @returns {Promise<Order>}
   */
  async execute(orderId, userId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Authorization check - user can only view their own orders
    if (order.userId !== parseInt(userId)) {
      const error = new Error('Unauthorized to view this order');
      error.statusCode = 403;
      throw error;
    }

    // Fetch items for this order
    const items = await this.orderRepository.getItems(orderId);
    order.items = items;

    return order;
  }
}

module.exports = GetOrderDetailUseCase;
