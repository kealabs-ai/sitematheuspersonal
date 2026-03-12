# ⚡ DEPLOY RÁPIDO - 4 PASSOS

## 1️⃣ PREPARAR (Local)

Criar `api/.env`:
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
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
Diretório: /home/u549746795/public_html
Entry point: api/server.js
Nome: matheus-personal
```

Clique **Criar** e aguarde 3-5 min ⏳

---

## 4️⃣ TESTAR

✅ API: https://matheuspersonal.com.br/api/health
✅ Site: https://matheuspersonal.com.br

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
