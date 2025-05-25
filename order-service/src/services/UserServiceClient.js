const axios = require('axios');

class UserServiceClient {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 5000
    });
  }

  async getUserById(userId) {
    try {
      const response = await this.client.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error('Failed to fetch user data');
    }
  }

  async getUserStatus(userId) {
    try {
      const response = await this.client.get(`/users/${userId}/status`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error('Failed to fetch user status');
    }
  }

  async validateUser(userId) {
    try {
      const userStatus = await this.getUserStatus(userId);
      return userStatus.isActive;
    } catch (error) {
      return false;
    }
  }

  async isUserServiceHealthy() {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = UserServiceClient;
