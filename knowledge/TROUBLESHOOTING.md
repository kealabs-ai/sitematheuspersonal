# Troubleshooting - Erros de Integração

## ❌ Erro 1: 404 Not Found - /api/coupons/validate

**Causa:** Rota não encontrada no backend

**Solução:**
1. Verifique se o backend está rodando: `npm run dev` na pasta `api/`
2. Confirme que a rota existe em `api/routes/coupons.js`
3. Verifique se o servidor está na porta 3001

**Teste:**
```bash
curl -X POST http://localhost:3001/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"BEM-VINDO","amount":300}'
```

---

## ❌ Erro 2: 500 Internal Server Error - /api/users

**Causa:** Erro ao conectar com banco de dados

**Solução:**
1. Verifique credenciais do banco em `api/.env`:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=mp_user
   DB_PASSWORD=pwd1234
   DB_NAME=mp_database
   ```

2. Confirme que MySQL está rodando
3. Verifique se banco e tabelas foram criados:
   ```sql
   USE mp_database;
   SHOW TABLES;
   ```

4. Verifique logs do backend no console

---

## ⚠️ Aviso: Input autocomplete

**Causa:** Campos de senha sem atributo autocomplete

**Solução:** Adicionar `autocomplete="new-password"` aos inputs de senha

**Arquivo:** `src/Register.jsx`

```jsx
<input
  type="password"
  name="password"
  autocomplete="new-password"
  ...
/>
```

---

## 🔍 Checklist de Verificação

- [ ] Backend rodando em http://localhost:3001
- [ ] MySQL rodando e acessível
- [ ] Banco `mp_database` criado
- [ ] Tabelas criadas (execute `database.sql`)
- [ ] `.env` configurado corretamente
- [ ] `.env` no frontend com `VITE_API_URL=http://localhost:3001/api`
- [ ] CORS habilitado no backend
- [ ] Sem erros no console do backend

---

## 🧪 Teste Passo a Passo

### 1. Testar Conexão com Banco
```bash
cd api
node -e "require('./config/database').query('SELECT 1').then(r => console.log('OK'))"
```

### 2. Testar Rota de Usuários
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Teste",
    "email":"teste@test.com",
    "phone":"(35)99999-9999",
    "cpf":"123.456.789-00",
    "username":"teste",
    "password":"senha123"
  }'
```

### 3. Testar Rota de Cupons
```bash
curl -X POST http://localhost:3001/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"BEM-VINDO","amount":300}'
```

---

## 📋 Logs Úteis

### Backend
Verifique o console do backend para mensagens de erro:
```
Validando cupom: BEM-VINDO Valor: 300
Erro ao validar cupom: ...
```

### Frontend
Abra DevTools (F12) e verifique:
- Console para erros JavaScript
- Network para requisições HTTP
- Application > Local Storage para dados salvos

---

## 🆘 Se Ainda Não Funcionar

1. Reinicie o backend: `npm run dev`
2. Limpe cache do navegador: Ctrl+Shift+Delete
3. Verifique firewall bloqueando porta 3001
4. Tente acessar http://localhost:3001 no navegador
5. Verifique logs completos do MySQL
