/**
 * GetOrderHistoryUseCase
 * Business logic for retrieving user's order history
 */
class GetOrderHistoryUseCase {
  /**
   * @param {IOrderRepository} orderRepository
   */
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   * @param {string|number} userId
   * @param {object} options - { status, limit, offset, page }
   * @returns {Promise<{data: Order[], total: number, page: number, limit: number}>}
   */
  async execute(userId, options = {}) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Set defaults
    const normalizedLimit = Number.isInteger(options.limit) ? options.limit : parseInt(options.limit, 10);
    const normalizedPage = Number.isInteger(options.page) ? options.page : parseInt(options.page, 10);
    const limit = Math.min(normalizedLimit > 0 ? normalizedLimit : 10, 100); // Max 100 per page
    const page = normalizedPage > 0 ? normalizedPage : 1;
    const offset = (page - 1) * limit;
    const status = options.status || null;

    // Validate status if provided
    const validStatuses = ['PENDING_PAYMENT', 'PAID', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Fetch orders with pagination
    const result = await this.orderRepository.findByUserIdWithPagination(userId, {
      status,
      limit,
      offset
    });

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      result.data.map(async (order) => {
        const items = await this.orderRepository.getItems(order.id);
        order.items = items;
        return order;
      })
    );

    return {
      data: ordersWithItems,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    };
  }
}

module.exports = GetOrderHistoryUseCase;
