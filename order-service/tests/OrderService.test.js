const OrderService = require('../src/services/OrderService');
const UserServiceClient = require('../src/services/UserServiceClient');

// Mock UserServiceClient
jest.mock('../src/services/UserServiceClient');

describe('OrderService', () => {
  let orderService;
  let mockUserServiceClient;

  beforeEach(() => {
    mockUserServiceClient = new UserServiceClient();
    orderService = new OrderService(mockUserServiceClient);
    
    // Default mock behavior
    mockUserServiceClient.validateUser.mockResolvedValue(true);
    mockUserServiceClient.getUserById.mockResolvedValue({
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com'
    });
  });

  test('should create order with valid user', async () => {
    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 2 }],
      totalAmount: 20
    };

    const order = await orderService.createOrder(orderData);
    
    expect(order.userId).toBe('user1');
    expect(order.totalAmount).toBe(20);
    expect(mockUserServiceClient.validateUser).toHaveBeenCalledWith('user1');
  });

  test('should not create order with invalid user', async () => {
    mockUserServiceClient.validateUser.mockResolvedValue(false);
    
    const orderData = {
      userId: 'invalid-user',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    await expect(orderService.createOrder(orderData)).rejects.toThrow('Invalid or inactive user');
  });

  test('should get order by id', async () => {
    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const createdOrder = await orderService.createOrder(orderData);
    const order = orderService.getOrderById(createdOrder.id);
    
    expect(order).toEqual(createdOrder);
  });

  test('should get orders by user id', async () => {
    const orderData1 = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };
    
    const orderData2 = {
      userId: 'user2',
      items: [{ name: 'Product 2', price: 15, quantity: 1 }],
      totalAmount: 15
    };

    await orderService.createOrder(orderData1);
    await orderService.createOrder(orderData2);
    
    const user1Orders = orderService.getOrdersByUserId('user1');
    expect(user1Orders).toHaveLength(1);
    expect(user1Orders[0].userId).toBe('user1');
  });

  test('should update order status with user validation', async () => {
    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const order = await orderService.createOrder(orderData);
    const updatedOrder = await orderService.updateOrderStatus(order.id, 'confirmed');
    
    expect(updatedOrder.status).toBe('confirmed');
    expect(mockUserServiceClient.validateUser).toHaveBeenCalledTimes(2); // Create + Update
  });

  test('should not confirm order with inactive user', async () => {
    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const order = await orderService.createOrder(orderData);
    
    // User becomes inactive
    mockUserServiceClient.validateUser.mockResolvedValue(false);
    
    await expect(orderService.updateOrderStatus(order.id, 'confirmed'))
      .rejects.toThrow('Cannot confirm order: user is inactive');
  });

  test('should get order with user details', async () => {
    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const order = await orderService.createOrder(orderData);
    const orderWithUser = await orderService.getOrderWithUserDetails(order.id);
    
    expect(orderWithUser.user.name).toBe('John Doe');
    expect(orderWithUser.user.email).toBe('john@example.com');
  });

  test('should handle user service error gracefully', async () => {
    mockUserServiceClient.getUserById.mockRejectedValue(new Error('User service unavailable'));
    
    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const order = await orderService.createOrder(orderData);
    const orderWithUser = await orderService.getOrderWithUserDetails(order.id);
    
    expect(orderWithUser.user).toBeNull();
    expect(orderWithUser.userError).toBe('User service unavailable');
  });

  test('should cancel order', async () => {
    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const order = await orderService.createOrder(orderData);
    const cancelledOrder = orderService.cancelOrder(order.id);
    
    expect(cancelledOrder.status).toBe('cancelled');
  });

  test('should get order statistics', async () => {
    const orderData1 = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };
    
    const orderData2 = {
      userId: 'user2',
      items: [{ name: 'Product 2', price: 20, quantity: 1 }],
      totalAmount: 20
    };

    const order1 = await orderService.createOrder(orderData1);
    const order2 = await orderService.createOrder(orderData2);
    
    await orderService.updateOrderStatus(order1.id, 'confirmed');
    orderService.cancelOrder(order2.id);
    
    const stats = orderService.getOrderStatistics();
    
    expect(stats.total).toBe(2);
    expect(stats.confirmed).toBe(1);
    expect(stats.cancelled).toBe(1);
    expect(stats.totalRevenue).toBe(10); // Only confirmed orders
  });
});
