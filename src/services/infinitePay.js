// Serviço de integração com InfinitePay
// Documentação: https://developers.infinitepay.io/

const INFINITEPAY_API_URL = import.meta.env.VITE_INFINITEPAY_API_URL || 'https://api.infinitepay.io/v2';
const INFINITEPAY_API_KEY = import.meta.env.VITE_INFINITEPAY_API_KEY;

export const infinitePayService = {
  // Criar sessão de checkout
  async createCheckoutSession(orderData) {
    try {
      const response = await fetch(`${INFINITEPAY_API_URL}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${INFINITEPAY_API_KEY}`
        },
        body: JSON.stringify({
          amount: Math.round(parseFloat(orderData.amount) * 100), // Converter para centavos
          currency: 'BRL',
          customer: {
            name: orderData.customer.name,
            email: orderData.customer.email,
            phone: orderData.customer.phone,
            document: orderData.customer.cpf.replace(/\D/g, '')
          },
          items: [{
            name: `Plano ${orderData.plan.name}`,
            quantity: 1,
            unit_amount: Math.round(parseFloat(orderData.amount) * 100)
          }],
          payment_methods: ['credit_card', 'debit_card', 'pix'],
          success_url: `${window.location.origin}/confirmation`,
          cancel_url: `${window.location.origin}/checkout`,
          metadata: {
            plan_name: orderData.plan.name,
            plan_frequency: orderData.plan.frequency
          }
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sessão de checkout');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro InfinitePay:', error);
      throw error;
    }
  },

  // Verificar status do pagamento
  async checkPaymentStatus(sessionId) {
    try {
      const response = await fetch(`${INFINITEPAY_API_URL}/checkout/sessions/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${INFINITEPAY_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar status do pagamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      throw error;
    }
  },

  // Criar assinatura recorrente
  async createSubscription(subscriptionData) {
    try {
      const response = await fetch(`${INFINITEPAY_API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${INFINITEPAY_API_KEY}`
        },
        body: JSON.stringify({
          customer: {
            name: subscriptionData.customer.name,
            email: subscriptionData.customer.email,
            phone: subscriptionData.customer.phone,
            document: subscriptionData.customer.cpf.replace(/\D/g, '')
          },
          plan: {
            amount: Math.round(parseFloat(subscriptionData.amount) * 100),
            interval: 'monthly',
            interval_count: 1
          },
          payment_method: subscriptionData.paymentMethod
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar assinatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  }
};

// Função auxiliar para inicializar o checkout no frontend
export const initInfinitePayCheckout = (sessionId) => {
  return new Promise((resolve, reject) => {
    if (!window.InfinitePay) {
      reject(new Error('SDK InfinitePay não carregado'));
      return;
    }

    const checkout = window.InfinitePay.checkout({
      sessionId: sessionId,
      onSuccess: (data) => resolve(data),
      onError: (error) => reject(error),
      onCancel: () => reject(new Error('Pagamento cancelado'))
    });

    checkout.open();
  });
};
