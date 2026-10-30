import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Shield, CreditCard, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ProgressIndicator from './ProgressIndicator';
import api from './services/api';
import { friendlyError } from './utils/friendlyError';
import { Footer } from './App';
import { getUser } from './services/alunoApi';

const getPixDetails = (response) => {
  const sources = [
    response,
    response?.data,
    response?.payment,
    response?.pixQrCode,
    response?.pix_qr_code,
    response?.data?.pixQrCode,
    response?.data?.pix_qr_code,
    response?.payment?.pixQrCode,
    response?.payment?.pix_qr_code,
  ].filter(source => source && typeof source === 'object');

  const getString = (keys) => {
    for (const source of sources) {
      for (const key of keys) {
        if (typeof source[key] === 'string' && source[key].trim()) {
          return source[key].trim();
        }
      }
    }
    return '';
  };

  return {
    pixCode: getString(['pix_code', 'pixCode', 'payload', 'qr_code', 'qrCode', 'copyAndPaste']),
    pixQrImage: getString(['pix_qr_image', 'pixQrImage', 'encodedImage', 'encoded_image', 'qr_image', 'qrImage']),
  };
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;
  const coupon = location.state?.coupon;
  const discountedTotal = location.state?.total;

  // userData pode vir via state (fluxo novo cadastro) ou da sessão (usuário já logado)
  const stateUser = location.state?.userData;
  const sessionUser = getUser();
  const [userData, setUserData] = useState(stateUser ?? null);

  // Se não veio userData no state mas há sessão ativa, busca dados completos
  useEffect(() => {
    if (!stateUser && sessionUser?.id) {
      api.getUserById(sessionUser.id)
        .then(data => {
          const id = data?.id_user ?? data?.userId ?? data?.id ?? sessionUser.id;
          setUserData({ ...data, userId: id });
        })
        .catch(() => {
          // fallback mínimo com dados da sessão
          setUserData({ ...sessionUser, userId: sessionUser.id });
        });
    }
  }, []);

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

  // Atualiza formData quando userData for carregado de forma assíncrona
  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name:  prev.name  || userData.name  || '',
        email: prev.email || userData.email || '',
        phone: prev.phone || userData.phone || '',
        cpf:   prev.cpf   || userData.cpf   || '',
      }));
    }
  }, [userData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingUserModal, setExistingUserModal] = useState(false);
  const [pixCode, setPixCode] = useState('');
  const [pixQrImage, setPixQrImage] = useState('');
  const [pixOrderId, setPixOrderId] = useState(null);
  const [pixCopied, setPixCopied] = useState(false);

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

  const parsePlanPrice = (price) => {
    if (typeof price === 'number') return price;
    return parseFloat(String(price).replace(/\./g, '').replace(',', '.'));
  };

  const fullPrice = parsePlanPrice(plan?.price) * (plan?.months ?? 1);
  
  // FALLBACK: Se cupom existe mas não veio desconto, calcula aqui
  let finalPrice = discountedTotal ?? fullPrice;
  if (coupon && !discountedTotal) {
    const discount = coupon.type === 'percent' 
      ? (fullPrice * coupon.discount) / 100 
      : coupon.discount;
    finalPrice = fullPrice - discount;
  }
  
  const totalPrice = finalPrice;

  const handleSubmit = async (e, paymentMethod = formData.paymentMethod) => {
    e.preventDefault();
    const userId = userData?.userId ?? userData?.id_user ?? userData?.id ?? userData?.user_id;
    if (!userId || !Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      setError('Não foi possível identificar sua conta. Volte ao cadastro e tente novamente.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const planPrice = totalPrice;
      const cpfClean = (userData.cpf || '').replace(/\D/g, '');

      // 0. Verifica se e-mail ou CPF já pertencem a outro usuário
      const [byEmail, byCpf] = await Promise.all([
        api.getUserByEmail(userData.email).catch(() => null),
        api.getUserByCpf(userData.cpf).catch(() => null),
      ]);
      const foundId =
        byEmail?.id_user ?? byEmail?.userId ?? byEmail?.id ??
        byCpf?.id_user  ?? byCpf?.userId  ?? byCpf?.id;
      const currentId = userId;
      if (foundId && String(foundId) !== String(currentId)) {
        setExistingUserModal(true);
        setLoading(false);
        return;
      }

      // 1. Cria o pedido COM DESCONTO EXPLÍCITO
      const orderData = {
        id_user: Number(userId),
        payment_method: paymentMethod === 'credit' ? 'CREDIT_CARD' : 'PIX',
        id_coupon: coupon?.id || null,
        coupon_code: coupon?.code || null,
        discount_type: coupon?.type || null,
        discount_value: coupon?.discount || 0,
        original_price: fullPrice,
        final_price: totalPrice,
        items: [{
          plan_name: `Plano ${plan.name}`,
          plan_price: fullPrice,
          plan_price_with_discount: totalPrice,
          plan_frequency: plan.frequency ?? 'monthly',
          quantity: 1
        }]
      };

      const orderResult = await api.createOrder(orderData);

      const orderId =
        orderResult?.id_order ||
        orderResult?.orderId ||
        orderResult?.order_id ||
        orderResult?.id ||
        orderResult?.data?.id_order ||
        orderResult?.data?.id;

      const isOrderSuccess =
        orderResult?.success === true ||
        orderResult?.status === 'success' ||
        orderResult?.status === 'created' ||
        (!!orderId && !orderResult?.error);

      if (!orderId) {
        setError(friendlyError(orderResult));
        return;
      }

      // 2. Chama o checkout Asaas COM DESCONTO EXPLÍCITO
      const billingType = paymentMethod === 'pix' ? 'PIX' : 'CREDIT_CARD';
      const checkoutBody = {
        id_order: orderId,
        id_user: Number(userId),
        payment_id: orderId,
        customer_name: userData.name,
        customer_email: userData.email,
        customer_cpf_cnpj: cpfClean,
        amount: totalPrice,
        original_amount: fullPrice,
        discount_amount: fullPrice - totalPrice,
        coupon_code: coupon?.code || null,
        coupon_id: coupon?.id || null,
        billing_type: billingType,
        ...(paymentMethod !== 'pix' && {
          card_number: formData.cardNumber.replace(/\s/g, ''),
          card_name: formData.cardName,
          card_cpf_cnpj: (formData.cpf || '').replace(/\D/g, ''),
          card_expiry: formData.cardExpiry,
          card_cvv: formData.cardCvv,
          installments: parseInt(formData.installments),
        }),
      };

      const checkoutRes = await fetch(`${import.meta.env.VITE_API_URL}/asaas/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutBody),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        setError(friendlyError(checkoutData?.error ?? checkoutData));
        return;
      }

      // 3. PIX: redireciona para pagina de polling de status
      if (paymentMethod === 'pix') {
        const { pixCode, pixQrImage } = getPixDetails(checkoutData);
        setPixCode(pixCode);
        setPixQrImage(pixQrImage);
        setPixOrderId(orderId);
        return;
      }

      const activation = await api.activateUser(userId);
      if (activation?.success === false || activation?.error) {
        setError(activation?.message || 'Pagamento iniciado, mas não foi possível ativar sua conta. Entre em contato com o suporte.');
        return;
      }

      navigate('/confirmation', {
        state: {
          plan,
          userData: {
            ...userData,
            paymentMethod,
            last4Digits: formData.cardNumber.replace(/\s/g, '').slice(-4),
            recurringPayment: formData.recurringPayment
          },
          orderId,
          asaasId: checkoutData?.asaas_id,
          status: checkoutData?.status,
          invoiceUrl: checkoutData?.invoice_url,
          coupon,
          discountedTotal,
          total: totalPrice,
        }
      });

    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      setError('Não foi possível processar o pagamento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    } catch (copyError) {
      console.error('Erro ao copiar código PIX:', copyError);
      setError('Não foi possível copiar o código PIX. Selecione e copie o código manualmente.');
    }
  };

  if (!plan) {
    navigate('/');
    return null;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg text-white">
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
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="bg-dark-card border border-dark-border p-6">
                  <h3 className="text-2xl font-bebas uppercase mb-4 text-lime-green">
                    Método de Pagamento
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setFormData({ ...formData, paymentMethod: 'credit' });
                        setPixCode('');
                        setPixQrImage('');
                        setPixOrderId(null);
                        setError(null);
                      }}
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
                      disabled={loading}
                      onClick={(event) => {
                        if (formData.paymentMethod === 'pix' || pixOrderId) return;
                        setFormData({ ...formData, paymentMethod: 'pix' });
                        setPixCode('');
                        setPixQrImage('');
                        setPixOrderId(null);
                        setError(null);
                        handleSubmit(event, 'pix');
                      }}
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
                </div>

                {formData.paymentMethod === 'pix' && (
                  <div className="bg-black border border-lime-green/30 p-6 text-center space-y-4">
                    {loading ? (
                      <p className="text-gray-300 animate-pulse">Gerando QR Code PIX...</p>
                    ) : pixCode || pixQrImage ? (
                      <>
                        <p className="text-gray-300">Escaneie o QR Code para pagar</p>
                        <div className="inline-block bg-white p-3 rounded">
                          {pixQrImage
                            ? <img
                                src={/^(data:image\/|https?:\/\/)/i.test(pixQrImage)
                                  ? pixQrImage
                                  : `data:image/png;base64,${pixQrImage}`}
                                alt="QR Code PIX"
                                width={200}
                                height={200}
                              />
                            : <QRCodeSVG value={pixCode} size={200} />
                          }
                        </div>
                        {pixCode && (
                          <div className="flex gap-2 text-left">
                            <input
                              type="text"
                              value={pixCode}
                              readOnly
                              aria-label="Código PIX copia e cola"
                              className="flex-1 min-w-0 p-3 bg-black border border-dark-border text-white text-xs"
                            />
                            <button
                              type="button"
                              onClick={copyPixCode}
                              className="bg-lime-green text-black px-4 py-2 font-bold hover:bg-neon-green transition-all flex items-center gap-2"
                            >
                              {pixCopied ? <Check size={16} /> : <Copy size={16} />}
                              {pixCopied ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Pedido #{pixOrderId} · R$ {totalPrice.toFixed(2).replace('.', ',')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-yellow-200">
                        A cobrança foi iniciada, mas o servidor não retornou o QR Code PIX.
                        {pixOrderId ? ` Pedido #${pixOrderId}.` : ''}
                      </p>
                    )}
                  </div>
                )}

                {formData.paymentMethod === 'credit' && (
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
                          {Array.from({ length: plan?.months ?? 1 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={String(n)}>
                              {n}x de R$ {(totalPrice / n).toFixed(2).replace('.', ',')} sem juros
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                )}

                {formData.paymentMethod === 'pix' && (
                <div className="bg-dark-card border border-dark-border p-6">
                  <h3 className="text-2xl font-bebas uppercase mb-4 text-lime-green">
                    Pagamento via PIX
                  </h3>
                  <div className="bg-black border border-lime-green/30 p-4 text-sm text-gray-300">
                    <p className="mb-2 font-bold text-lime-green">Gerando seu pagamento:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Ao selecionar PIX, a cobrança e o QR Code são gerados</li>
                      <li>Escaneie o QR Code ou copie o código no seu banco</li>
                      <li>O acesso é liberado assim que o pagamento for confirmado</li>
                    </ol>
                  </div>
                </div>
                )}

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

                {formData.paymentMethod === 'credit' && (
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
                )}

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
                    <p className="text-sm text-gray-400">{plan.duration}</p>
                  </div>
                  <div className="border-t border-dark-border pt-4">
                    <div className="flex justify-between text-gray-400 mb-2">
                      <span>Subtotal:</span>
                      <span className="text-white">{plan.months ?? 1} × R$ {parsePlanPrice(plan.price).toFixed(2).replace('.', ',')} = R$ {fullPrice.toFixed(2).replace('.', ',')}</span>
                    </div>
                    {coupon && (
                      <>
                        <div className="flex justify-between text-lime-green mb-2 bg-lime-green/10 p-2 border border-lime-green/30">
                          <span className="font-semibold">🎉 Desconto ({coupon.code || 'Cupom'}):</span>
                          <span className="font-bold">-R$ {(fullPrice - totalPrice).toFixed(2).replace('.', ',')}</span>
                        </div>
                      </>
                    )}
                    {discountedTotal && !coupon && (
                      <div className="flex justify-between text-lime-green mb-2 bg-lime-green/10 p-2 border border-lime-green/30">
                        <span className="font-semibold">🎉 Desconto Aplicado:</span>
                        <span className="font-bold">-R$ {(fullPrice - totalPrice).toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400 mb-4">
                      <span>Taxa de adesão:</span>
                      <span className="text-lime-green">Grátis</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-dark-border pt-4">
                      <span className="text-lg font-bebas uppercase">Total:</span>
                      <span className="text-3xl font-bebas text-lime-green">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
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
      <Footer />

      {existingUserModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-yellow-500/40 w-full max-w-sm p-6 text-center space-y-4">
            <p className="text-yellow-400 text-4xl">⚠️</p>
            <h4 className="text-xl font-bebas uppercase text-white">Cadastro já existente</h4>
            <p className="text-gray-300 text-sm">
              O <span className="text-white font-bold">e-mail</span> ou <span className="text-white font-bold">CPF</span> informado já possui uma conta cadastrada.
              Para continuar com o pagamento, faça o login na sua conta.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <a
                href="/login"
                className="w-full bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors block"
              >
                Fazer Login
              </a>
              <button
                onClick={() => setExistingUserModal(false)}
                className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
