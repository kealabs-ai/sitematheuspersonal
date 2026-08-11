# Integração InfinitePay - Matheus Personal

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_INFINITEPAY_API_URL=https://api.infinitepay.io/v2
VITE_INFINITEPAY_API_KEY=sua_chave_api_aqui
VITE_APP_URL=https://<seu_dominio>
```

### 2. Obter Credenciais

1. Acesse https://dashboard.infinitepay.io/
2. Crie uma conta ou faça login
3. Vá em "Configurações" > "API Keys"
4. Gere uma nova chave API
5. Copie a chave e adicione no arquivo `.env`

### 3. Configurar Webhooks

Configure os webhooks no dashboard do InfinitePay para receber notificações de pagamento:

**URL do Webhook:** `https://<seu_dominio>/api/webhooks/infinitepay`

**Eventos:**
- `payment.succeeded` - Pagamento aprovado
- `payment.failed` - Pagamento recusado
- `subscription.created` - Assinatura criada
- `subscription.cancelled` - Assinatura cancelada

### 4. Fluxo de Pagamento

1. **Usuário seleciona plano** → Cart (Etapa 1)
2. **Cadastro simplificado** → Register (Etapa 2)
   - Nome, Email, Telefone, CPF
   - Usuário e Senha
3. **Checkout seguro** → Checkout (Etapa 3)
   - Confirmação de dados
   - Redirecionamento para InfinitePay
4. **Confirmação** → Confirmation (Etapa 4)
   - Exibição do pedido
   - Próximos passos

### 5. Segurança

- ✅ Dados de cartão NUNCA são coletados diretamente
- ✅ Pagamento processado via iframe do InfinitePay
- ✅ Conexão SSL/TLS obrigatória
- ✅ Certificação PCI DSS do gateway

### 6. Teste em Ambiente de Desenvolvimento

Use as credenciais de teste fornecidas pelo InfinitePay:

```env
VITE_INFINITEPAY_API_KEY=test_sk_xxxxxxxxxxxxx
```

### 7. Backend Necessário

Para produção, você precisará criar endpoints backend para:

- `/api/checkout/create` - Criar sessão de checkout
- `/api/webhooks/infinitepay` - Receber notificações de pagamento
- `/api/subscriptions/manage` - Gerenciar assinaturas

## Documentação Oficial

- InfinitePay Docs: https://developers.infinitepay.io/
- API Reference: https://developers.infinitepay.io/reference
- Dashboard: https://dashboard.infinitepay.io/
