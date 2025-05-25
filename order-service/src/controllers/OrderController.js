const OrderService = require('../services/OrderService');

class OrderController {
  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = async (req, res) => {
    try {
      const order = await this.orderService.createOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  getOrder = async (req, res) => {
    try {
      const order = await this.orderService.getOrderWithUserDetails(req.params.id);
      res.json(order);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  getAllOrders = (req, res) => {
    try {
      const orders = this.orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  getOrdersByUser = (req, res) => {
    try {
      const orders = this.orderService.getOrdersByUserId(req.params.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  updateOrderStatus = async (req, res) => {
    try {
      const order = await this.orderService.updateOrderStatus(req.params.id, req.body.status);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  addItem = (req, res) => {
    try {
      const order = this.orderService.addItemToOrder(req.params.id, req.body);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  removeItem = (req, res) => {
    try {
      const order = this.orderService.removeItemFromOrder(req.params.id, parseInt(req.params.itemIndex));
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  cancelOrder = (req, res) => {
    try {
      const order = this.orderService.cancelOrder(req.params.id);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  getStatistics = (req, res) => {
    try {
      const stats = this.orderService.getOrderStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
}

module.exports = OrderController;
