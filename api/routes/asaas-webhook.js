/**
 * Webhook Asaas — POST /asaas/webhook
 *
 * Valida o token via header "asaas-access-token" e processa eventos de pagamento.
 * Adicione ao server.js:
 *   const asaasWebhook = require('./routes/asaas-webhook');
 *   app.use('/asaas', asaasWebhook);
 */

const express = require('express');
const router  = express.Router();
const db      = require('../config/db'); // ajuste para o seu módulo de banco

const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;

// Mapeamento de eventos Asaas → status interno
const EVENT_STATUS_MAP = {
  PAYMENT_RECEIVED:          'approved',
  PAYMENT_CONFIRMED:         'approved',
  PAYMENT_OVERDUE:           'overdue',
  PAYMENT_DELETED:           'cancelled',
  PAYMENT_RESTORED:          'pending',
  PAYMENT_REFUNDED:          'refunded',
  PAYMENT_PARTIALLY_REFUNDED:'refunded',
  PAYMENT_CHARGEBACK_REQUESTED: 'chargeback',
  PAYMENT_CHARGEBACK_DISPUTE:   'chargeback',
  PAYMENT_AWAITING_CHARGEBACK_REVERSAL: 'chargeback',
  PAYMENT_DUNNING_RECEIVED:  'approved',
  PAYMENT_BANK_SLIP_VIEWED:  null, // sem mudança de status
  PAYMENT_CHECKOUT_VIEWED:   null,
};

router.post('/webhook', async (req, res) => {
  // 1. Valida token
  const token = req.headers['asaas-access-token'];
  if (!WEBHOOK_TOKEN || token !== WEBHOOK_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, payment } = req.body;

  if (!event || !payment) {
    return res.status(400).json({ error: 'Payload inválido' });
  }

  const newStatus = EVENT_STATUS_MAP[event];

  // Eventos informativos sem mudança de status — apenas confirma recebimento
  if (newStatus === null) {
    return res.status(200).json({ received: true });
  }

  // Evento desconhecido
  if (newStatus === undefined) {
    console.warn('[webhook] Evento não mapeado:', event);
    return res.status(200).json({ received: true });
  }

  try {
    const asaasId = payment.id;

    // 2. Atualiza pagamento pelo asaas_id
    await db.query(
      `UPDATE payments SET payment_status = ?, updated_at = NOW() WHERE asaas_id = ?`,
      [newStatus, asaasId]
    );

    // 3. Se aprovado, ativa o usuário vinculado ao pedido
    if (newStatus === 'approved') {
      const [rows] = await db.query(
        `SELECT o.id_user, oi.plan_frequency FROM payments p
         JOIN orders o ON o.id_order = p.id_order
         JOIN order_items oi ON oi.id_order = o.id_order
         WHERE p.asaas_id = ?
         LIMIT 1`,
        [asaasId]
      );

      if (rows.length > 0) {
        const frequency = String(rows[0].plan_frequency || '').toLowerCase();
        const months = ({ monthly: 1, quarterly: 3, semiannual: 6, annual: 12 })[frequency]
          || Number.parseInt(frequency.match(/\d+/)?.[0], 10)
          || 1;
        await db.query(
          `UPDATE users
           SET is_active = 1,
               plan_start = COALESCE(plan_start, CURDATE()),
               plan_renewal = DATE_ADD(GREATEST(COALESCE(plan_renewal, CURDATE()), CURDATE()), INTERVAL ? MONTH),
               updated_at = NOW()
           WHERE id_user = ?`,
          [months, rows[0].id_user]
        );
      }
    }

    console.log(`[webhook] ${event} → ${newStatus} | asaas_id: ${asaasId}`);
    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('[webhook] Erro ao processar evento:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;
