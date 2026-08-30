# 🔄 Deploy Automático via Git - Hostinger

## 📋 Visão Geral

A Hostinger está configurada para:
1. **Detectar push no Git** (GitHub/GitLab/Bitbucket)
2. **Executar automaticamente:**
   - `npm install` → Instala dependências
   - `npm run build` → Build frontend + instala deps API
   - `npm start` → Inicia servidor (frontend + API)

---

## ⚙️ Configuração Inicial na Hostinger

### 1. Conectar Repositório Git

```
Painel Hostinger → Git → Conectar Repositório
```

Preencha:
```
┌─────────────────────────────────────────────────┐
│ Provedor:                                       │
│ [ ] GitHub  [ ] GitLab  [ ] Bitbucket          │
├─────────────────────────────────────────────────┤
│ URL do Repositório:                             │
│ https://github.com/seu-usuario/MatheusPersonal │
├─────────────────────────────────────────────────┤
│ Branch:                                         │
│ main (ou master)                                │
├─────────────────────────────────────────────────┤
│ Diretório de Deploy:                            │
│ /home/<ssh_user>/public_html                    │
└─────────────────────────────────────────────────┘
```

### 2. Configurar Node.js Application

```
Painel Hostinger → Avançado → Node.js → Criar Aplicação
```

```
┌─────────────────────────────────────────────────┐
│ Versão do Node.js:                              │
│ 18.x ou 20.x                                    │
├─────────────────────────────────────────────────┤
│ Modo:                                           │
│ Production                                      │
├─────────────────────────────────────────────────┤
│ Diretório da Aplicação:                         │
│ /home/<ssh_user>/public_html                    │
├─────────────────────────────────────────────────┤
│ Arquivo de Entrada:                             │
│ api/server.js                                   │
├─────────────────────────────────────────────────┤
│ Auto Deploy:                                    │
│ [✓] Ativado                                     │
└─────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Repositório Git

```
MatheusPersonal/
├── .gitignore              ✅ Commit
├── package.json            ✅ Commit
├── vite.config.js          ✅ Commit
├── index.html              ✅ Commit
├── .npmrc                  ✅ Commit
├── src/                    ✅ Commit (código React)
├── api/
│   ├── .env                ✅ Commit (produção)
│   ├── .env.development    ❌ NÃO commit (local)
│   ├── server.js           ✅ Commit
│   ├── package.json        ✅ Commit
│   ├── ecosystem.config.js ✅ Commit
│   ├── config/             ✅ Commit
│   ├── controllers/        ✅ Commit
│   └── routes/             ✅ Commit
├── node_modules/           ❌ NÃO commit
├── dist/                   ❌ NÃO commit (gerado)
└── api/node_modules/       ❌ NÃO commit
```

---

## 🚀 Workflow de Deploy

### Desenvolvimento Local

```bash
# 1. Fazer alterações no código
# 2. Testar localmente
npm run dev        # Frontend
npm run dev:api    # API (usa .env.development)

# 3. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Deploy Automático (Hostinger)

```
Push detectado → Hostinger executa:

1. git pull origin main
2. npm install
3. npm run build
   ├── vite build (gera dist/)
   └── cd api && npm install --production
4. npm start
   └── node api/server.js (serve frontend + API)
```

⏳ **Tempo:** 2-5 minutos

---

## 🔐 Gerenciamento de Variáveis de Ambiente

### Desenvolvimento Local (.env.development)
```env
DB_HOST=<db_host>
DB_PORT=3306
DB_USER=<db_user>
DB_PASSWORD=<db_password>
DB_NAME=<db_name>
PORT=3001
NODE_ENV=development
```
❌ **NÃO fazer commit** (está no .gitignore)

### Produção (api/.env)
```env
DB_HOST=<db_host>
DB_PORT=3306
DB_USER=<db_user>
DB_PASSWORD=<db_password>
DB_NAME=<db_name>
NODE_ENV=production
```
✅ **Fazer commit** (necessário para produção)

**Nota:** PORT não é definido - Hostinger atribui automaticamente

---

## 🧪 Verificar Deploy

### 1. Verificar Status no Painel
```
Painel → Git → Ver Histórico de Deploys
```

Status deve ser: **"Success"** ✅

### 2. Verificar Aplicação Node.js
```
Painel → Node.js → [Sua App]
```

Status deve ser: **"Running"** 🟢

### 3. Testar URLs

**API:**
```
https://<seu_dominio>/api/health
```

**Frontend:**
```
https://<seu_dominio>
```

---

## 📊 Ver Logs

### Logs de Deploy (Git)
```
Painel → Git → Ver Logs do Deploy
```

### Logs da Aplicação (Node.js)
```
Painel → Node.js → [Sua App] → Ver Logs
```

