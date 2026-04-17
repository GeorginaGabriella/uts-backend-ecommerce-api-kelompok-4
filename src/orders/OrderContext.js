/**
 * Order Context (Factory)
 * Creates and manages Order module dependencies
 */
const OrderRepository = require('./infrastructure/persistence/OrderRepository');
const OrderMigration = require('./infrastructure/database/OrderMigration');
const {
  CreateOrderUseCase,
  GetOrderDetailUseCase,
  GetOrderHistoryUseCase,
  CancelOrderUseCase
} = require('./application/usecases');
const OrderController = require('./presentation/controllers/OrderController');

class OrderContext {
  constructor(database) {
    this.database = database;
    this.initialize();
  }

  initialize() {
    // Infrastructure
    this.orderRepository = new OrderRepository(this.database);
    this.migration = new OrderMigration(this.database);

    // Application
    this.createOrderUseCase = new CreateOrderUseCase(this.orderRepository);
    this.getOrderDetailUseCase = new GetOrderDetailUseCase(this.orderRepository);
    this.getOrderHistoryUseCase = new GetOrderHistoryUseCase(this.orderRepository);
    this.cancelOrderUseCase = new CancelOrderUseCase(this.orderRepository);

    // Presentation
    this.orderController = new OrderController({
      createOrderUseCase: this.createOrderUseCase,
      getOrderDetailUseCase: this.getOrderDetailUseCase,
      getOrderHistoryUseCase: this.getOrderHistoryUseCase,
      cancelOrderUseCase: this.cancelOrderUseCase
    });
  }

  /**
   * Run database migrations
   */
  async runMigrations() {
    await this.migration.up();
  }

  /**
   * Get controller instance
   */
  getController() {
    return this.orderController;
  }

  /**
   * Get repository instance
   */
  getRepository() {
    return this.orderRepository;
  }
}

module.exports = OrderContext;
