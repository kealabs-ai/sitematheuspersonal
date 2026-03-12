# Instruções de Deploy - Hostinger

## Passo 1: Preparar o Backend

1. Acesse o painel da Hostinger
2. Vá em "Arquivos" > "Gerenciador de Arquivos"
3. Crie uma pasta `api` na raiz do domínio
4. Faça upload de todos os arquivos da pasta `api/` local para a pasta `api/` no servidor

## Passo 2: Configurar Node.js na Hostinger

1. No painel da Hostinger, vá em "Avançado" > "Node.js"
2. Clique em "Criar Aplicação"
3. Configure:
   - **Versão Node.js**: 18.x ou superior
   - **Modo da Aplicação**: Produção
   - **Diretório da Aplicação**: `/domains/matheuspersonal.com.br/public_html/api`
   - **Arquivo de Inicialização**: `server.js`
   - **Porta**: 3001

4. Clique em "Criar"

## Passo 3: Instalar Dependências

1. Acesse o terminal SSH da Hostinger ou use o terminal do painel
2. Navegue até a pasta da API:
```bash
cd /domains/matheuspersonal.com.br/public_html/api
```

3. Instale as dependências:
```bash
npm install
```

## Passo 4: Configurar Variáveis de Ambiente

1. Crie o arquivo `.env` na pasta `api/`:
```bash
nano .env
```

2. Cole o conteúdo:
```
DB_HOST=srv1078.hstgr.io
DB_PORT=3306
DB_USER=u549746795_matheusmp
DB_PASSWORD=MP@2026!Passos
DB_NAME=u549746795_mp
PORT=3001
NODE_ENV=production
```

3. Salve (Ctrl+O, Enter, Ctrl+X)

## Passo 5: Iniciar a Aplicação

1. No painel Node.js da Hostinger, clique em "Iniciar" na sua aplicação
2. Verifique se o status está "Rodando"

## Passo 6: Configurar Proxy Reverso

1. Faça upload do arquivo `.htaccess` para a raiz do domínio (`public_html/`)
2. Certifique-se de que o módulo `mod_proxy` está habilitado

## Passo 7: Deploy do Frontend

1. Faça build do frontend:
```bash
npm run build
```

2. Faça upload de todos os arquivos da pasta `dist/` para `public_html/`

## Passo 8: Testar

1. Acesse: https://matheuspersonal.com.br
2. Teste o cadastro de usuário
3. Verifique os logs no painel Node.js se houver erros

## Troubleshooting

### API não responde (404)
- Verifique se a aplicação Node.js está rodando no painel
- Verifique os logs da aplicação
- Teste diretamente: `curl http://localhost:3001/api/users`

### Erro de CORS
- Verifique se o `.htaccess` está na raiz
- Verifique se o módulo `mod_headers` está habilitado

### Erro de conexão com banco
- Verifique as credenciais no `.env`
- Teste a conexão com o banco via phpMyAdmin

### Aplicação não inicia
- Verifique os logs no painel Node.js
- Verifique se todas as dependências foram instaladas
- Verifique se a porta 3001 está disponível
