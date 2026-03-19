const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  let connection;
  try {
    const { name, email, phone, cpf, username, password, countryCode, birth_date } = req.body;
    
    if (!name || !email || !phone || !cpf || !username || !password) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
    }
    
    connection = await db.getConnection();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await connection.query(
      'INSERT INTO users (name, email, phone, cpf, username, password, country_code, birth_date, cep, address, number, neighborhood, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "", "", "", "", "", "")',
      [name, email, phone, cpf, username, hashedPassword, countryCode || '+55', birth_date || null]
    );
    
    res.status(201).json({ 
      success: true, 
      userId: result.insertId,
      message: 'Usuário criado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getUserById = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM users WHERE id_user = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
    
    const user = rows[0];
    delete user.password;
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
  }
};
