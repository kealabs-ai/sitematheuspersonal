const db = require('../config/database');

exports.createOrder = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    
    const { userId, items, subtotal, discountAmount, totalAmount, paymentMethod, couponId } = req.body;
    
    const orderNumber = 'MP' + Date.now();
    
    const [orderResult] = await connection.query(
      'INSERT INTO orders (order_number, id_user, subtotal, discount_amount, total_amount, payment_method, id_coupon) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [orderNumber, userId, subtotal, discountAmount, totalAmount, paymentMethod, couponId]
    );
    
    const orderId = orderResult.insertId;
    
    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (id_order, plan_name, plan_price, plan_frequency) VALUES (?, ?, ?, ?)',
        [orderId, item.name, item.price, item.frequency]
      );
    }
    
    if (couponId) {
      await connection.query(
        'UPDATE coupons SET usage_count = usage_count + 1 WHERE id_coupon = ?',
        [couponId]
      );
      
      await connection.query(
        'INSERT INTO coupon_usage (id_coupon, id_user, order_id, discount_applied) VALUES (?, ?, ?, ?)',
        [couponId, userId, orderNumber, discountAmount]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      success: true, 
      orderId,
      orderNumber,
      message: 'Pedido criado com sucesso' 
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Erro ao criar pedido:', error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getOrderById = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [orders] = await connection.query('SELECT * FROM orders WHERE id_order = ?', [req.params.id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido não encontrado' });
    }
    
    const [items] = await connection.query('SELECT * FROM order_items WHERE id_order = ?', [req.params.id]);
    
    res.json({ 
      success: true, 
      order: orders[0],
      items 
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
  }
};
