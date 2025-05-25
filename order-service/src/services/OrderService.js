const Order = require('../models/Order');
const UserServiceClient = require('./UserServiceClient');
const { v4: uuidv4 } = require('uuid');

class OrderService {
  constructor(userServiceClient) {
    this.orders = new Map();
    this.userServiceClient = userServiceClient || new UserServiceClient();
  }

  async createOrder(orderData) {
    // Validate user exists and is active
    const isValidUser = await this.userServiceClient.validateUser(orderData.userId);
    if (!isValidUser) {
      throw new Error('Invalid or inactive user');
    }

    const order = new Order(
      uuidv4(),
      orderData.userId,
      orderData.items,
      orderData.totalAmount,
      'pending'
    );
    
    order.validate();
    this.orders.set(order.id, order);
    return order;
  }

  getOrderById(id) {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  getAllOrders() {
    return Array.from(this.orders.values());
  }

  getOrdersByUserId(userId) {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async updateOrderStatus(orderId, newStatus) {
    const order = this.getOrderById(orderId);
    
    // For certain status changes, re-validate user
    if (newStatus === 'confirmed') {
      const isValidUser = await this.userServiceClient.validateUser(order.userId);
      if (!isValidUser) {
        throw new Error('Cannot confirm order: user is inactive');
      }
    }
    
    order.updateStatus(newStatus);
    return order;
  }

  addItemToOrder(orderId, item) {
    const order = this.getOrderById(orderId);
    if (order.status !== 'pending') {
      throw new Error('Cannot modify confirmed order');
    }
    order.addItem(item);
    return order;
  }

  removeItemFromOrder(orderId, itemIndex) {
    const order = this.getOrderById(orderId);
    if (order.status !== 'pending') {
      throw new Error('Cannot modify confirmed order');
    }
    order.removeItem(itemIndex);
    return order;
  }

  cancelOrder(orderId) {
    const order = this.getOrderById(orderId);
    if (!order.canBeCancelled()) {
      throw new Error('Order cannot be cancelled');
    }
    order.updateStatus('cancelled');
    return order;
  }

  async getOrderWithUserDetails(orderId) {
    const order = this.getOrderById(orderId);
    try {
      const user = await this.userServiceClient.getUserById(order.userId);
      return {
        ...order,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };
    } catch (error) {
      return {
        ...order,
        user: null,
        userError: error.message
      };
    }
  }

  getOrderStatistics() {
    const orders = this.getAllOrders();
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0)
    };
  }
}

module.exports = OrderService;