### Via SSH
```bash
ssh <ssh_user>@<ssh_host> -p <ssh_port>

# Ver logs da aplicação
cd ~/public_html
tail -f logs/*.log

# Ver processos
ps aux | grep node
```

---

## ❌ Problemas Comuns

### Problema 1: Deploy falhou no build

**Logs mostram:** `Error: Cannot find module...`

**Solução:**
```bash
# Via SSH
cd ~/public_html
rm -rf node_modules api/node_modules
npm install
cd api && npm install
cd ..
npm run build
```

Depois reinicie a aplicação no painel.

---

### Problema 2: Aplicação não inicia após deploy

**Causa:** Erro no código ou .env faltando

**Solução:**
```bash
# Via SSH
cd ~/public_html

# Verificar .env
cat api/.env

# Testar manualmente
node api/server.js
```

Se mostrar erro, corrija e faça novo push.

---

### Problema 3: Deploy bem-sucedido mas site não atualiza

**Causa:** Cache do navegador ou CDN

**Solução:**
1. Limpar cache do navegador (Ctrl + Shift + R)
2. Verificar se build foi gerado:
```bash
# Via SSH
ls -la ~/public_html/dist/
```
3. Reiniciar aplicação no painel

---

### Problema 4: Variáveis de ambiente não carregam

**Causa:** Arquivo .env não foi commitado ou está no .gitignore

**Solução:**
```bash
# Verificar se .env está no repositório
git ls-files api/.env

# Se não aparecer, remover do .gitignore e commitar
git add api/.env
git commit -m "chore: add production env"
git push
```

---

## 🔄 Rollback (Reverter Deploy)

### Via Git
```bash
# Reverter último commit
git revert HEAD
git push origin main

# Ou voltar para commit específico
git reset --hard <commit-hash>
git push origin main --force
```

### Via Painel Hostinger
```
Painel → Git → Histórico → Selecionar commit anterior → Deploy
```

---

## 🎯 Boas Práticas

### 1. Branches
```bash
# Desenvolvimento
git checkout -b feature/nova-funcionalidade
# ... fazer alterações ...
git push origin feature/nova-funcionalidade

# Produção (após testar)
git checkout main
git merge feature/nova-funcionalidade
git push origin main  # ← Deploy automático
```

### 2. Tags de Versão
```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### 3. Mensagens de Commit
```bash
git commit -m "feat: adiciona validação de CPF"
git commit -m "fix: corrige erro no cálculo de desconto"
git commit -m "chore: atualiza dependências"
```

### 4. Testar Antes de Push
```bash
# Sempre testar localmente
npm run dev
npm run dev:api

# Verificar build
npm run build
npm start
```

---

## 📝 Checklist de Deploy

### Antes do Push:
- [ ] Código testado localmente
- [ ] Build funciona (`npm run build`)
- [ ] Servidor inicia (`npm start`)
- [ ] Testes passam
- [ ] Commit com mensagem descritiva

### Após Push:
- [ ] Deploy bem-sucedido no painel Git
- [ ] Aplicação Node.js rodando
- [ ] Health check funcionando
- [ ] Frontend carregando
- [ ] Funcionalidades testadas

---

## 🔔 Notificações de Deploy

### Configurar Webhook (Opcional)

```
Painel → Git → Webhooks → Adicionar
```

Receba notificações no:
- Slack
- Discord
- Email
- Telegram

---

## 📈 Monitoramento

### Uptime
```
Painel → Estatísticas → Uptime
```

### Uso de Recursos
```
Painel → Node.js → [Sua App] → Métricas
```

### Logs em Tempo Real
```bash
# Via SSH
ssh <ssh_user>@<ssh_host> -p <ssh_port>
cd ~/public_html
tail -f logs/*.log
```

---

## ✅ Resumo

**Fluxo Completo:**
```
Código Local → Git Push → Hostinger detecta
                              ↓
                         npm install
                              ↓
                         npm run build
                              ↓
                          npm start
                              ↓
                    Site atualizado! 🎉
```

**Comandos Principais:**
```bash
# Local
git add .
git commit -m "mensagem"
git push origin main

# Hostinger faz o resto automaticamente!
```

**URLs:**
- Frontend: https://<seu_dominio>
- API: https://<seu_dominio>/api
- Health: https://<seu_dominio>/api/health

---

## 🆘 Suporte

**Hostinger:**
- Chat: Painel → Suporte
- Docs: https://support.hostinger.com

**Git Issues:**
- Verificar logs: Painel → Git → Logs
- Verificar status: Painel → Git → Status

**Aplicação:**
- Logs: Painel → Node.js → Logs
- Reiniciar: Painel → Node.js → Restart

---

## 🎉 Pronto!

Agora cada `git push` faz deploy automático! 🚀

**Próximos passos:**
1. Fazer alterações no código
2. `git push origin main`
3. Aguardar 2-5 minutos
4. Verificar site atualizado
