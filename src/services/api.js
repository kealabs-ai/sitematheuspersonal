const BASE = '/api';

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

const post = (url, body) => fetchWithTimeout(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

const get = (url) => fetchWithTimeout(url);

const api = {
  // Users
  async createUser(userData) {
    try {
      const res = await post(`${BASE}/users/users`, userData);
      return res.json();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getUserById(userId) {
    try {
      const res = await get(`${BASE}/users/${userId}`);
      return res.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async updateUser(userId, userData) {
    try {
      const res = await post(`${BASE}/users/${userId}/update`, userData);
      return res.json();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async deleteUser(userId) {
    try {
      const res = await post(`${BASE}/users/${userId}/delete`, {});
      return res.json();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  // Subscriptions
  async createSubscription(data) {
    try {
      const res = await post(`${BASE}/subscriptions/subscriptions`, data);
      return res.json();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getSubscriptionByUser(userId) {
    try {
      const res = await get(`${BASE}/subscriptions/subscriptions/user/${userId}`);
      return res.json();
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async updateSubscription(subId, data) {
    try {
      const res = await post(`${BASE}/subscriptions/subscriptions/${subId}/update`, data);
      return res.json();
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async cancelSubscription(subId) {
    try {
      const res = await post(`${BASE}/subscriptions/subscriptions/${subId}/cancel`, {});
      return res.json();
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  // Orders
  async createOrder(orderData) {
    try {
      const res = await post(`${BASE}/orders/orders`, orderData);
      return res.json();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getOrderById(orderId) {
    try {
      const res = await get(`${BASE}/orders/orders/${orderId}`);
      return res.json();
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getOrdersByUser(userId) {
    try {
      const res = await get(`${BASE}/orders/orders/user/${userId}`);
      return res.json();
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  // Payments
  async createPayment(paymentData) {
    try {
      const res = await post(`${BASE}/payments/payments`, paymentData);
      return res.json();
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async approvePayment(paymentId) {
    try {
      const res = await post(`${BASE}/payments/payments/${paymentId}/approve`, {});
      return res.json();
    } catch (error) {
      console.error('Erro ao aprovar pagamento:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async rejectPayment(paymentId) {
    try {
      const res = await post(`${BASE}/payments/payments/${paymentId}/reject`, {});
      return res.json();
    } catch (error) {
      console.error('Erro ao rejeitar pagamento:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getPaymentByOrder(orderId) {
    try {
      const res = await get(`${BASE}/payments/payments/order/${orderId}`);
      return res.json();
    } catch (error) {
      console.error('Erro ao buscar pagamento do pedido:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async createInfinitePayPayment(paymentData) {
    try {
      const res = await post(`${BASE}/payments/payments/infinitepay/create`, paymentData);
      return res.json();
    } catch (error) {
      console.error('Erro ao criar pagamento InfinitePay:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async updatePaymentTransaction(paymentId, data) {
    try {
      const res = await post(`${BASE}/payments/payments/${paymentId}/update-transaction`, data);
      return res.json();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  // Coupons
  async validateCoupon(code, amount) {
    try {
      const res = await get(`${BASE}/coupons/coupons/${code}`);
      return res.json();
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async useCoupon(couponId, data) {
    try {
      const res = await post(`${BASE}/coupons/coupons/${couponId}/use`, data);
      return res.json();
    } catch (error) {
      console.error('Erro ao usar cupom:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  // Leads
  async createLead(leadData) {
    try {
      const res = await post(`${BASE}/leads/leads`, leadData);
      return res.json();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },

  async getLeadById(leadId) {
    try {
      const res = await get(`${BASE}/leads/leads/${leadId}`);
      return res.json();
    } catch (error) {
      console.error('Erro ao buscar lead:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }
};

export default api;
