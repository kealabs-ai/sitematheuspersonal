# 🚀 Guia de Deploy - Hostinger

## 📋 Pré-requisitos

- Acesso SSH à Hostinger
- Node.js configurado no painel da Hostinger
- Banco de dados MySQL criado

## 🔧 Preparação Local

### 1. Build do Frontend
```bash
npm run build
```

### 2. Preparar arquivos da API
Certifique-se de que o arquivo `.env.production` está configurado:
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
NODE_ENV=production
```

## 📤 Upload dos Arquivos

### Via FTP/SFTP ou File Manager da Hostinger:

1. **Frontend (pasta dist/):**
   - Upload TODO o conteúdo da pasta `dist/` para `public_html/`
   - Arquivos: index.html, assets/, etc.

2. **Backend (pasta api/):**
   - Criar pasta `api/` dentro de `public_html/`
   - Upload dos arquivos:
     - server.js
     - package.json
     - ecosystem.config.js
     - config/
     - controllers/
     - routes/

3. **Arquivo .env:**
   - Renomear `.env.production` para `.env`
   - Upload para `public_html/api/.env`

## ⚙️ Configuração no Painel da Hostinger

### 1. Configurar Aplicação Node.js

1. Acesse: **Avançado** → **Node.js**
2. Clique em **Criar Aplicação**
3. Configure:
   - **Versão do Node.js:** 18.x ou 20.x
   - **Diretório da Aplicação:** `/home/u549746795/public_html/api`
   - **Arquivo de Entrada:** `server.js`
   - **Modo:** Production
   - **Porta:** (deixe em branco - será atribuída automaticamente)

4. Clique em **Criar**

### 2. Instalar Dependências via SSH

```bash
# Conectar via SSH
ssh u549746795@srv1078.hstgr.io

# Navegar até a pasta da API
cd ~/public_html/api

# Instalar dependências
npm install --production

# Criar pasta de logs (para PM2)
mkdir -p logs
```

### 3. Iniciar a Aplicação

**Opção A: Via Painel da Hostinger**
- Clique no botão **Start Application** no painel Node.js

**Opção B: Via PM2 (Recomendado)**
```bash
# Instalar PM2 globalmente (se não estiver instalado)
npm install -g pm2

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar automaticamente
pm2 startup

# Verificar status
pm2 status
pm2 logs matheus-personal-api
```

## 🧪 Testes Pós-Deploy

### 1. Testar API
```bash
curl https://matheuspersonal.com.br/api/health
```

Resposta esperada:
```json
{
  "status": "OK",
  "message": "API está funcionando",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Testar Frontend
Acesse: https://matheuspersonal.com.br

### 3. Testar Integração Completa
- Preencher formulário de cadastro
- Verificar geração de PIX
- Confirmar criação de pedido

## 🔍 Troubleshooting

### API não inicia
```bash
# Verificar logs
pm2 logs matheus-personal-api

# Verificar status
pm2 status

# Reiniciar
pm2 restart matheus-personal-api
```

### Erro de conexão com banco
```bash
# Testar conexão MySQL
mysql -h srv1078.hstgr.io -u u549746795_matheusmp -p

# Verificar .env
cat ~/public_html/api/.env
```

### Erro 502 Bad Gateway
- Verificar se a aplicação Node.js está rodando
- Verificar logs no painel da Hostinger
- Reiniciar aplicação

### CORS Error
- Verificar se a URL do frontend está em `allowedOrigins` no server.js
- Verificar se a API está acessível

## 📊 Monitoramento

### Comandos PM2 úteis:
```bash
pm2 status                          # Status de todas as apps
pm2 logs matheus-personal-api       # Ver logs em tempo real
pm2 logs matheus-personal-api --lines 100  # Ver últimas 100 linhas
pm2 restart matheus-personal-api    # Reiniciar app
pm2 stop matheus-personal-api       # Parar app
pm2 delete matheus-personal-api     # Remover app
pm2 monit                           # Monitor interativo
```

### Verificar uso de recursos:
```bash
pm2 monit
```

## 🔄 Atualizações Futuras

### Para atualizar o Frontend:
```bash
# Local
npm run build

# Upload do conteúdo de dist/ para public_html/
```

### Para atualizar a API:
```bash
# Upload dos arquivos alterados via FTP

# Via SSH
cd ~/public_html/api
npm install --production
pm2 restart matheus-personal-api
```

## 📝 Estrutura Final no Servidor

```
/home/u549746795/
└── public_html/
    ├── index.html              # Frontend
    ├── assets/                 # Assets do frontend
    │   ├── index-xxx.js
    │   └── index-xxx.css
    └── api/                    # Backend
        ├── server.js
        ├── package.json
        ├── ecosystem.config.js
        ├── .env
        ├── node_modules/
        ├── logs/
        ├── config/
        │   └── database.js
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

## ✅ Checklist Final

- [ ] Build do frontend executado
- [ ] Arquivos do frontend (dist/) enviados para public_html/
- [ ] Pasta api/ criada e arquivos enviados
- [ ] Arquivo .env.production renomeado para .env e enviado
- [ ] Aplicação Node.js configurada no painel
- [ ] Dependências instaladas via SSH
- [ ] PM2 configurado e aplicação iniciada
- [ ] Health check da API funcionando
- [ ] Frontend carregando corretamente
- [ ] Integração frontend-backend testada
- [ ] Cadastro e pagamento testados

## 🆘 Suporte

Em caso de problemas:
1. Verificar logs: `pm2 logs matheus-personal-api`
2. Verificar status: `pm2 status`
3. Verificar painel da Hostinger → Node.js
4. Contatar suporte da Hostinger se necessário
