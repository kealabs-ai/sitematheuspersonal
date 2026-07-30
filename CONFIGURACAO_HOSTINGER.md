# 🎯 Configuração na Hostinger - Passo a Passo

## 📋 PARTE 1: Preparação Local (No seu computador)

### Passo 1: Build do Frontend
```bash
# Na pasta raiz do projeto
npm run build
```
✅ Isso cria a pasta `dist/` com os arquivos do frontend

### Passo 2: Verificar API
```bash
cd api
npm run check-deploy
```
✅ Verifica se tudo está correto

### Passo 3: Renomear arquivo de ambiente
- Renomear `api/.env.production` para `api/.env`
- OU criar novo arquivo `api/.env` com o conteúdo:
```env
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
NODE_ENV=production
```

---

## 🌐 PARTE 2: Acessar Painel da Hostinger

### Passo 1: Login
1. Acesse: https://hpanel.hostinger.com
2. Faça login com suas credenciais
3. Selecione o domínio: **matheuspersonal.com.br**

---

## 📁 PARTE 3: Upload dos Arquivos

### Opção A: Via File Manager (Mais Fácil)

#### 1. Acessar File Manager
```
Painel Hostinger → Arquivos → Gerenciador de Arquivos
```

#### 2. Upload do Frontend
1. Navegue até a pasta `public_html/`
2. **DELETE** todos os arquivos antigos (se existirem)
3. Clique em **Upload**
4. Selecione TODOS os arquivos da pasta `dist/`:
   - `index.html`
   - Pasta `assets/`
   - Outros arquivos
5. Aguarde o upload completar

#### 3. Criar pasta da API
1. Dentro de `public_html/`, clique em **Nova Pasta**
2. Nome: `api`
3. Entre na pasta `api/`

#### 4. Upload da API
1. Dentro de `public_html/api/`, clique em **Upload**
2. Selecione os arquivos da pasta `api/` do seu projeto:
   ```
   ✅ server.js
   ✅ package.json
   ✅ ecosystem.config.js
   ✅ .env (o que você renomeou)
   ✅ Pasta config/
   ✅ Pasta controllers/
   ✅ Pasta routes/
   
   ❌ NÃO enviar: node_modules/, .env.production, logs/
   ```

### Opção B: Via FTP (FileZilla)

#### Configurações FTP:
```
Host: ftp.matheuspersonal.com.br
Usuário: u549746795
Senha: [sua senha da Hostinger]
Porta: 21
```

#### Upload:
1. Conectar via FTP
2. Navegar até `/public_html/`
3. Arrastar arquivos de `dist/` para `public_html/`
4. Criar pasta `api/` e arrastar arquivos da API

---

## ⚙️ PARTE 4: Configurar Node.js (IMPORTANTE!)

### Passo 1: Acessar Configuração Node.js
```
Painel Hostinger → Avançado → Node.js
```

### Passo 2: Criar Nova Aplicação
1. Clique no botão **"Criar Aplicação"** ou **"Create Application"**

### Passo 3: Preencher Formulário

```
┌─────────────────────────────────────────────────┐
│ Versão do Node.js:                              │
│ [Selecione] 18.x ou 20.x (mais recente)        │
├─────────────────────────────────────────────────┤
│ Modo da Aplicação:                              │
│ [●] Production  [ ] Development                 │
├─────────────────────────────────────────────────┤
│ Diretório da Aplicação:                         │
│ /home/u549746795/public_html/api               │
├─────────────────────────────────────────────────┤
│ Arquivo de Entrada:                             │
│ server.js                                       │
├─────────────────────────────────────────────────┤
│ Nome da Aplicação (opcional):                   │
│ matheus-personal-api                            │
└─────────────────────────────────────────────────┘
```

### Passo 4: Criar Aplicação
- Clique em **"Criar"** ou **"Create"**
- Aguarde a configuração (pode levar 1-2 minutos)

### Passo 5: Anotar a Porta
⚠️ **IMPORTANTE:** A Hostinger vai atribuir uma porta automaticamente
- Exemplo: `PORT=35000` ou similar
- Anote essa porta (você vai precisar)

---

## 🔌 PARTE 5: Instalar Dependências via SSH

### Passo 1: Acessar SSH
```
Painel Hostinger → Avançado → SSH Access
```

### Passo 2: Ativar SSH (se não estiver ativo)
- Clique em **"Ativar SSH"**
- Anote as credenciais:
  ```
  Host: srv1078.hstgr.io
  Port: 65002
  Username: u549746795
  Password: [sua senha]
  ```

### Passo 3: Conectar via SSH

**Windows (PowerShell ou CMD):**
```bash
ssh u549746795@srv1078.hstgr.io -p 65002
```

**Ou use PuTTY:**
- Host: srv1078.hstgr.io
- Port: 65002
- Username: u549746795

### Passo 4: Navegar até a pasta da API
```bash
cd ~/public_html/api
```

### Passo 5: Verificar arquivos
```bash
ls -la
```
✅ Deve mostrar: server.js, package.json, .env, etc.

