/**
 * CreateOrderUseCase
 * Business logic for creating a new order from cart
 */
const Order = require('../../domain/entities/Order');
const OrderItem = require('../../domain/entities/OrderItem');

class CreateOrderUseCase {
  /**
   * @param {IOrderRepository} orderRepository
   */
  constructor(orderRepository) {
    this.orderRepository = orderRepository;
  }

  /**
   * Execute the use case
   * @param {CreateOrderDTO} createOrderDTO
   * @returns {Promise<Order>}
   */
  async execute(createOrderDTO) {
    // Validate input
    const validation = createOrderDTO.validate();
    if (!validation.isValid) {
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    const { userId, cartItems } = createOrderDTO;

    // TODO: Validate stock from Product module
    // const stockValidation = await this.validateStock(cartItems);
    // if (!stockValidation.isValid) {
    //   throw new Error('Some items are out of stock');
    // }

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);

    // Create order entity
    const order = new Order({
      userId,
      totalPrice,
      status: 'PENDING_PAYMENT'
    });

    const orderItems = cartItems.map((cartItem) => new OrderItem({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: cartItem.price
    }));

    try {
      if (typeof this.orderRepository.createWithItems === 'function') {
        return await this.orderRepository.createWithItems(order, orderItems);
      }

      const savedOrder = await this.orderRepository.create(order);

      for (const orderItem of orderItems) {
        orderItem.orderId = savedOrder.id;
        await this.orderRepository.addItem(orderItem);
      }

      const itemsInOrder = await this.orderRepository.getItems(savedOrder.id);
      savedOrder.items = itemsInOrder;

      return savedOrder;
    } catch (error) {
      const wrappedError = new Error(`Failed to create order: ${error.message}`);
      wrappedError.statusCode = error.statusCode || 500;
      throw wrappedError;
    }
  }
}

module.exports = CreateOrderUseCase;
