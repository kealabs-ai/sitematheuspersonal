const BASE_URL = 'https://srv1023256.hstgr.cloud/api';

const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const api = {
  async createUser(userData) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return response.json();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getUserById(userId) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/users/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async validateCoupon(code, amount) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount })
      });
      return response.json();
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async createOrder(orderData) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return response.json();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/orders/${orderId}`);
      return response.json();
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async createPayment(paymentData) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      return response.json();
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async createLead(leadData) {
    try {
      const response = await fetchWithTimeout(`${BASE_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      return response.json();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }
};

export default api;
