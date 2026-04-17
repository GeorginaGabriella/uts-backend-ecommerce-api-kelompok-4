/**
 * Integration Example
 * Shows how to integrate the Order module with other modules
 */

// ============================================
// BASIC SETUP (Already in src/app.js)
// ============================================

const express = require('express');
const DatabaseConfig = require('./config/database');
const authMiddleware = require('./middleware/authMiddleware');
const OrderContext = require('./orders/OrderContext');
const { initializeOrderRoutes } = require('./orders/presentation/routes/orderRoutes');

const app = express();

// Middleware setup
app.use(express.json());

// Initialize Order module
async function setupOrderModule() {
  const dbConfig = DatabaseConfig.getInstance();
  const database = await dbConfig.initialize();

  const orderContext = new OrderContext(database);
  const orderController = orderContext.getController();

  // Mount routes
  app.use('/orders', initializeOrderRoutes(orderController, authMiddleware));

  return orderContext;
}

// ============================================
// INTEGRATION WITH OTHER MODULES (TODO)
// ============================================

/*
// Example: Integrate with Cart Module
const CartContext = require('./cart/CartContext');

async function setupCartModule() {
  const dbConfig = DatabaseConfig.getInstance();
  const database = await dbConfig.initialize();

  const cartContext = new CartContext(database);
  const cartController = cartContext.getController();

  app.use('/cart', cartController);

  return cartContext;
}

// Example: Add dependency from Order to Cart
class CreateOrderUseCase {
  constructor(orderRepository, cartService) {
    this.orderRepository = orderRepository;
    this.cartService = cartService; // Clear cart after order
  }

  async execute(createOrderDTO) {
    // ... create order ...
    
    // Clear cart after successful order
    await this.cartService.clearCart(createOrderDTO.userId);
  }
}
*/

/*
// Example: Integrate with Product Module
const ProductContext = require('./products/ProductContext');

class CreateOrderUseCase {
  constructor(orderRepository, productService) {
    this.orderRepository = orderRepository;
    this.productService = productService; // Validate stock & reduce inventory
  }

  async execute(createOrderDTO) {
    const { userId, cartItems } = createOrderDTO;

    // Validate stock for all items
    for (const item of cartItems) {
      const product = await this.productService.getProduct(item.productId);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
    }

    // Create order
    const order = await this.orderRepository.create(/* ... */);

    // Reduce stock
    for (const item of cartItems) {
      await this.productService.reduceStock(item.productId, item.quantity);
    }

    return order;
  }
}
*/

/*
// Example: Integrate with Payment Module
const PaymentContext = require('./payments/PaymentContext');

class OrderController {
  constructor({ createOrderUseCase, paymentService }) {
    this.createOrderUseCase = createOrderUseCase;
    this.paymentService = paymentService;
  }

  async createOrder(req, res) {
    try {
      const order = await this.createOrderUseCase.execute(/* ... */);

      // Create payment intent
      const payment = await this.paymentService.createPaymentIntent({
        orderId: order.id,
        amount: order.totalPrice,
        userId: req.user.id
      });

      return res.status(201).json({
        success: true,
        order,
        payment // Include payment details (e.g., payment URL)
      });
    } catch (error) {
      // Handle error
    }
  }
}
*/

/*
// Example: Integrate with Notification Module
const NotificationService = require('./notifications/NotificationService');

class CancelOrderUseCase {
  constructor(orderRepository, notificationService) {
    this.orderRepository = orderRepository;
    this.notificationService = notificationService;
  }

  async execute(orderId, userId) {
    // Cancel order
    const order = await this.orderRepository.update(orderId, {
      status: 'CANCELLED'
    });

    // Send notification
    await this.notificationService.sendOrderCancelledNotification({
      userId,
      orderId,
      email: user.email,
      phone: user.phone
    });

    return order;
  }
}
*/

// ============================================
// EXPORT FOR USE IN MAIN APP
// ============================================

module.exports = {
  setupOrderModule
};
