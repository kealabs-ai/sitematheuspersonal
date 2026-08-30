const DUPLICATE_FIELDS = {
  email: 'E-mail',
  cpf: 'CPF',
  username: 'E-mail',
  phone: 'Telefone',
  telefone: 'Telefone',
};

const CARD_ERRORS = {
  invalid_card: 'Número do cartão inválido. Verifique e tente novamente.',
  expired_card: 'Cartão vencido. Use outro cartão.',
  insufficient_funds: 'Saldo insuficiente. Use outro cartão ou pague via PIX.',
  card_declined: 'Cartão recusado pela operadora. Tente outro cartão ou entre em contato com seu banco.',
  invalid_cvv: 'CVV inválido. Verifique o código de segurança do cartão.',
  invalid_expiry: 'Data de validade inválida.',
  blocked_card: 'Cartão bloqueado. Entre em contato com seu banco.',
};

export function friendlyError(result) {
  if (!result) return 'Ocorreu um erro inesperado. Tente novamente.';

  // Erros do Asaas: { errors: [{ description: '...' }] }
  const asaasErrors = result?.errors ?? result?.error?.errors;
  if (Array.isArray(asaasErrors) && asaasErrors.length > 0) {
    const desc = asaasErrors[0]?.description;
    if (desc) return desc;
  }

  const raw = result?.message || result?.error || result?.detail || '';
  const msg = typeof raw === 'string' ? raw : JSON.stringify(raw);
  const lower = msg.toLowerCase();

  // Cartão recusado / erros de pagamento
  for (const [key, friendly] of Object.entries(CARD_ERRORS)) {
    if (lower.includes(key.replace('_', ' ')) || lower.includes(key)) return friendly;
  }
  if (lower.includes('cartao') || lower.includes('card')) {
    if (lower.includes('invalid') || lower.includes('inválid')) return CARD_ERRORS.invalid_card;
    if (lower.includes('expir') || lower.includes('vencid')) return CARD_ERRORS.expired_card;
    if (lower.includes('declin') || lower.includes('recusad')) return CARD_ERRORS.card_declined;
    if (lower.includes('fund') || lower.includes('saldo')) return CARD_ERRORS.insufficient_funds;
  }

  // Dados duplicados
  const isDuplicate =
    result?.code === 'DUPLICATE' ||
    result?.status === 409 ||
    lower.includes('duplicate entry') ||
    lower.includes('er_dup_entry') ||
    msg.includes('1062') ||
    lower.includes('already exists') ||
    lower.includes('já cadastrado');

  if (isDuplicate) {
    const field = result?.field
      ? DUPLICATE_FIELDS[result.field]
      : Object.entries(DUPLICATE_FIELDS).find(([k]) => lower.includes(k))?.[1];
    return field
      ? `Já existe uma conta com este ${field}. Faça o login para continuar.`
      : 'Já existe uma conta com esses dados. Faça o login para continuar.';
  }

  // CPF inválido
  if (lower.includes('cpf')) return 'CPF inválido. Verifique o número digitado.';

  // Problemas de conexão / servidor
  if (lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('network'))
    return 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';

  if (lower.includes('internal server') || lower.includes('500'))
    return 'Erro interno no servidor. Aguarde alguns instantes e tente novamente.';

  // Fallback genérico amigável
  if (msg) return msg;
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
