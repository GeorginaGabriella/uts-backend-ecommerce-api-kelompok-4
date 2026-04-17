/**
 * Order Routes
 * Defines all endpoints for Order module
 */
const express = require('express');

/**
 * Initialize order routes
 * @param {OrderController} orderController
 * @param {Function} authenticate - JWT auth middleware
 */
function initializeOrderRoutes(orderController, authenticate) {
  const router = express.Router();

  // All routes require authentication
  router.use(authenticate);

  /**
   * POST /orders
   * Create a new order from cart
   */
  router.post('/', (req, res) => {
    orderController.createOrder(req, res);
  });

  /**
   * GET /orders
   * Get all orders for current user
   */
  router.get('/', (req, res) => {
    orderController.getUserOrders(req, res);
  });

  /**
   * GET /orders/history
   * Get order history (pagination & filtering)
   * Must be before /:id to avoid route conflict
   */
  router.get('/history', (req, res) => {
    orderController.getOrderHistory(req, res);
  });

  /**
   * GET /orders/:id
   * Get specific order detail
   */
  router.get('/:id', (req, res) => {
    orderController.getOrderDetail(req, res);
  });

  /**
   * PUT /orders/:id/cancel
   * Cancel an order
   */
  router.put('/:id/cancel', (req, res) => {
    orderController.cancelOrder(req, res);
  });

  return router;
}

module.exports = { initializeOrderRoutes };
