/**
 * OrderResponseDTO
 * Data Transfer Object for order responses
 */
class OrderResponseDTO {
  constructor(order) {
    this.id = order.id;
    this.userId = order.userId;
    this.totalPrice = order.totalPrice;
    this.status = order.status;
    this.items = order.items || [];
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }

  /**
   * Convert items to response format
   * @param {OrderItem[]} items
   * @returns {object[]}
   */
  static mapItems(items) {
    return items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.quantity * item.price
    }));
  }

  /**
   * Create from Order entity with items
   * @param {Order} order
   * @param {OrderItem[]} items
   * @returns {OrderResponseDTO}
   */
  static fromOrderWithItems(order, items) {
    const dto = new OrderResponseDTO(order);
    dto.items = this.mapItems(items);
    return dto;
  }
}

module.exports = OrderResponseDTO;
