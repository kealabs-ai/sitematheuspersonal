const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = {
  // Usuários
  async createUser(userData) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async getUserById(userId) {
    const response = await fetch(`${API_URL}/users/${userId}`);
    return response.json();
  },

  // Cupons
  async validateCoupon(code, amount) {
    const response = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount })
    });
    return response.json();
  },

  // Pedidos
  async createOrder(orderData) {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  async getOrderById(orderId) {
    const response = await fetch(`${API_URL}/orders/${orderId}`);
    return response.json();
  },

  // Leads
  async createLead(leadData) {
    const response = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return response.json();
  }
};

export default api;
