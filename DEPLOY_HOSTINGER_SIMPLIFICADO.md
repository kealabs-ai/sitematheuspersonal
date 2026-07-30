# 🚀 Deploy Hostinger - Configuração Simplificada

## 📝 Visão Geral

A Hostinger executa automaticamente:
1. `npm install` - Instala dependências
2. `npm run build` - Build do frontend + instala deps da API
3. `npm start` - Inicia o servidor que serve frontend + API

**Tudo em um único servidor Node.js!**

---

## 🏗️ Estrutura no Servidor

```
public_html/
├── package.json          # Package principal
├── vite.config.js
├── index.html
├── src/                  # Código fonte React
├── dist/                 # Build do frontend (gerado)
└── api/                  # Backend
    ├── server.js         # Serve frontend + API
    ├── package.json
    ├── .env
    ├── config/
    ├── controllers/
    └── routes/
```

---

## 📋 PASSO 1: Preparação Local

### 1. Criar arquivo .env para produção

Criar `api/.env` com:
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
NODE_ENV=production
```

### 2. Testar localmente (opcional)
```bash
# Build
npm run build

# Testar servidor
npm start
```

Acesse: http://localhost:3001

---

## 📤 PASSO 2: Upload para Hostinger

### Via File Manager ou FTP

Upload de **TODO o projeto** para `public_html/`:

```
✅ package.json (raiz)
✅ vite.config.js
✅ index.html
✅ tailwind.config.js
✅ postcss.config.js
✅ src/ (pasta completa)
✅ api/ (pasta completa)
   ✅ api/.env (importante!)
   ✅ api/server.js
   ✅ api/package.json
   ✅ api/config/
   ✅ api/controllers/
   ✅ api/routes/

❌ NÃO enviar:
   ❌ node_modules/
   ❌ dist/ (será gerado)
   ❌ .git/
   ❌ .env.local
