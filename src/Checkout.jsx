import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, CreditCard, Copy, Check } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import { QRCodeSVG } from 'qrcode.react';
import { createStaticPix } from 'pix-utils';
import api from './services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;
  const userData = location.state?.userData;

  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    cpf: userData?.cpf || '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    installments: '1',
    recurringPayment: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pixCode, setPixCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;
    const { type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
      return;
    }

    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '');
      if (value.length <= 16) {
        value = value.replace(/(\d{4})(\d)/, '$1 $2');
        value = value.replace(/(\d{4}) (\d{4})(\d)/, '$1 $2 $3');
        value = value.replace(/(\d{4}) (\d{4}) (\d{4})(\d)/, '$1 $2 $3 $4');
      }
    }

    if (name === 'cardExpiry') {
      value = value.replace(/\D/g, '');
      if (value.length <= 4) {
        value = value.replace(/(\d{2})(\d)/, '$1/$2');
      }
    }

    if (name === 'cardCvv') {
      value = value.replace(/\D/g, '');
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const orderData = {
        userId: userData.userId,
        items: [{
          name: plan.name,
          price: plan.price,
          frequency: plan.frequency
        }],
        subtotal: parseFloat(plan.price),
        discountAmount: 0,
        totalAmount: parseFloat(plan.price),
        paymentMethod: formData.paymentMethod,
        couponId: null
      };

      const result = await api.createOrder(orderData);

      if (result.success) {
        const last4Digits = formData.paymentMethod !== 'pix' 
          ? formData.cardNumber.replace(/\s/g, '').slice(-4)
          : null;

        navigate('/confirmation', {
          state: {
            plan,
            userData: {
              ...userData,
              paymentMethod: formData.paymentMethod,
              last4Digits,
              recurringPayment: formData.recurringPayment
            },
            orderId: result.orderId,
            orderNumber: result.orderNumber
          }
        });
      } else {
        setError(result.message || 'Erro ao criar pedido');
      }
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    navigate('/');
    return null;
  }

  useEffect(() => {
    if (formData.paymentMethod === 'pix') {
      generatePixCode();
    }
  }, [formData.paymentMethod]);

  const generatePixCode = () => {
    const pix = createStaticPix({
      merchantName: 'MATHEUS CASTRO PERSONAL',
      merchantCity: 'PASSOS',
      pixKey: '22410655874',
      infoAdicional: `Plano ${plan.name}`,
      transactionAmount: parseFloat(plan.price)
    });
    
    setPixCode(pix.toBRCode());
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <ProgressIndicator currentStep={3} />
          
          <button
            onClick={() => navigate('/register', { state: { plan } })}
            className="flex items-center gap-2 text-lime-green hover:text-neon-green mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao Cadastro
          </button>

          <h1 className="text-5xl font-bebas uppercase mb-8">
            <span className="text-lime-green">Finalizar</span> Compra
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <div className="bg-dark-card border border-dark-border p-6">
                  <h3 className="text-2xl font-bebas uppercase mb-4 text-lime-green">
                    Confirme seus Dados
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-dark-border pb-2">
                      <span className="text-gray-400">Nome:</span>
                      <span className="text-white font-semibold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-dark-border pb-2">
                      <span className="text-gray-400">E-mail:</span>
                      <span className="text-white">{formData.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-dark-border pb-2">
                      <span className="text-gray-400">Telefone:</span>
                      <span className="text-white">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">CPF:</span>
                      <span className="text-white">{formData.cpf}</span>
                    </div>
                  </div>
                </div>

                {/* Método de Pagamento */}
                <div className="bg-dark-card border border-dark-border p-6">
                  <h3 className="text-2xl font-bebas uppercase mb-4 text-lime-green">
                    Método de Pagamento
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'credit' })}
                      className={`p-4 border-2 transition-all ${
                        formData.paymentMethod === 'credit'
                          ? 'border-lime-green bg-lime-green/10'
                          : 'border-dark-border hover:border-lime-green/50'
                      }`}
                    >
                      <div className="text-center">
                        <CreditCard size={32} className="mx-auto mb-2 text-lime-green" />
                        <span className="text-xs text-white">Crédito</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'debit' })}
                      className={`p-4 border-2 transition-all ${
                        formData.paymentMethod === 'debit'
                          ? 'border-lime-green bg-lime-green/10'
                          : 'border-dark-border hover:border-lime-green/50'
                      }`}
                    >
                      <div className="text-center">
                        <CreditCard size={32} className="mx-auto mb-2 text-lime-green" />
                        <span className="text-xs text-white">Débito</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: 'pix' })}
                      className={`p-4 border-2 transition-all ${
                        formData.paymentMethod === 'pix'
                          ? 'border-lime-green bg-lime-green/10'
                          : 'border-dark-border hover:border-lime-green/50'
                      }`}
                    >
                      <div className="text-center">
                        <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 512 512" fill="currentColor">
                          <path className="text-lime-green" d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.1 231.1 518.1 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C257.1 224.3 247.8 224.3 242.4 218.9L165.7 142.2C151.5 127.1 132.6 120.2 112.6 120.2H103.3L200.7 22.8C231.1-7.6 280.3-7.6 310.6 22.8L407.8 119.9H392.6C372.6 119.9 353.7 127.7 339.5 141.9L262.5 218.9zM112.6 142.7C126.4 142.7 139.1 148.3 149.7 158.1L226.4 234.8C233.6 241.1 243 245.6 252.5 245.6C261.9 245.6 271.3 241.1 278.5 234.8L355.5 157.8C365.3 148.1 378.8 142.5 392.6 142.5H430.3L488.6 200.8C518.9 231.1 518.9 280.3 488.6 310.6L430.3 368.9H392.6C378.8 368.9 365.3 363.3 355.5 353.5L278.5 276.5C264.6 262.6 240.3 262.6 226.4 276.6L149.7 353.2C139.1 363 126.4 368.6 112.6 368.6H80.8L22.8 310.6C-7.6 280.3-7.6 231.1 22.8 200.8L80.8 142.8H112.6z"/>
                        </svg>
                        <span className="text-xs text-white">PIX</span>
                      </div>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center items-center p-4 bg-black border border-dark-border">
                    <img src="https://logodownload.org/wp-content/uploads/2016/10/visa-logo-2-1.png" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                    <img src="https://logodownload.org/wp-content/uploads/2017/04/elo-logo-2-2.png" alt="Elo" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg" alt="American Express" className="h-4" />
                    <img src="https://logodownload.org/wp-content/uploads/2015/03/hipercard-logo-4.png" alt="Hipercard" className="h-4" />
                  </div>
                </div>

                {/* Dados do Cartão */}
                {formData.paymentMethod !== 'pix' && (
                <div className="bg-dark-card border border-dark-border p-6">
                  <h3 className="text-2xl font-bebas uppercase mb-4 text-lime-green flex items-center gap-2">
                    <CreditCard size={24} />
                    Dados do Cartão
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Número do Cartão"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required
                      maxLength="19"
                      className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                    />
                    <input
                      type="text"
                      name="cardName"
                      placeholder="Nome no Cartão"
                      value={formData.cardName}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="cardExpiry"
                        placeholder="Validade (MM/AA)"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        required
                        maxLength="5"
                        className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                      />
                      <input
                        type="text"
                        name="cardCvv"
                        placeholder="CVV"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        required
                        maxLength="4"
                        className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                      />
                    </div>
                    {formData.paymentMethod === 'credit' && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                          Parcelamento
                        </label>
                        <select
                          name="installments"
                          value={formData.installments}
                          onChange={handleChange}
                          required
                          className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                        >
                          <option value="1">1x de R$ {plan.price} sem juros</option>
                          <option value="2">2x de R$ {(parseFloat(plan.price) / 2).toFixed(2)} sem juros</option>
                          <option value="3">3x de R$ {(parseFloat(plan.price) / 3).toFixed(2)} sem juros</option>
                          <option value="4">4x de R$ {(parseFloat(plan.price) / 4).toFixed(2)} sem juros</option>
                          <option value="5">5x de R$ {(parseFloat(plan.price) / 5).toFixed(2)} sem juros</option>
                          <option value="6">6x de R$ {(parseFloat(plan.price) / 6).toFixed(2)} sem juros</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                    <Lock size={16} />
                    <span>Pagamento 100% seguro e criptografado</span>
                  </div>
                </div>
                )}

                {/* PIX */}
                {formData.paymentMethod === 'pix' && (
                <div className="bg-dark-card border border-dark-border p-6">
                  <h3 className="text-2xl font-bebas uppercase mb-4 text-lime-green flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
                      <path className="text-lime-green" d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.1 231.1 518.1 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C257.1 224.3 247.8 224.3 242.4 218.9L165.7 142.2C151.5 127.1 132.6 120.2 112.6 120.2H103.3L200.7 22.8C231.1-7.6 280.3-7.6 310.6 22.8L407.8 119.9H392.6C372.6 119.9 353.7 127.7 339.5 141.9L262.5 218.9zM112.6 142.7C126.4 142.7 139.1 148.3 149.7 158.1L226.4 234.8C233.6 241.1 243 245.6 252.5 245.6C261.9 245.6 271.3 241.1 278.5 234.8L355.5 157.8C365.3 148.1 378.8 142.5 392.6 142.5H430.3L488.6 200.8C518.9 231.1 518.9 280.3 488.6 310.6L430.3 368.9H392.6C378.8 368.9 365.3 363.3 355.5 353.5L278.5 276.5C264.6 262.6 240.3 262.6 226.4 276.6L149.7 353.2C139.1 363 126.4 368.6 112.6 368.6H80.8L22.8 310.6C-7.6 280.3-7.6 231.1 22.8 200.8L80.8 142.8H112.6z"/>
                    </svg>
                    Pagamento via PIX
                  </h3>
                  <div className="bg-black border border-lime-green/30 p-6">
                    <div className="text-center mb-4">
                      <p className="text-gray-300 mb-4">Escaneie o QR Code ou copie o código PIX</p>
                      <div className="bg-white p-4 inline-block rounded">
                        <QRCodeSVG value={pixCode} size={200} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                        Código PIX Copia e Cola
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pixCode}
                          readOnly
                          className="flex-1 p-3 bg-black border border-dark-border text-white text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={copyPixCode}
                          className="bg-lime-green text-black px-4 py-2 font-bold hover:bg-neon-green transition-all flex items-center gap-2"
                        >
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                          {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 bg-lime-green/10 border border-lime-green/30 p-4 text-sm text-gray-300">
                      <p className="mb-2 font-bold text-lime-green">Instruções:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Abra o app do seu banco</li>
                        <li>Escolha pagar com PIX</li>
                        <li>Escaneie o QR Code ou cole o código</li>
                        <li>Confirme o pagamento de R$ {plan.price}</li>
                      </ol>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-lime-green mt-4">
                      <Lock size={16} />
                      <span className="text-sm">Pagamento instantâneo e seguro</span>
                    </div>
                  </div>
                </div>
                )}

                {/* Pagamento Seguro */}
                <div className="bg-black border border-lime-green/30 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield size={24} className="text-lime-green" />
                    <h3 className="text-xl font-bebas uppercase text-lime-green">
                      Pagamento Seguro
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-lime-green">
                      <Lock size={16} />
                      <span>Conexão criptografada SSL</span>
                    </div>
                    <div className="flex items-center gap-2 text-lime-green">
                      <Shield size={16} />
                      <span>Certificado PCI DSS</span>
                    </div>
                    <div className="flex items-center gap-2 text-lime-green">
                      <Lock size={16} />
                      <span>Ambiente 100% seguro</span>
                    </div>
                  </div>
                </div>

                {/* Recorrência */}
                {formData.paymentMethod === 'credit' && (
                <div className="bg-black border border-dark-border p-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="recurringPayment"
                      id="recurringPayment"
                      checked={formData.recurringPayment}
                      onChange={handleChange}
                      className="w-5 h-5 accent-lime-green cursor-pointer"
                    />
                    <label htmlFor="recurringPayment" className="text-sm text-gray-300 cursor-pointer">
                      Autorizo cobrança mensal recorrente automática
                    </label>
                  </div>
                </div>
                )}

                {error && (
                  <div className="bg-red-500/10 border border-red-500 p-4 text-red-500">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processando...' : (
                    <>
                      <Lock size={20} />
                      Confirmar Pagamento
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-gray-500">
                  <p className="mb-2">Ao continuar, você concorda com nossos</p>
                  <div className="flex justify-center gap-4">
                    <a href="/termos" className="text-lime-green hover:underline">Termos de Uso</a>
                    <span>|</span>
                    <a href="/privacidade" className="text-lime-green hover:underline">Política de Privacidade</a>
                  </div>
                </div>
              </form>
            </div>

            {/* Resumo do Pedido */}
            <div className="md:col-span-1">
              <div className="bg-dark-card border border-dark-border p-6 sticky top-24">
                <h3 className="text-2xl font-bebas uppercase mb-4 text-lime-green">
                  Resumo do Pedido
                </h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="text-xl font-bebas text-white mb-1">
                      Plano {plan.name}
                    </h4>
                    <p className="text-sm text-gray-400">{plan.frequency}</p>
                    <p className="text-sm text-gray-400">{plan.classes}</p>
                  </div>
                  <div className="border-t border-dark-border pt-4">
                    <div className="flex justify-between text-gray-400 mb-2">
                      <span>Subtotal:</span>
                      <span>R$ {plan.price}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 mb-4">
                      <span>Taxa de adesão:</span>
                      <span className="text-lime-green">Grátis</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-dark-border pt-4">
                      <span className="text-lg font-bebas uppercase">Total:</span>
                      <span className="text-3xl font-bebas text-lime-green">
                        R$ {plan.price}
                        <span className="text-sm text-gray-400">/mês</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-black border border-dark-border p-6 text-sm text-gray-300">
                  <p className="mb-2">✓ Cancelamento gratuito</p>
                  <p className="mb-2">✓ Primeira aula experimental</p>
                  <p className="mb-2">✓ Suporte via WhatsApp</p>
                  <p className="mb-2">✓ Garantia de 7 dias</p>
                  <p>✓ Pagamento 100% seguro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
