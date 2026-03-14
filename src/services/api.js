const URLS = {
  users:         'http://srv1023256.hstgr.cloud:8001',
  subscriptions: 'http://srv1023256.hstgr.cloud:8002',
  orders:        'http://srv1023256.hstgr.cloud:8003',
  payments:      'http://srv1023256.hstgr.cloud:8004',
  coupons:       'http://srv1023256.hstgr.cloud:8005',
  leads:         'http://srv1023256.hstgr.cloud:8006'
};

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
      const response = await fetchWithTimeout(`${URLS.users}/users`, {
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
      const response = await fetchWithTimeout(`${URLS.users}/users/${userId}`);
      return response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async validateCoupon(code, amount) {
    try {
      const response = await fetchWithTimeout(`${URLS.coupons}/coupons/validate`, {
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
      const response = await fetchWithTimeout(`${URLS.orders}/orders`, {
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
      const response = await fetchWithTimeout(`${URLS.orders}/orders/${orderId}`);
      return response.json();
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async createPayment(paymentData) {
    try {
      const response = await fetchWithTimeout(`${URLS.payments}/payments`, {
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
      const response = await fetchWithTimeout(`${URLS.leads}/leads`, {
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
