/**
 * CancelOrderUseCase
 * Business logic for cancelling an order
 */
class CancelOrderUseCase {
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

    // Authorization check
    if (order.userId !== parseInt(userId)) {
      const error = new Error('Unauthorized to cancel this order');
      error.statusCode = 403;
      throw error;
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      const error = new Error(
        `Order cannot be cancelled. Current status: ${order.status}. ` +
        'Only orders with PENDING_PAYMENT status can be cancelled.'
      );
      error.statusCode = 400;
      throw error;
    }

    // Cancel the order
    order.cancel();

    // Save changes
    const updatedOrder = await this.orderRepository.update(orderId, {
      status: order.status,
      updatedAt: order.updatedAt
    });

    // TODO: Restore inventory in Product module
    // const items = await this.orderRepository.getItems(orderId);
    // await this.inventoryService.restockItems(items);

    // TODO: Notify user via email/SMS
    // await this.notificationService.notifyOrderCancelled(order);

    return updatedOrder;
  }
}

module.exports = CancelOrderUseCase;
