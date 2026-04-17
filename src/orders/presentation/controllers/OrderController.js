/**
 * OrderController
 * Handles HTTP requests for Order endpoints
 */
const CreateOrderDTO = require('../../application/dtos/CreateOrderDTO');
const OrderResponseDTO = require('../../application/dtos/OrderResponseDTO');

class OrderController {
  /**
   * @param {CreateOrderUseCase} createOrderUseCase
   * @param {GetOrderDetailUseCase} getOrderDetailUseCase
   * @param {GetOrderHistoryUseCase} getOrderHistoryUseCase
   * @param {CancelOrderUseCase} cancelOrderUseCase
   */
  constructor({ createOrderUseCase, getOrderDetailUseCase, getOrderHistoryUseCase, cancelOrderUseCase }) {
    this.createOrderUseCase = createOrderUseCase;
    this.getOrderDetailUseCase = getOrderDetailUseCase;
    this.getOrderHistoryUseCase = getOrderHistoryUseCase;
    this.cancelOrderUseCase = cancelOrderUseCase;
  }

  /**
   * POST /orders - Create a new order
   */
  async createOrder(req, res) {
    try {
      const { cartItems } = req.body;
      const userId = req.user.id; // From JWT middleware

      const createOrderDTO = new CreateOrderDTO({ userId, cartItems });
      const order = await this.createOrderUseCase.execute(createOrderDTO);

      const response = OrderResponseDTO.fromOrderWithItems(order, order.items);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: response
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  /**
   * GET /orders/:id - Get order detail
   */
  async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id; // From JWT middleware

      const order = await this.getOrderDetailUseCase.execute(id, userId);

      const response = OrderResponseDTO.fromOrderWithItems(order, order.items);

      return res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: response
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  /**
   * GET /orders - Get user's orders
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user.id; // From JWT middleware
      const { status, page = 1, limit = 10 } = req.query;

      const options = {
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await this.getOrderHistoryUseCase.execute(userId, options);

      const response = {
        ...result,
        data: result.data.map(order => 
          OrderResponseDTO.fromOrderWithItems(order, order.items)
        )
      };

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: response
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  /**
   * GET /orders/history - Get order history (alias for getUserOrders)
   */
  async getOrderHistory(req, res) {
    return this.getUserOrders(req, res);
  }

  /**
   * PUT /orders/:id/cancel - Cancel an order
   */
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id; // From JWT middleware

      const order = await this.cancelOrderUseCase.execute(id, userId);

      const response = new OrderResponseDTO(order);

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: response
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  /**
   * Error handler
   */
  handleError(error, res) {
    // Validation errors
    if (error.details && Array.isArray(error.details)) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.details
      });
    }

    // HTTP status codes from use cases
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';

    return res.status(statusCode).json({
      success: false,
      message
    });
  }
}

module.exports = OrderController;
