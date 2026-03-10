const db = require('../config/database');

exports.validateCoupon = async (req, res) => {
  let connection;
  try {
    const { code, amount } = req.body;
    
    connection = await db.getConnection();
    
    const [rows] = await connection.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND valid_from <= CURDATE() AND valid_until >= CURDATE()',
      [code.toUpperCase()]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Cupom inválido ou expirado' });
    }
    
    const coupon = rows[0];
    
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Cupom esgotado' });
    }
    
    if (amount < coupon.min_purchase_amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Valor mínimo de compra: R$ ${coupon.min_purchase_amount}` 
      });
    }
    
    res.json({ 
      success: true, 
      coupon: {
        id: coupon.id_coupon,
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value
      }
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
  }
};
