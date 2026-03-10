const db = require('../config/database');

exports.createLead = async (req, res) => {
  let connection;
  try {
    const { name, email, phone, source, message } = req.body;
    
    connection = await db.getConnection();
    
    const [result] = await connection.query(
      'INSERT INTO leads (name, email, phone, source, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, source, message]
    );
    
    res.status(201).json({ 
      success: true, 
      leadId: result[0].insertId,
      message: 'Lead registrado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar lead:', error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
  }
};
