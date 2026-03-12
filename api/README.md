# API - Matheus Personal

Backend Node.js/Express para o sistema de cadastro e pagamento.

## 🚀 Desenvolvimento Local

### Instalar dependências:
```bash
npm install
```

### Configurar variáveis de ambiente:
Criar arquivo `.env`:
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
PORT=3001
NODE_ENV=development
```

### Iniciar servidor:
```bash
npm start        # Produção
npm run dev      # Desenvolvimento (com nodemon)
```

## 📦 Deploy para Produção

### 1. Verificar configuração:
```bash
npm run check-deploy
```

### 2. Seguir guia de deploy:
Ver arquivo `DEPLOY_HOSTINGER.md` na raiz do projeto.

## 🔌 Endpoints

- `GET /api/health` - Health check
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `POST /api/coupons/validate` - Validar cupom
- `POST /api/orders` - Criar pedido
- `GET /api/orders/:id` - Buscar pedido
- `POST /api/leads` - Criar lead

## 📁 Estrutura

```
api/
├── server.js              # Servidor Express
├── package.json           # Dependências
├── ecosystem.config.js    # Configuração PM2
├── check-deploy.js        # Script de verificação
├── config/
│   └── database.js        # Configuração do banco
├── controllers/
│   ├── userController.js
│   ├── couponController.js
│   ├── orderController.js
│   └── leadController.js
└── routes/
    ├── users.js
    ├── coupons.js
    ├── orders.js
    └── leads.js
```

## 🔧 Tecnologias

- **Express** - Framework web
- **MySQL2** - Cliente MySQL
- **bcryptjs** - Hash de senhas
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Variáveis de ambiente
