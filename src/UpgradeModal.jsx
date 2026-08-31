import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Lock, Shield, Copy, Check, AlertTriangle, Tag, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getUser } from './services/alunoApi';
import { friendlyError } from './utils/friendlyError';

const PLANS = [
  { name: 'BRONZE',   price: 79.90, months: 1, duration: '1 mês',    frequency: 'monthly',    color: 'border-orange-400 text-orange-400', bg: 'bg-orange-400/10', emoji: '🥉' },
  { name: 'PRATA',    price: 69.90, months: 3, duration: '3 meses',   frequency: 'quarterly',  color: 'border-gray-300 text-gray-300',     bg: 'bg-gray-300/10',   emoji: '🥈' },
  { name: 'OURO',     price: 49.90, months: 6, duration: '6 meses',   frequency: 'semiannual', color: 'border-yellow-400 text-yellow-400', bg: 'bg-yellow-400/10', emoji: '🥇', popular: true },
  { name: 'DIAMANTE', price: 99.90, months: 1, duration: '1 mês',     frequency: 'monthly',    color: 'border-purple-400 text-purple-400', bg: 'bg-purple-400/10', emoji: '💎' },
];

// closable=false → modal de plano vencido, sem botão de fechar
export default function UpgradeModal({ onClose, closable = true, expired = false }) {
  const [step, setStep] = useState('plan'); // 'plan' | 'payment'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [payMethod, setPayMethod] = useState('credit');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '', installments: '1' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [pixQrImage, setPixQrImage] = useState('');
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const user = getUser();
  const basePrice = selectedPlan ? selectedPlan.price * selectedPlan.months : 0;
  const discount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? (basePrice * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;
  const totalPrice = basePrice - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const BASE = import.meta.env.VITE_API_URL;
      const params = new URLSearchParams({ code: couponCode.toUpperCase(), amount: basePrice });
      const res = await fetch(`${BASE}/coupons/validate?${params}`);
      const data = await res.json();
      if (!res.ok) { setCouponError(data.detail ?? 'Cupom inválido ou expirado.'); return; }
      setAppliedCoupon({
        id: data.id_coupon,
        code: data.code,
        type: data.discount_type,
        discount: parseFloat(data.discount_value),
      });
    } catch {
      setCouponError('Erro ao validar cupom.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === 'number') {
      value = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2');
    }
    if (name === 'cvv') value = value.replace(/\D/g, '').slice(0, 4);
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const BASE = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem('access_token');

      // Busca dados completos do usuário (incluindo CPF)
      const meRes = await fetch(`${BASE}/aluno/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      const cpfClean = (meData?.cpf || meData?.cpf_cnpj || '').replace(/\D/g, '');
      const userName = meData?.name || user?.name || '';
      const userEmail = meData?.email || user?.email || '';
      const userId = meData?.id || meData?.id_user || user?.id;

      const planFrequency = selectedPlan.frequency || 'monthly';
      const planName = `Plano ${selectedPlan.name}`;
      const planPrice = basePrice;
      const finalPrice = totalPrice;

      // 1. Cria o pedido
      const orderPayload = {
        id_user: userId,
        payment_method: payMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
        id_coupon: appliedCoupon?.id || null,
        coupon_code: appliedCoupon?.code || null,
        discount_type: appliedCoupon?.type || null,
        discount_value: appliedCoupon?.discount || 0,
        original_price: planPrice,
        final_price: finalPrice,
        items: [{
          plan_name: planName,
          plan_price: planPrice,
          plan_price_with_discount: finalPrice,
          plan_frequency: planFrequency,
          quantity: 1,
        }],
      };

      const orderRes = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload),
      }).then(r => r.json());

      const orderId =
        orderRes?.id_order ||
        orderRes?.orderId ||
        orderRes?.order_id ||
        orderRes?.id ||
        orderRes?.data?.id_order ||
        orderRes?.data?.id;

      if (!orderId) { setError(friendlyError(orderRes)); setLoading(false); return; }

      // 2. Chama o checkout Asaas
      const checkoutBody = {
        id_order: orderId,
        id_user: userId,
        payment_id: orderId,
        customer_name: userName,
        customer_email: userEmail,
        customer_cpf_cnpj: cpfClean,
        amount: finalPrice,
        original_amount: planPrice,
        discount_amount: planPrice - finalPrice,
        coupon_code: appliedCoupon?.code || null,
        coupon_id: appliedCoupon?.id || null,
        billing_type: payMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
        ...(payMethod !== 'pix' && {
          card_number: card.number.replace(/\s/g, ''),
          card_name: card.name,
          card_expiry: card.expiry,
          card_cvv: card.cvv,
          installments: parseInt(card.installments),
        }),
      };

      const checkoutRes = await fetch(`${BASE}/asaas/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutBody),
      });
      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) { setError(friendlyError(checkoutData?.error ?? checkoutData)); setLoading(false); return; }

      // 3. PIX: exibe QR code retornado pela API
      if (payMethod === 'pix') {
        setPixCode(checkoutData?.pix_code || '');
        setPixQrImage(checkoutData?.pix_qr_image || '');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError('Não foi possível processar o pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-dark-card border border-lime-green/40 w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-card border-b border-dark-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            {expired && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wide mb-1">
                <AlertTriangle size={14} /> Plano vencido
              </div>
            )}
            <h2 className="text-2xl font-bebas uppercase text-lime-green">
              {step === 'plan' ? 'Escolha seu Plano' : `Plano ${selectedPlan?.name} — Pagamento`}
            </h2>
          </div>
          {closable && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">

          {/* Sucesso */}
          {success && (
            <div className="text-center py-8 space-y-3">
              <p className="text-5xl">🎉</p>
              <p className="text-2xl font-bebas text-lime-green uppercase">Pagamento confirmado!</p>
              <p className="text-gray-400 text-sm">Seu plano {selectedPlan?.name} foi ativado. Aproveite!</p>
              {closable && (
                <button onClick={onClose} className="mt-4 bg-lime-green text-black font-bold px-8 py-3 uppercase hover:bg-neon-green transition-all">
                  Fechar
                </button>
              )}
              {!closable && (
                <button onClick={() => window.location.reload()} className="mt-4 bg-lime-green text-black font-bold px-8 py-3 uppercase hover:bg-neon-green transition-all">
                  Acessar Dashboard
                </button>
              )}
            </div>
          )}

          {/* PIX gerado - removido daqui, agora fica dentro do step payment */}

          {/* Step: seleção de plano */}
          {!success && step === 'plan' && (
            <>
              {expired && (
                <p className="text-gray-400 text-sm bg-red-500/10 border border-red-500/30 p-3">
                  Seu plano venceu. Renove agora para continuar acessando seus treinos e conteúdos.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {PLANS.map(plan => (
                  <button key={plan.name} onClick={() => setSelectedPlan(plan)}
                    className={`relative border-2 p-4 text-left transition-all ${
                      selectedPlan?.name === plan.name
                        ? plan.color + ' ' + plan.bg
                        : 'border-dark-border hover:border-gray-500'
                    }`}>
                    {plan.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-lime-green text-black text-[9px] font-bold uppercase px-2 py-0.5">
                        Mais vendido
                      </span>
                    )}
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">
                      {plan.emoji} {plan.name}
                    </p>
                    <p className="text-white font-bebas text-xl leading-none">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                      <span className="text-gray-500 text-xs font-normal">/mês</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{plan.duration}</p>
                    {plan.months > 1 && (
                      <p className="text-lime-green text-xs mt-0.5 font-semibold">
                        Total R$ {(plan.price * plan.months).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
              <button
                disabled={!selectedPlan}
                onClick={() => setStep('payment')}
                className="w-full bg-lime-green text-black font-bold py-3 uppercase hover:bg-neon-green transition-all disabled:opacity-40"
              >
                Continuar para Pagamento
              </button>
            </>
          )}

          {/* Step: pagamento */}
          {!success && step === 'payment' && (
            <>
              {/* Resumo */}
              <div className="bg-black border border-dark-border p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Plano selecionado</p>
                  <p className="text-white font-bebas text-lg">{selectedPlan?.emoji} {selectedPlan?.name} — {selectedPlan?.duration}</p>
                </div>
                <div className="text-right">
                  {discount > 0 && (
                    <p className="text-gray-500 text-xs line-through">R$ {basePrice.toFixed(2).replace('.', ',')}</p>
                  )}
                  <p className="text-lime-green font-bebas text-2xl">R$ {totalPrice.toFixed(2).replace('.', ',')}</p>
                  <button onClick={() => { setStep('plan'); setPixCode(''); setPixQrImage(''); setError(''); setAppliedCoupon(null); setCouponCode(''); setCouponError(''); }}
                    className="text-gray-500 text-xs hover:text-lime-green transition-colors">
                    Trocar plano
                  </button>
                </div>
              </div>

              {/* Cupom */}
              <div className="bg-black border border-dark-border p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-lime-green font-bold uppercase tracking-wide">
                  <Tag size={14} /> Cupom de Desconto
                </div>
                {appliedCoupon ? (
                  <div className="flex justify-between items-center bg-lime-green/10 border border-lime-green/30 p-2">
                    <div>
                      <p className="text-lime-green font-bold text-sm">{appliedCoupon.code}</p>
                      <p className="text-gray-400 text-xs">
                        -{appliedCoupon.type === 'percent' ? `${appliedCoupon.discount}%` : `R$ ${appliedCoupon.discount.toFixed(2)}`}
                        {' '}= R$ {discount.toFixed(2).replace('.', ',')} de desconto
                      </p>
                    </div>
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); }}
                      className="text-red-500 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Código do cupom"
                        className="flex-1 p-2 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode}
                        className="bg-lime-green text-black font-bold px-4 py-2 text-sm uppercase hover:bg-neon-green transition-all disabled:opacity-40"
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {couponError && <p className="text-red-400 text-xs">{couponError}</p>}
                  </>
                )}
              </div>

              {/* Método */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'credit', label: 'Cartão de Crédito', icon: <CreditCard size={20} /> },
                  { id: 'pix',    label: 'PIX',               icon: <span className="text-lime-green font-bold text-sm">PIX</span> },
                ].map(m => (
                  <button key={m.id} onClick={() => { setPayMethod(m.id); setPixCode(''); setPixQrImage(''); }}
                    className={`flex items-center justify-center gap-2 p-3 border-2 transition-all text-sm ${
                      payMethod === m.id ? 'border-lime-green bg-lime-green/10 text-white' : 'border-dark-border text-gray-400 hover:border-gray-500'
                    }`}>
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              {/* Dados do cartão */}
              {payMethod === 'credit' && (
                <div className="space-y-3">
                  <input name="number" placeholder="Número do cartão" value={card.number} onChange={handleCardChange} maxLength={19}
                    className="w-full p-3 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors" />
                  <input name="name" placeholder="Nome no cartão" value={card.name} onChange={handleCardChange}
                    className="w-full p-3 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors" />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="expiry" placeholder="MM/AA" value={card.expiry} onChange={handleCardChange} maxLength={5}
                      className="w-full p-3 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors" />
                    <input name="cvv" placeholder="CVV" value={card.cvv} onChange={handleCardChange} maxLength={4}
                      className="w-full p-3 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors" />
                  </div>
                  <select name="installments" value={card.installments}
                    onChange={e => setCard(prev => ({ ...prev, installments: e.target.value }))}
                    className="w-full p-3 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors">
                    {Array.from({ length: selectedPlan?.months ?? 1 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={String(n)}>
                        {n}x de R$ {(totalPrice / n).toFixed(2).replace('.', ',')} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* PIX: instruções ou QR gerado */}
              {payMethod === 'pix' && (
                <div className="bg-black border border-lime-green/30 p-4 space-y-4">
                  {(pixCode || pixQrImage) ? (
                    <>
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-3">Escaneie o QR Code para pagar</p>
                        <div className="bg-white p-4 inline-block rounded">
                          {pixQrImage
                            ? <img src={`data:image/png;base64,${pixQrImage}`} alt="QR Code PIX" width={200} height={200} />
                            : <QRCodeSVG value={pixCode} size={200} />
                          }
                        </div>
                      </div>
                      {pixCode && (
                        <div className="flex gap-2">
                          <input readOnly value={pixCode}
                            className="flex-1 p-3 bg-black border border-dark-border text-white text-xs focus:outline-none" />
                          <button onClick={copyPix}
                            className="bg-lime-green text-black px-4 py-2 font-bold hover:bg-neon-green transition-all flex items-center gap-2">
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Copiado!' : 'Copiar'}
                          </button>
                        </div>
                      )}
                      <p className="text-gray-500 text-xs text-center">
                        Valor: <span className="text-lime-green font-bold">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                      </p>
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 space-y-1">
                      <p className="text-lime-green font-bold text-xs uppercase tracking-wide mb-2">Como pagar via PIX:</p>
                      <p>1. Clique em "Gerar PIX"</p>
                      <p>2. Escaneie o QR Code ou copie o código</p>
                      <p>3. Confirme o pagamento de <span className="text-lime-green font-bold">R$ {totalPrice.toFixed(2).replace('.', ',')}</span></p>
                    </div>
                  )}
                </div>
              )}

              {/* Segurança */}
              <div className="flex items-center gap-3 text-xs text-gray-500 border border-dark-border p-3">
                <Shield size={16} className="text-lime-green shrink-0" />
                <span>Pagamento seguro via Asaas · SSL · PCI DSS</span>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">{error}</div>
              )}

              {!(pixCode || pixQrImage) && (
                <div className="flex gap-3">
                  <button onClick={() => { setStep('plan'); setError(''); }}
                    className="flex-1 border border-dark-border text-gray-400 py-3 uppercase text-sm hover:border-gray-400 transition-all">
                    Voltar
                  </button>
                  <button onClick={handleSubmit} disabled={loading ||
                    (payMethod === 'credit' && (!card.number || !card.name || !card.expiry || !card.cvv))}
                    className="flex-1 bg-lime-green text-black font-bold py-3 uppercase hover:bg-neon-green transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                    <Lock size={14} />
                    {loading ? 'Processando...' : payMethod === 'pix' ? 'Gerar PIX' : 'Confirmar Pagamento'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
