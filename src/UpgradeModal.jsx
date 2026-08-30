import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Lock, Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getUser } from './services/alunoApi';
import { friendlyError } from './utils/friendlyError';

const PLANS = [
  { name: 'BRONZE',   price: 79.90, months: 1, duration: '1 mês',    color: 'border-orange-400 text-orange-400', bg: 'bg-orange-400/10', emoji: '🥉' },
  { name: 'PRATA',    price: 69.90, months: 3, duration: '3 meses',   color: 'border-gray-300 text-gray-300',     bg: 'bg-gray-300/10',   emoji: '🥈' },
  { name: 'OURO',     price: 49.90, months: 6, duration: '6 meses',   color: 'border-yellow-400 text-yellow-400', bg: 'bg-yellow-400/10', emoji: '🥇', popular: true },
  { name: 'DIAMANTE', price: 99.90, months: 1, duration: '1 mês',     color: 'border-purple-400 text-purple-400', bg: 'bg-purple-400/10', emoji: '💎' },
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

  const user = getUser();
  const totalPrice = selectedPlan ? selectedPlan.price * selectedPlan.months : 0;

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
      const token = sessionStorage.getItem('access_token');

      const orderRes = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id_user: user?.id,
          payment_method: payMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
          original_price: totalPrice,
          final_price: totalPrice,
          items: [{ plan_name: `Plano ${selectedPlan.name}`, plan_price: totalPrice, quantity: 1 }],
        }),
      }).then(r => r.json());

      const orderId = orderRes?.id_order || orderRes?.orderId || orderRes?.id;
      if (!orderId) { setError(friendlyError(orderRes)); setLoading(false); return; }

      const checkoutBody = {
        id_order: orderId,
        id_user: user?.id,
        customer_name: user?.name,
        customer_email: user?.email,
        amount: totalPrice,
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(checkoutBody),
      });
      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) { setError(friendlyError(checkoutData?.error ?? checkoutData)); setLoading(false); return; }

      if (payMethod === 'pix') {
        setPixCode(checkoutData?.pix_code || '');
        setPixQrImage(checkoutData?.pix_qr_image || '');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
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

          {/* PIX gerado */}
          {!success && pixCode && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-4">Escaneie o QR Code para pagar</p>
                <div className="bg-white p-4 inline-block rounded">
                  {pixQrImage
                    ? <img src={`data:image/png;base64,${pixQrImage}`} alt="QR Code PIX" width={200} height={200} />
                    : <QRCodeSVG value={pixCode} size={200} />
                  }
                </div>
              </div>
              <div className="flex gap-2">
                <input readOnly value={pixCode}
                  className="flex-1 p-3 bg-black border border-dark-border text-white text-xs focus:outline-none" />
                <button onClick={copyPix}
                  className="bg-lime-green text-black px-4 py-2 font-bold hover:bg-neon-green transition-all flex items-center gap-2">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <p className="text-gray-500 text-xs text-center">
                Valor: <span className="text-lime-green font-bold">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </p>
            </div>
          )}

          {/* Step: seleção de plano */}
          {!success && !pixCode && step === 'plan' && (
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
          {!success && !pixCode && step === 'payment' && (
            <>
              {/* Resumo */}
              <div className="bg-black border border-dark-border p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Plano selecionado</p>
                  <p className="text-white font-bebas text-lg">{selectedPlan?.emoji} {selectedPlan?.name} — {selectedPlan?.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-lime-green font-bebas text-2xl">R$ {totalPrice.toFixed(2).replace('.', ',')}</p>
                  <button onClick={() => { setStep('plan'); setPixCode(''); setError(''); }}
                    className="text-gray-500 text-xs hover:text-lime-green transition-colors">
                    Trocar plano
                  </button>
                </div>
              </div>

              {/* Método */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'credit', label: 'Cartão de Crédito', icon: <CreditCard size={20} /> },
                  { id: 'pix',    label: 'PIX',               icon: <span className="text-lime-green font-bold text-sm">PIX</span> },
                ].map(m => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
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

              {payMethod === 'pix' && (
                <div className="bg-black border border-lime-green/20 p-4 text-sm text-gray-400 space-y-1">
                  <p className="text-lime-green font-bold text-xs uppercase tracking-wide mb-2">Como pagar via PIX:</p>
                  <p>1. Clique em "Gerar PIX"</p>
                  <p>2. Escaneie o QR Code ou copie o código</p>
                  <p>3. Confirme o pagamento de <span className="text-lime-green font-bold">R$ {totalPrice.toFixed(2).replace('.', ',')}</span></p>
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

              <div className="flex gap-3">
                <button onClick={() => { setStep('plan'); setError(''); }}
                  className="flex-1 border border-dark-border text-gray-400 py-3 uppercase text-sm hover:border-gray-400 transition-all">
                  Voltar
                </button>
                <button onClick={handleSubmit} disabled={loading ||
                  (payMethod === 'credit' && (!card.number || !card.name || !card.expiry || !card.cvv))}
                  className="flex-2 flex-1 bg-lime-green text-black font-bold py-3 uppercase hover:bg-neon-green transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  <Lock size={14} />
                  {loading ? 'Processando...' : payMethod === 'pix' ? 'Gerar PIX' : 'Confirmar Pagamento'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
