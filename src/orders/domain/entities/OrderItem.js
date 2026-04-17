/**
 * OrderItem Entity
 * Represents a single item/book in an order
 */
class OrderItem {
  constructor({
    id,
    orderId,
    productId,
    quantity,
    price,
    createdAt = new Date()
  }) {
    this.id = id;
    this.orderId = orderId;
    this.productId = productId;
    this.quantity = quantity;
    this.price = price; // Price per unit
    this.createdAt = createdAt;
  }

  /**
   * Get subtotal for this item
   * @returns {number}
   */
  getSubtotal() {
    return this.quantity * this.price;
  }
}

module.exports = OrderItem;