### Passo 6: Instalar dependências
```bash
npm install --production
```
⏳ Aguarde a instalação (pode levar 2-5 minutos)

### Passo 7: Criar pasta de logs
```bash
mkdir -p logs
```

---

## 🚀 PARTE 6: Iniciar a Aplicação

### Opção A: Via Painel da Hostinger (Mais Simples)

1. Volte para: **Painel → Avançado → Node.js**
2. Encontre sua aplicação: **matheus-personal-api**
3. Clique no botão **"Start"** ou **"Iniciar"**
4. Status deve mudar para: **"Running"** (verde)

### Opção B: Via PM2 (Recomendado - Mais Estável)

No SSH:
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar automaticamente
pm2 startup

# Verificar status
pm2 status
```

Deve mostrar:
```
┌────┬─────────────────────────┬─────────┬─────────┐
│ id │ name                    │ status  │ restart │
├────┼─────────────────────────┼─────────┼─────────┤
│ 0  │ matheus-personal-api    │ online  │ 0       │
└────┴─────────────────────────┴─────────┴─────────┘
```

---

## 🧪 PARTE 7: Testar a Aplicação

### Teste 1: Health Check da API
Abra no navegador:
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

### Teste 2: Frontend
Abra no navegador:
```
https://matheuspersonal.com.br
```

✅ Deve carregar a página de cadastro

### Teste 3: Integração Completa
1. Preencha o formulário de cadastro
2. Clique em "Continuar"
3. Verifique se gera o QR Code PIX

---

## 🔍 PARTE 8: Verificar Logs (Se houver problemas)

### Via Painel da Hostinger:
```
Painel → Avançado → Node.js → [Sua App] → Ver Logs
```

### Via SSH com PM2:
```bash
# Ver logs em tempo real
pm2 logs matheus-personal-api

# Ver últimas 100 linhas
pm2 logs matheus-personal-api --lines 100

# Ver apenas erros
pm2 logs matheus-personal-api --err
```

---

## ❌ PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Application failed to start"
**Solução:**
```bash
# Via SSH
cd ~/public_html/api
npm install --production
pm2 restart matheus-personal-api
```

### Problema 2: "Cannot connect to database"
**Solução:**
```bash
# Verificar .env
cat ~/public_html/api/.env

# Testar conexão MySQL
mysql -h srv1078.hstgr.io -u u549746795_matheusmp -p
# Digite a senha: MP@2026!Passos
```

### Problema 3: "404 Not Found" na API
**Solução:**
- Verificar se a aplicação Node.js está rodando
- Verificar URL: deve ser `/api/` não `/api`
- Reiniciar aplicação no painel

### Problema 4: CORS Error no Frontend
**Solução:**
```bash
# Verificar se o domínio está correto no server.js
# Reiniciar aplicação
pm2 restart matheus-personal-api
```

### Problema 5: Frontend não carrega
**Solução:**
- Verificar se `index.html` está em `public_html/`
- Verificar se pasta `assets/` foi enviada
- Limpar cache do navegador (Ctrl + Shift + R)

---

## 📊 COMANDOS ÚTEIS SSH

```bash
# Navegar para pasta da API
cd ~/public_html/api

# Listar arquivos
ls -la

# Ver conteúdo do .env
cat .env

# Ver logs da aplicação
pm2 logs

# Status da aplicação
pm2 status

# Reiniciar aplicação
pm2 restart matheus-personal-api

# Parar aplicação
pm2 stop matheus-personal-api

# Ver uso de memória/CPU
pm2 monit

# Limpar logs
pm2 flush
```

---

## ✅ CHECKLIST FINAL

Marque cada item conforme completa:

### Preparação:
- [ ] Build do frontend executado (`npm run build`)
- [ ] Arquivo `.env` criado na pasta `api/`
- [ ] Script de verificação executado (`npm run check-deploy`)

### Upload:
- [ ] Arquivos do `dist/` enviados para `public_html/`
- [ ] Pasta `api/` criada em `public_html/api/`
- [ ] Todos os arquivos da API enviados

### Configuração:
- [ ] Aplicação Node.js criada no painel
- [ ] SSH ativado e acessado
- [ ] Dependências instaladas (`npm install --production`)
- [ ] Pasta `logs/` criada

### Inicialização:
- [ ] Aplicação iniciada (via painel ou PM2)
- [ ] Status "Running" ou "online"

### Testes:
- [ ] Health check funcionando (`/api/health`)
- [ ] Frontend carregando
- [ ] Cadastro funcionando
- [ ] PIX sendo gerado

---

## 🆘 PRECISA DE AJUDA?

### Suporte Hostinger:
- Chat: Disponível no painel
- Email: support@hostinger.com
- Telefone: Verifique no painel

### Logs para enviar ao suporte:
```bash
pm2 logs matheus-personal-api --lines 50 > logs.txt
cat logs.txt
```

---

## 🎉 PRONTO!

Se todos os testes passaram, sua aplicação está no ar! 🚀

**URLs:**
- Frontend: https://matheuspersonal.com.br
- API: https://matheuspersonal.com.br/api
- Health Check: https://matheuspersonal.com.br/api/health