```

---

## ⚙️ PASSO 3: Configurar Node.js na Hostinger

### 1. Acessar Painel
```
Painel Hostinger → Avançado → Node.js
```

### 2. Criar Aplicação

Clique em **"Criar Aplicação"** e preencha:

```
┌─────────────────────────────────────────────────┐
│ Versão do Node.js:                              │
│ [Selecione] 18.x ou 20.x                       │
├─────────────────────────────────────────────────┤
│ Modo da Aplicação:                              │
│ [●] Production                                  │
├─────────────────────────────────────────────────┤
│ Diretório da Aplicação:                         │
│ /home/u549746795/public_html                   │
├─────────────────────────────────────────────────┤
│ Arquivo de Entrada:                             │
│ api/server.js                                   │
├─────────────────────────────────────────────────┤
│ Nome da Aplicação:                              │
│ matheus-personal                                │
└─────────────────────────────────────────────────┘
```

### 3. Criar e Aguardar

- Clique em **"Criar"**
- A Hostinger vai executar automaticamente:
  1. `npm install` (instala deps do frontend)
  2. `npm run build` (build frontend + instala deps API)
  3. `npm start` (inicia servidor)

⏳ Aguarde 3-5 minutos

---

## 🧪 PASSO 4: Testar

### 1. Verificar Status
No painel Node.js, o status deve estar: **"Running"** (verde)

### 2. Testar API
```
https://matheuspersonal.com.br/api/health
```

✅ Deve retornar:
```json
{
  "status": "OK",
  "message": "API está funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Testar Frontend
```
https://matheuspersonal.com.br
```

✅ Deve carregar a página de cadastro

### 4. Testar Integração
- Preencher formulário
- Gerar PIX
- Verificar se tudo funciona

---

## 🔍 PASSO 5: Verificar Logs (Se houver problemas)

### Via Painel
```
Painel → Avançado → Node.js → [Sua App] → Ver Logs
```

### Via SSH (Opcional)
```bash
ssh u549746795@srv1078.hstgr.io -p 65002

# Ver logs da aplicação
cd ~/public_html
cat logs/app.log
```

---

## ❌ PROBLEMAS COMUNS

### Problema 1: "Build failed"

**Causa:** Erro no build do Vite ou instalação de dependências

**Solução via SSH:**
```bash
cd ~/public_html
npm install
npm run build
```

Depois reinicie a aplicação no painel.

---

### Problema 2: "Application failed to start"

**Causa:** Erro no server.js ou falta .env

**Verificar via SSH:**
```bash
cd ~/public_html

# Verificar se .env existe
ls -la api/.env

# Ver conteúdo
cat api/.env

# Testar manualmente
cd api
node server.js
```

**Solução:**
- Verificar se `api/.env` foi enviado
- Verificar credenciais do banco
- Reiniciar aplicação no painel

---

### Problema 3: "Cannot connect to database"

**Solução:**
```bash
# Testar conexão MySQL via SSH
mysql -h srv1078.hstgr.io -u u549746795_matheusmp -p
# Senha: MP@2026!Passos
```

Se conectar, o problema é no código. Se não conectar, verificar credenciais.

---

### Problema 4: Frontend carrega mas API não funciona

**Verificar:**
1. URL da API no código do frontend
2. CORS no server.js
3. Rotas da API

**Solução:**
```bash
# Via SSH, testar API localmente
cd ~/public_html
curl http://localhost:$PORT/api/health
```

---

### Problema 5: "404 Not Found" em rotas do frontend

**Causa:** SPA routing não configurado

**Solução:** Já está configurado no server.js atualizado. Se persistir:
```bash
# Reiniciar aplicação
# Via painel: Stop → Start
```

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Para atualizar o código:

1. **Fazer alterações localmente**
2. **Upload dos arquivos alterados** via FTP
3. **Reiniciar aplicação** no painel:
   ```
   Painel → Node.js → [Sua App] → Stop → Start
   ```

### Se alterou dependências:
```bash
# Via SSH
cd ~/public_html
npm install
npm run build
```

Depois reinicie no painel.

---

## 📊 COMANDOS ÚTEIS SSH

```bash
# Conectar
ssh u549746795@srv1078.hstgr.io -p 65002

# Navegar para projeto
cd ~/public_html

# Ver estrutura
ls -la

# Reinstalar dependências
npm install

# Rebuild
npm run build

# Ver logs (se existirem)
tail -f logs/*.log

# Testar API localmente
curl http://localhost:$PORT/api/health

# Ver processos Node
ps aux | grep node
```

---

## ✅ CHECKLIST COMPLETO

### Preparação:
- [ ] Arquivo `api/.env` criado com credenciais de produção
- [ ] Todos os arquivos do projeto prontos

### Upload:
- [ ] `package.json` (raiz) enviado
- [ ] `vite.config.js` enviado
- [ ] `index.html` enviado
- [ ] Pasta `src/` completa enviada
- [ ] Pasta `api/` completa enviada
- [ ] Arquivo `api/.env` enviado

### Configuração Hostinger:
- [ ] Aplicação Node.js criada
- [ ] Diretório: `/home/u549746795/public_html`
- [ ] Entry point: `api/server.js`
- [ ] Modo: Production
- [ ] Status: Running (verde)

### Testes:
- [ ] Health check: `https://matheuspersonal.com.br/api/health` ✅
- [ ] Frontend: `https://matheuspersonal.com.br` ✅
- [ ] Cadastro funcionando ✅
- [ ] PIX sendo gerado ✅

---

## 🎯 RESUMO

**O que a Hostinger faz automaticamente:**
1. Instala dependências do frontend (`npm install`)
2. Faz build do Vite (`vite build`)
3. Instala dependências da API (`cd api && npm install`)
4. Inicia servidor (`node api/server.js`)

**O servidor Node.js:**
- Serve arquivos estáticos do frontend (pasta `dist/`)
- Responde às rotas da API (`/api/*`)
- Redireciona rotas do frontend para `index.html` (SPA)

**URLs finais:**
- Frontend: `https://matheuspersonal.com.br`
- API: `https://matheuspersonal.com.br/api/*`

---

## 🆘 SUPORTE

**Hostinger:**
- Chat: Disponível no painel
- Documentação: https://support.hostinger.com

**Verificar logs:**
```
Painel → Node.js → [Sua App] → Ver Logs
```

---

## 🎉 PRONTO!

Agora é só:
1. Upload dos arquivos
2. Configurar Node.js no painel
3. Aguardar build e start automáticos
4. Testar!

**Tudo em um único servidor! 🚀**
