const request = require('supertest');
const nock = require('nock');
const app = require('../src/index');

describe('Order Controller', () => {
  const userServiceUrl = 'http://localhost:3001';

  afterEach(() => {
    nock.cleanAll();
  });

  test('POST /orders should create an order', async () => {
    // Mock user validation
    nock(userServiceUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 2 }],
      totalAmount: 20
    };

    const response = await request(app)
      .post('/orders')
      .send(orderData)
      .expect(201);

    expect(response.body.userId).toBe('user1');
    expect(response.body.totalAmount).toBe(20);
    expect(response.body.status).toBe('pending');
  });

  test('POST /orders should fail with invalid user', async () => {
    // Mock user validation failure
    nock(userServiceUrl)
      .get('/users/invalid-user/status')
      .reply(404, { error: 'User not found' });

    const orderData = {
      userId: 'invalid-user',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const response = await request(app)
      .post('/orders')
      .send(orderData)
      .expect(400);

    expect(response.body.error).toBe('Invalid or inactive user');
  });

  test('GET /orders/:id should return order with user details', async () => {
    // Mock user validation for order creation
    nock(userServiceUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    // Mock user details for order retrieval
    nock(userServiceUrl)
      .get('/users/user1')
      .reply(200, { id: 'user1', name: 'John Doe', email: 'john@example.com' });

    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const createResponse = await request(app)
      .post('/orders')
      .send(orderData);

    const orderId = createResponse.body.id;

    const response = await request(app)
      .get(`/orders/${orderId}`)
      .expect(200);

    expect(response.body.userId).toBe('user1');
    expect(response.body.user.name).toBe('John Doe');
    expect(response.body.user.email).toBe('john@example.com');
  });

  test('PUT /orders/:id/status should update order status', async () => {
    // Mock user validation for order creation
    nock(userServiceUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    // Mock user validation for status update
    nock(userServiceUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const createResponse = await request(app)
      .post('/orders')
      .send(orderData);

    const orderId = createResponse.body.id;

    const response = await request(app)
      .put(`/orders/${orderId}/status`)
      .send({ status: 'confirmed' })
      .expect(200);

    expect(response.body.status).toBe('confirmed');
  });

  test('GET /orders/stats should return order statistics', async () => {
    // Mock user validation for multiple orders
    nock(userServiceUrl)
      .get('/users/user1/status')
      .times(2)
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    const orderData1 = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const orderData2 = {
      userId: 'user1',
      items: [{ name: 'Product 2', price: 20, quantity: 1 }],
      totalAmount: 20
    };

    await request(app).post('/orders').send(orderData1);
    await request(app).post('/orders').send(orderData2);

    const response = await request(app)
      .get('/orders/stats')
      .expect(200);

    expect(response.body.total).toBe(2);
    expect(response.body.pending).toBe(2);
    expect(response.body.totalRevenue).toBe(30);
  });

  test('PUT /orders/:id/cancel should cancel order', async () => {
    // Mock user validation
    nock(userServiceUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    const createResponse = await request(app)
      .post('/orders')
      .send(orderData);

    const orderId = createResponse.body.id;

    const response = await request(app)
      .put(`/orders/${orderId}/cancel`)
      .expect(200);

    expect(response.body.status).toBe('cancelled');
  });

  test('GET /users/:userId/orders should return user orders', async () => {
    // Mock user validation
    nock(userServiceUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    const orderData = {
      userId: 'user1',
      items: [{ name: 'Product 1', price: 10, quantity: 1 }],
      totalAmount: 10
    };

    await request(app)
      .post('/orders')
      .send(orderData);

    const response = await request(app)
      .get('/users/user1/orders')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].userId).toBe('user1');
  });
});
