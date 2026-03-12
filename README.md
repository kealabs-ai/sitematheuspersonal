# Matheus Personal - Sistema de Cadastro e Pagamento

## Configuração do Ambiente

### Desenvolvimento Local

1. **Instalar dependências do frontend:**
```bash
npm install
```

2. **Instalar dependências do backend:**
```bash
cd api
npm install
```

3. **Configurar variáveis de ambiente:**

Criar arquivo `.env.local` na raiz do projeto:
```
VITE_API_URL=http://localhost:3001/api
```

Criar arquivo `.env` na pasta `api/`:
```
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
PORT=3001
NODE_ENV=development
```

4. **Iniciar o backend:**
```bash
cd api
npm start
```

5. **Iniciar o frontend (em outro terminal):**
```bash
npm run dev
```

### Produção (Hostinger)

1. **Build do frontend:**
```bash
npm run build
```

2. **Configurar variáveis de ambiente:**

Arquivo `.env` na raiz:
```
VITE_API_URL=https://matheuspersonal.com.br/api
```

Arquivo `.env` na pasta `api/`:
```
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
PORT=3001
NODE_ENV=production
```

3. **Deploy:**
- Frontend: Upload da pasta `dist/` para o servidor web
- Backend: Upload da pasta `api/` e executar `npm install && npm start`

## Estrutura do Projeto

```
/
├── api/                    # Backend Node.js/Express
│   ├── config/            # Configurações (database)
│   ├── controllers/       # Lógica de negócio
│   ├── routes/           # Rotas da API
│   └── server.js         # Servidor Express
├── src/                   # Frontend React
│   ├── services/         # Serviços (API, PIX)
│   ├── Register.jsx      # Página de cadastro
│   ├── Checkout.jsx      # Página de pagamento
│   └── ...
└── database.sql          # Schema do banco de dados
```

## Endpoints da API

- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `POST /api/coupons/validate` - Validar cupom
- `POST /api/orders` - Criar pedido
- `GET /api/orders/:id` - Buscar pedido
- `POST /api/leads` - Criar lead

## Tecnologias

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express, MySQL
- **Pagamento:** PIX (pix-utils)
- **Segurança:** bcryptjs, CORS
