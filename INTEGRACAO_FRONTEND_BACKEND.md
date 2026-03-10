# Integração Frontend-Backend - Matheus Personal

## ✅ Arquivos Integrados

### 1. **src/services/api.js** - Serviço de API
Criado serviço centralizado para comunicação com backend.

### 2. **src/Register.jsx** - Cadastro de Usuários
- ✅ Integrado com `POST /api/users`
- ✅ Cria usuário no banco de dados
- ✅ Retorna userId para próximas etapas
- ✅ Tratamento de erros
- ✅ Loading state

### 3. **src/Cart.jsx** - Validação de Cupons
- ✅ Integrado com `POST /api/coupons/validate`
- ✅ Valida cupom no backend
- ✅ Verifica validade, limite de uso e valor mínimo
- ✅ Tratamento de erros
- ✅ Loading state

### 4. **src/Checkout.jsx** - Processamento de Pedidos
**Próximo passo:** Integrar com `POST /api/orders`

---

## 🔧 Configuração Necessária

### 1. Criar arquivo `.env` na raiz do projeto
```env
VITE_API_URL=http://localhost:3001/api
```

### 2. Iniciar Backend
```bash
cd api
npm install
npm run dev
```

### 3. Iniciar Frontend
```bash
npm run dev
```

---

## 📡 Endpoints Utilizados

### **Cadastro de Usuário**
```javascript
// src/Register.jsx
const result = await api.createUser({
  name, email, phone, cpf, username, password, countryCode
});
```

### **Validação de Cupom**
```javascript
// src/Cart.jsx
const result = await api.validateCoupon(code, amount);
```

### **Criar Pedido** (A implementar no Checkout)
```javascript
// src/Checkout.jsx
const result = await api.createOrder({
  userId,
  items: cartItems,
  subtotal,
  discountAmount,
  totalAmount,
  paymentMethod,
  couponId
});
```

---

## 🎯 Fluxo Completo Integrado

1. **Home** → Usuário seleciona plano
2. **Cart** → Valida cupom via API ✅
3. **Register** → Cria usuário via API ✅
4. **Checkout** → Cria pedido via API (próximo)
5. **Confirmation** → Exibe pedido criado

---

## 🔒 Segurança

- ✅ Credenciais em variáveis de ambiente
- ✅ API URL configurável
- ✅ Senhas criptografadas no backend
- ✅ Validação de dados no backend
- ✅ CORS configurado

---

## 📝 Próximos Passos

1. Integrar Checkout.jsx com API de pedidos
2. Adicionar autenticação JWT
3. Implementar webhook do InfinitePay
4. Envio de email de confirmação
5. Área do aluno com dados reais

---

## 🧪 Testar Integração

### Teste 1: Criar Usuário
1. Acesse o site
2. Selecione um plano
3. Preencha o cadastro
4. Verifique no banco se usuário foi criado

### Teste 2: Validar Cupom
1. Adicione plano ao carrinho
2. Digite cupom: BEM-VINDO
3. Clique em "Aplicar"
4. Verifique se desconto foi aplicado

### Teste 3: Criar Pedido (após implementar)
1. Complete o fluxo até checkout
2. Confirme pagamento
3. Verifique no banco se pedido foi criado

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se o backend está rodando
- Confirme a URL da API no `.env`
- Verifique CORS no backend

### Erro: "Cupom inválido"
- Verifique se cupom existe no banco
- Confirme se está dentro da validade
- Verifique valor mínimo de compra

### Erro: "Usuário já existe"
- Email ou CPF já cadastrado
- Use dados diferentes para teste
