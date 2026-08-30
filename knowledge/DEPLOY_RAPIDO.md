# ⚡ DEPLOY RÁPIDO - 4 PASSOS

## 1️⃣ PREPARAR (Local)

Criar `api/.env`:
```env
DB_HOST=<db_host>
DB_PORT=3306
DB_USER=<db_user>
DB_PASSWORD=<db_password>
DB_NAME=<db_name>
NODE_ENV=production
```

---

## 2️⃣ UPLOAD (Hostinger File Manager)

Enviar para `public_html/`:
```
✅ package.json
✅ vite.config.js
✅ index.html
✅ src/ (pasta completa)
✅ api/ (pasta completa com .env)

❌ NÃO: node_modules/, dist/, .git/
```

---

## 3️⃣ CONFIGURAR (Painel Hostinger)

```
Painel → Avançado → Node.js → Criar Aplicação

Versão: 18.x ou 20.x
Modo: Production
Diretório: /home/<ssh_user>/public_html
Entry point: api/server.js
Nome: matheus-personal
```

Clique **Criar** e aguarde 3-5 min ⏳

---

## 4️⃣ TESTAR

✅ API: https://<seu_dominio>/api/health
✅ Site: https://<seu_dominio>

---

## 🔧 Se der erro:

**Ver logs:** Painel → Node.js → Ver Logs

**Reiniciar:** Painel → Node.js → Stop → Start

---

## 📝 O que acontece automaticamente:

1. `npm install` - Instala deps
2. `npm run build` - Build frontend + instala deps API
3. `npm start` - Inicia servidor (frontend + API juntos)

**Pronto! 🎉**
