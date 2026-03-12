# ✅ CHECKLIST RÁPIDO - Deploy Hostinger

## 🏠 NO SEU COMPUTADOR

### 1. Build
```bash
npm run build
```

### 2. Preparar .env da API
Renomear `api/.env.production` → `api/.env`

### 3. Verificar
```bash
cd api
npm run check-deploy
```

---

## 🌐 NO PAINEL HOSTINGER

### 1. File Manager
```
Painel → Arquivos → Gerenciador de Arquivos
```

### 2. Upload Frontend
```
public_html/
├── index.html (do dist/)
└── assets/ (do dist/)
```

### 3. Upload Backend
```
public_html/api/
├── server.js
├── package.json
├── ecosystem.config.js
├── .env
├── config/
├── controllers/
└── routes/
```

### 4. Configurar Node.js
```
Painel → Avançado → Node.js → Criar Aplicação

Versão: 18.x ou 20.x
Modo: Production
Diretório: /home/u549746795/public_html/api
Arquivo: server.js
```

---

## 💻 VIA SSH

### 1. Conectar
```bash
ssh u549746795@srv1078.hstgr.io -p 65002
```

### 2. Instalar
```bash
cd ~/public_html/api
npm install --production
mkdir -p logs
```

### 3. Iniciar com PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🧪 TESTAR

### ✅ API
```
https://matheuspersonal.com.br/api/health
```

### ✅ Frontend
```
https://matheuspersonal.com.br
```

### ✅ Cadastro Completo
Preencher formulário → Gerar PIX

---

## 🔧 COMANDOS ÚTEIS

```bash
pm2 status                    # Ver status
pm2 logs                      # Ver logs
pm2 restart matheus-personal-api  # Reiniciar
pm2 monit                     # Monitor
```

---

## 📞 SUPORTE

**Hostinger:** Chat no painel
**Logs:** `pm2 logs matheus-personal-api`
