# API Backend - Matheus Personal

## Configuração

### 1. Instalar Dependências
```bash
cd api
npm install
```

### 2. Configurar Banco de Dados
Edite o arquivo `.env` com suas credenciais:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=mp_user
DB_PASSWORD=pwd1234
DB_NAME=mp_database
```

### 3. Iniciar Servidor
```bash
npm run dev  # Desenvolvimento
npm start    # Produção
```

Servidor rodará em: `http://localhost:3001`

---

## Endpoints

### **Usuários**

#### POST /api/users
Criar novo usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(35) 99999-9999",
  "cpf": "123.456.789-00",
  "username": "joaosilva",
  "password": "senha123",
  "countryCode": "+55"
}
```

**Response:**
```json
{
  "success": true,
  "userId": 1,
  "message": "Usuário criado com sucesso"
}
```

#### GET /api/users/:id
Buscar usuário por ID

**Response:**
```json
{
  "success": true,
  "user": {
    "id_user": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    ...
  }
}
```

---

### **Cupons**

#### POST /api/coupons/validate
Validar cupom de desconto

**Body:**
```json
{
  "code": "BEM-VINDO",
  "amount": 300
}
```

**Response:**
```json
{
  "success": true,
  "coupon": {
    "id": 1,
    "code": "BEM-VINDO",
    "discountType": "percent",
    "discountValue": 15
  }
}
```

---

### **Pedidos**

#### POST /api/orders
Criar novo pedido

**Body:**
```json
{
  "userId": 1,
  "items": [
    {
      "name": "PRATA",
      "price": "300",
      "frequency": "3x na semana"
    }
  ],
  "subtotal": 300,
  "discountAmount": 45,
  "totalAmount": 255,
  "paymentMethod": "credit",
  "couponId": 1
}
```

**Response:**
```json
{
  "success": true,
  "orderId": 1,
  "orderNumber": "MP1234567890",
  "message": "Pedido criado com sucesso"
}
```

#### GET /api/orders/:id
Buscar pedido por ID

**Response:**
```json
{
  "success": true,
  "order": {
    "id_order": 1,
    "order_number": "MP1234567890",
    "total_amount": 255,
    ...
  },
  "items": [...]
}
```

---

### **Leads**

#### POST /api/leads
Registrar novo lead

**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@email.com",
  "phone": "(35) 98888-8888",
  "source": "Instagram",
  "message": "Quero saber mais sobre os planos"
}
```

**Response:**
```json
{
  "success": true,
  "leadId": 1,
  "message": "Lead registrado com sucesso"
}
```

---

## Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Credenciais em variáveis de ambiente
- ✅ CORS configurado
- ✅ Transações de banco de dados
- ⚠️ Adicionar autenticação JWT (próxima versão)

---

## Estrutura de Arquivos

```
api/
├── config/
│   └── database.js          # Configuração MySQL
├── controllers/
│   ├── userController.js    # Lógica de usuários
│   ├── couponController.js  # Lógica de cupons
│   ├── orderController.js   # Lógica de pedidos
│   └── leadController.js    # Lógica de leads
├── routes/
│   ├── users.js             # Rotas de usuários
│   ├── coupons.js           # Rotas de cupons
│   ├── orders.js            # Rotas de pedidos
│   └── leads.js             # Rotas de leads
├── .env                     # Variáveis de ambiente
├── package.json
└── server.js                # Servidor principal
```

---

## Próximos Passos

1. Implementar autenticação JWT
2. Adicionar middleware de validação
3. Implementar rate limiting
4. Adicionar logs
5. Testes automatizados
