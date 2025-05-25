const nock = require('nock');
const UserServiceClient = require('../src/services/UserServiceClient');

describe('UserServiceClient', () => {
  let userServiceClient;
  const baseUrl = 'http://localhost:3001';

  beforeEach(() => {
    userServiceClient = new UserServiceClient(baseUrl);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('should get user by id', async () => {
    const userData = { id: 'user1', name: 'John Doe', email: 'john@example.com' };
    
    nock(baseUrl)
      .get('/users/user1')
      .reply(200, userData);

    const user = await userServiceClient.getUserById('user1');
    expect(user).toEqual(userData);
  });

  test('should throw error for non-existent user', async () => {
    nock(baseUrl)
      .get('/users/non-existent')
      .reply(404, { error: 'User not found' });

    await expect(userServiceClient.getUserById('non-existent'))
      .rejects.toThrow('User not found');
  });

  test('should get user status', async () => {
    const statusData = { id: 'user1', status: 'active', isActive: true };
    
    nock(baseUrl)
      .get('/users/user1/status')
      .reply(200, statusData);

    const status = await userServiceClient.getUserStatus('user1');
    expect(status).toEqual(statusData);
  });

  test('should validate active user', async () => {
    nock(baseUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'active', isActive: true });

    const isValid = await userServiceClient.validateUser('user1');
    expect(isValid).toBe(true);
  });

  test('should invalidate inactive user', async () => {
    nock(baseUrl)
      .get('/users/user1/status')
      .reply(200, { id: 'user1', status: 'inactive', isActive: false });

    const isValid = await userServiceClient.validateUser('user1');
    expect(isValid).toBe(false);
  });

  test('should handle user service error during validation', async () => {
    nock(baseUrl)
      .get('/users/user1/status')
      .reply(500, { error: 'Internal server error' });

    const isValid = await userServiceClient.validateUser('user1');
    expect(isValid).toBe(false);
  });

  test('should check user service health', async () => {
    nock(baseUrl)
      .get('/health')
      .reply(200, { status: 'healthy' });

    const isHealthy = await userServiceClient.isUserServiceHealthy();
    expect(isHealthy).toBe(true);
  });

  test('should detect unhealthy user service', async () => {
    nock(baseUrl)
      .get('/health')
      .reply(500);

    const isHealthy = await userServiceClient.isUserServiceHealthy();
    expect(isHealthy).toBe(false);
  });
});
