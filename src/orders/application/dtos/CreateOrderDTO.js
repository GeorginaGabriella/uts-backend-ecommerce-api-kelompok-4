/**
 * CreateOrderDTO
 * Data Transfer Object for creating an order
 */
class CreateOrderDTO {
  constructor({ userId, cartItems }) {
    this.userId = userId;
    this.cartItems = cartItems; // Array: [{ productId, quantity, price }]
  }

  /**
   * Validate DTO data
   * @returns {object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.userId) {
      errors.push('User ID is required');
    }

    if (!Array.isArray(this.cartItems) || this.cartItems.length === 0) {
      errors.push('Cart items are required and cannot be empty');
    }

    if (Array.isArray(this.cartItems)) {
      this.cartItems.forEach((item, index) => {
        if (!item.productId) {
          errors.push(`Item ${index}: Product ID is required`);
        }
        if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
          errors.push(`Item ${index}: Quantity must be greater than 0`);
        }
        if (!Number.isFinite(item.price) || item.price < 0) {
          errors.push(`Item ${index}: Price must be a valid number`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = CreateOrderDTO;
