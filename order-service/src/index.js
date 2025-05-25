const express = require('express');
const cors = require('cors');
const OrderController = require('./controllers/OrderController');

const app = express();
const orderController = new OrderController();

app.use(cors());
app.use(express.json());

// Order routes
app.post('/orders', orderController.createOrder);
app.get('/orders', orderController.getAllOrders);
app.get('/orders/stats', orderController.getStatistics);
app.get('/orders/:id', orderController.getOrder);
app.put('/orders/:id/status', orderController.updateOrderStatus);
app.post('/orders/:id/items', orderController.addItem);
app.delete('/orders/:id/items/:itemIndex', orderController.removeItem);
app.put('/orders/:id/cancel', orderController.cancelOrder);
app.get('/users/:userId/orders', orderController.getOrdersByUser);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'order-service' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});

module.exports = app;
