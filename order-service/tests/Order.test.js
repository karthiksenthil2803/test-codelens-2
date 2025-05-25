const Order = require('../src/models/Order');

describe('Order Model', () => {
  test('should create a valid order', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 2 }];
    const order = new Order('1', 'user1', items, 20);
    
    expect(order.userId).toBe('user1');
    expect(order.items).toEqual(items);
    expect(order.totalAmount).toBe(20);
    expect(order.status).toBe('pending');
  });

  test('should validate order data', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 1 }];
    const order = new Order('1', 'user1', items, 10);
    expect(() => order.validate()).not.toThrow();
  });

  test('should throw error for missing user ID', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 1 }];
    const order = new Order('1', '', items, 10);
    expect(() => order.validate()).toThrow('User ID is required');
  });

  test('should throw error for empty items', () => {
    const order = new Order('1', 'user1', [], 0);
    expect(() => order.validate()).toThrow('Order must have at least one item');
  });

  test('should add item and recalculate total', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 1 }];
    const order = new Order('1', 'user1', items, 10);
    
    order.addItem({ name: 'Product 2', price: 15, quantity: 2 });
    expect(order.items).toHaveLength(2);
    expect(order.totalAmount).toBe(40);
  });

  test('should remove item and recalculate total', () => {
    const items = [
      { name: 'Product 1', price: 10, quantity: 1 },
      { name: 'Product 2', price: 15, quantity: 2 }
    ];
    const order = new Order('1', 'user1', items, 40);
    
    order.removeItem(1);
    expect(order.items).toHaveLength(1);
    expect(order.totalAmount).toBe(10);
  });

  test('should update status with valid transitions', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 1 }];
    const order = new Order('1', 'user1', items, 10);
    
    order.updateStatus('confirmed');
    expect(order.status).toBe('confirmed');
    
    order.updateStatus('shipped');
    expect(order.status).toBe('shipped');
  });

  test('should throw error for invalid status transition', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 1 }];
    const order = new Order('1', 'user1', items, 10);
    
    expect(() => order.updateStatus('delivered')).toThrow('Cannot transition from pending to delivered');
  });

  test('should check if order can be cancelled', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 1 }];
    const order = new Order('1', 'user1', items, 10);
    
    expect(order.canBeCancelled()).toBe(true);
    
    order.updateStatus('confirmed');
    expect(order.canBeCancelled()).toBe(true);
    
    order.updateStatus('shipped');
    expect(order.canBeCancelled()).toBe(false);
  });

  test('should check if order is completed', () => {
    const items = [{ name: 'Product 1', price: 10, quantity: 1 }];
    const order = new Order('1', 'user1', items, 10);
    
    expect(order.isCompleted()).toBe(false);
    
    order.updateStatus('cancelled');
    expect(order.isCompleted()).toBe(true);
  });
});
