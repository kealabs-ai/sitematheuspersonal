# Configuração de Deploy - Hostinger

## Estrutura de Pastas no Servidor

```
public_html/
├── index.html (frontend build)
├── assets/
├── api/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── controllers/
│   └── routes/
└── .htaccess
```

## Passos para Deploy

### 1. Build do Frontend
```bash
npm run build
```

### 2. Upload dos Arquivos
- Upload da pasta `dist/` para `public_html/`
- Upload da pasta `api/` para `public_html/api/`

### 3. Configurar Node.js na Hostinger

**Via Painel da Hostinger:**
1. Acesse o painel da Hostinger
2. Vá em "Avançado" > "Node.js"
3. Clique em "Criar Aplicação"
4. Configure:
   - **Versão do Node.js:** 18.x ou superior
   - **Diretório da Aplicação:** `/public_html/api`
   - **Arquivo de Entrada:** `server.js`
   - **Porta:** (será atribuída automaticamente)
   - **Modo:** Production

### 4. Instalar Dependências
No terminal SSH da Hostinger:
```bash
cd public_html/api
npm install --production
```

### 5. Configurar Variáveis de Ambiente
Criar arquivo `.env` em `public_html/api/`:
```
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
PORT=3001
NODE_ENV=production
```

### 6. Iniciar a API
```bash
npm start
```

### 7. Configurar PM2 (Opcional - para manter API rodando)
```bash
npm install -g pm2
pm2 start server.js --name matheus-api
pm2 save
pm2 startup
```

## URLs de Produção
- Frontend: https://matheuspersonal.com.br
- API: https://matheuspersonal.com.br/api

## Verificação
Teste a API:
```bash
curl https://matheuspersonal.com.br/api/health
```

## Troubleshooting

### API não inicia
- Verifique se o Node.js está instalado: `node -v`
- Verifique logs: `pm2 logs matheus-api`
- Verifique permissões: `chmod -R 755 api/`

### Erro de CORS
- Verifique se o arquivo `.htaccess` está na raiz
- Verifique configuração CORS no `server.js`

### Erro de Conexão com Banco
- Verifique credenciais no `.env`
- Teste conexão: `mysql -h srv1078.hstgr.io -u u549746795_matheusmp -p`
