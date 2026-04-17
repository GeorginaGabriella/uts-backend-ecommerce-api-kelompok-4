/**
 * Order Entity
 * Represents a purchase order in the e-commerce system
 */
class Order {
  constructor({
    id,
    userId,
    totalPrice,
    status = 'PENDING_PAYMENT',
    createdAt = new Date(),
    updatedAt = new Date(),
    items = []
  }) {
    this.id = id;
    this.userId = userId;
    this.totalPrice = totalPrice;
    this.status = status; // PENDING_PAYMENT, PAID, CANCELLED
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.items = items; // Array of OrderItem entities
  }

  /**
   * Check if order can be cancelled
   * @returns {boolean}
   */
  canBeCancelled() {
    return this.status === 'PENDING_PAYMENT';
  }

  /**
   * Cancel the order
   */
  cancel() {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled. It has already been paid.');
    }
    this.status = 'CANCELLED';
    this.updatedAt = new Date();
  }

  /**
   * Mark order as paid
   */
  markAsPaid() {
    this.status = 'PAID';
    this.updatedAt = new Date();
  }

  /**
   * Get order summary
   * @returns {object}
   */
  getSummary() {
    return {
      id: this.id,
      userId: this.userId,
      totalPrice: this.totalPrice,
      status: this.status,
      itemCount: this.items.length,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Order;
