# 🏋️ Matheus Personal - Sistema de Cadastro e Pagamento

Sistema completo de cadastro de alunos e processamento de pagamentos via PIX.

## 🚀 Deploy Automático (Produção)

O projeto está configurado para **deploy automático via Git** na Hostinger.

### Como fazer deploy:
```bash
git add .
git commit -m "sua mensagem"
git push origin main
```

A Hostinger detecta o push e executa automaticamente:
1. `npm install` - Instala dependências
2. `npm run build` - Build do frontend + instala deps da API
3. `npm start` - Inicia servidor (frontend + API juntos)

📖 **Guia completo:** [DEPLOY_GIT_AUTO.md](./DEPLOY_GIT_AUTO.md)

---

## 💻 Desenvolvimento Local

### 1. Instalar dependências

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd api
npm install
```

### 2. Configurar ambiente local

Criar `api/.env.development`:
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
PORT=3001
NODE_ENV=development
```

### 3. Iniciar servidores

**Opção A - Separado (Recomendado):**
```bash
# Terminal 1 - Backend
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

**Opção B - Juntos (Windows):**
```bash
npm run dev:all
```

### 4. Acessar aplicação

- Frontend: http://localhost:5173
- API: http://localhost:3001/api

---

## 📁 Estrutura do Projeto

```
MatheusPersonal/
├── src/                    # Frontend React
│   ├── components/        # Componentes reutilizáveis
│   ├── services/         # Serviços (API, PIX)
│   ├── Register.jsx      # Página de cadastro
│   ├── Checkout.jsx      # Página de pagamento
│   └── App.jsx           # Componente principal
├── api/                   # Backend Node.js/Express
│   ├── server.js         # Servidor (serve frontend + API)
│   ├── config/           # Configurações (database)
│   ├── controllers/      # Lógica de negócio
│   └── routes/           # Rotas da API
├── dist/                  # Build do frontend (gerado)
├── package.json          # Deps do frontend
└── vite.config.js        # Config do Vite
```

---

## 🔌 Endpoints da API

### Usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário por ID

### Cupons
- `POST /api/coupons/validate` - Validar cupom de desconto

### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders/:id` - Buscar pedido por ID

### Leads
- `POST /api/leads` - Criar lead

### Health Check
- `GET /api/health` - Verificar status da API

---

## 🛠️ Tecnologias

### Frontend
- **React** - Biblioteca UI
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **React Router** - Roteamento
- **Framer Motion** - Animações
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **MySQL2** - Cliente MySQL
- **bcryptjs** - Hash de senhas
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Variáveis de ambiente

### Pagamento
- **pix-utils** - Geração de PIX
- **qrcode.react** - QR Code

---

## 🌐 URLs de Produção

- **Frontend:** https://matheuspersonal.com.br
- **API:** https://matheuspersonal.com.br/api
- **Health Check:** https://matheuspersonal.com.br/api/health

---

## 📝 Scripts Disponíveis

### Frontend (raiz)
```bash
npm run dev          # Inicia Vite dev server
npm run build        # Build produção (frontend + API deps)
npm start            # Inicia servidor produção
npm run preview      # Preview do build
```

### Backend (api/)
```bash
npm start            # Inicia servidor produção
npm run dev          # Inicia com .env.development
npm run check-deploy # Verifica config antes do deploy
```

---

## 🔐 Variáveis de Ambiente

### Desenvolvimento (`api/.env.development`)
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
PORT=3001
NODE_ENV=development
```

### Produção (`api/.env`)
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
NODE_ENV=production
# PORT não é definido - Hostinger atribui automaticamente
```

---

## 🧪 Testes

### Testar API localmente:
```bash
curl http://localhost:3001/api/health
```

### Testar API em produção:
```bash
curl https://matheuspersonal.com.br/api/health
```

---

## 📚 Documentação

- [DEPLOY_GIT_AUTO.md](./DEPLOY_GIT_AUTO.md) - Deploy automático via Git
- [DEPLOY_HOSTINGER_SIMPLIFICADO.md](./DEPLOY_HOSTINGER_SIMPLIFICADO.md) - Deploy manual
- [DEPLOY_RAPIDO.md](./DEPLOY_RAPIDO.md) - Checklist rápido
- [api/README.md](./api/README.md) - Documentação da API

---

## 🔄 Workflow de Desenvolvimento

1. **Criar branch para feature:**
```bash
git checkout -b feature/nome-da-feature
```

2. **Desenvolver e testar localmente:**
```bash
npm run dev        # Frontend
npm run dev:api    # Backend
```

3. **Commit e push:**
```bash
git add .
git commit -m "feat: descrição da feature"
git push origin feature/nome-da-feature
```

4. **Merge para main (deploy automático):**
```bash
git checkout main
git merge feature/nome-da-feature
git push origin main  # ← Deploy automático!
```

5. **Verificar deploy:**
- Painel Hostinger → Git → Status
- Testar: https://matheuspersonal.com.br

---

## ❌ Troubleshooting

### API não conecta ao banco
```bash
# Verificar credenciais
cat api/.env

# Testar conexão
mysql -h srv1078.hstgr.io -u u549746795_matheusmp -p
```

### Build falha
```bash
# Limpar e reinstalar
rm -rf node_modules api/node_modules
npm install
cd api && npm install
```

### Deploy não atualiza
```bash
# Verificar logs no painel Hostinger
# Ou via SSH:
ssh u549746795@srv1078.hstgr.io -p 65002
cd ~/public_html
tail -f logs/*.log
```

---

## 🆘 Suporte

- **Hostinger:** Chat no painel
- **Documentação:** Ver arquivos DEPLOY_*.md
- **Logs:** Painel → Node.js → Ver Logs

---

## 📄 Licença

Projeto privado - Matheus Personal © 2024

---

## 👨‍💻 Desenvolvido por

Kealabs - Desenvolvimento Web

---

**Status:** 🟢 Em Produção

**Última atualização:** Janeiro 2024
