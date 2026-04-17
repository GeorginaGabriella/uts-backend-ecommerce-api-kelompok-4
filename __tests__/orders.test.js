const CreateOrderDTO = require('../src/orders/application/dtos/CreateOrderDTO');
const Order = require('../src/orders/domain/entities/Order');
const OrderItem = require('../src/orders/domain/entities/OrderItem');
const CreateOrderUseCase = require('../src/orders/application/usecases/CreateOrderUseCase');
const GetOrderDetailUseCase = require('../src/orders/application/usecases/GetOrderDetailUseCase');
const GetOrderHistoryUseCase = require('../src/orders/application/usecases/GetOrderHistoryUseCase');
const CancelOrderUseCase = require('../src/orders/application/usecases/CancelOrderUseCase');

describe('CreateOrderDTO', () => {
  it('rejects an empty cart', () => {
    const dto = new CreateOrderDTO({
      userId: 1,
      cartItems: []
    });

    const validation = dto.validate();

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Cart items are required and cannot be empty');
  });

  it('accepts a zero price item', () => {
    const dto = new CreateOrderDTO({
      userId: 1,
      cartItems: [
        {
          productId: 10,
          quantity: 1,
          price: 0
        }
      ]
    });

    const validation = dto.validate();

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});

describe('Order entity', () => {
  it('can only cancel pending payment orders', () => {
    const order = new Order({
      id: 1,
      userId: 1,
      totalPrice: 100000,
      status: 'PENDING_PAYMENT'
    });

    expect(order.canBeCancelled()).toBe(true);

    order.cancel();
    expect(order.status).toBe('CANCELLED');
    expect(order.canBeCancelled()).toBe(false);
  });

  it('throws when cancelling a paid order', () => {
    const order = new Order({
      id: 2,
      userId: 1,
      totalPrice: 100000,
      status: 'PAID'
    });

    expect(() => order.cancel()).toThrow('Order cannot be cancelled');
  });
});

describe('Order use cases', () => {
  it('creates an order and its items', async () => {
    const storedItems = [];
    const repository = {
      create: jest.fn(async (order) => {
        order.id = 123;
        return order;
      }),
      addItem: jest.fn(async (item) => {
        item.id = storedItems.length + 1;
        storedItems.push(item);
        return item;
      }),
      getItems: jest.fn(async () => storedItems)
    };

    const useCase = new CreateOrderUseCase(repository);
    const dto = new CreateOrderDTO({
      userId: 7,
      cartItems: [
        { productId: 1, quantity: 2, price: 50000 },
        { productId: 2, quantity: 1, price: 0 }
      ]
    });

    const order = await useCase.execute(dto);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.addItem).toHaveBeenCalledTimes(2);
    expect(order.id).toBe(123);
    expect(order.totalPrice).toBe(100000);
    expect(order.items).toHaveLength(2);
  });

  it('rejects access to another user order detail', async () => {
    const repository = {
      findById: jest.fn(async () => new Order({
        id: 1,
        userId: 99,
        totalPrice: 100000,
        status: 'PENDING_PAYMENT'
      })),
      getItems: jest.fn()
    };

    const useCase = new GetOrderDetailUseCase(repository);

    await expect(useCase.execute(1, 1)).rejects.toMatchObject({
      statusCode: 403,
      message: 'Unauthorized to view this order'
    });
  });

  it('paginates and normalizes invalid query options', async () => {
    const order = new Order({
      id: 1,
      userId: 1,
      totalPrice: 100000,
      status: 'PENDING_PAYMENT'
    });

    const repository = {
      findByUserIdWithPagination: jest.fn(async (_userId, options) => {
        expect(options.limit).toBe(10);
        expect(options.offset).toBe(0);
        return {
          data: [order],
          total: 1
        };
      }),
      getItems: jest.fn(async () => [new OrderItem({
        id: 1,
        orderId: 1,
        productId: 3,
        quantity: 2,
        price: 25000
      })])
    };

    const useCase = new GetOrderHistoryUseCase(repository);
    const result = await useCase.execute(1, { page: 0, limit: -10 });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
    expect(result.data[0].items).toHaveLength(1);
  });

  it('cancels an authorized pending order', async () => {
    const existingOrder = new Order({
      id: 5,
      userId: 10,
      totalPrice: 100000,
      status: 'PENDING_PAYMENT'
    });

    const repository = {
      findById: jest.fn(async () => existingOrder),
      update: jest.fn(async (_id, data) => new Order({
        ...existingOrder,
        status: data.status,
        updatedAt: data.updatedAt
      }))
    };

    const useCase = new CancelOrderUseCase(repository);
    const result = await useCase.execute(5, 10);

    expect(repository.update).toHaveBeenCalledWith(5, expect.objectContaining({
      status: 'CANCELLED'
    }));
    expect(result.status).toBe('CANCELLED');
  });
});
