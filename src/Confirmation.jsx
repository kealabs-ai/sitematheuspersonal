import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Mail } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, userData, orderId, coupon, discountedTotal, total } = location.state || {};
  const displayPrice = discountedTotal || total || plan?.price;

  const parsePlanPrice = (price) => {
    if (typeof price === 'number') return price;
    return parseFloat(String(price).replace(/\./g, '').replace(',', '.'));
  };

  useEffect(() => {
    if (!plan || !userData) {
      navigate('/');
    }
  }, [plan, userData, navigate]);

  if (!plan || !userData) return null;

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <ProgressIndicator currentStep={4} />

          <div className="text-center mb-8">
            <CheckCircle size={80} className="mx-auto mb-6 text-lime-green" />
            <h1 className="text-5xl font-bebas uppercase mb-4">
              <span className="text-lime-green">Pagamento</span> Confirmado!
            </h1>
            <p className="text-gray-300 text-lg">
              Seu pedido foi processado com sucesso
            </p>
          </div>

          <div className="bg-dark-card border border-lime-green p-8 mb-6">
            <h2 className="text-2xl font-bebas uppercase mb-4 text-lime-green">
              Detalhes do Pedido
            </h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between border-b border-dark-border pb-2">
                <span>Número do Pedido:</span>
                <span className="text-lime-green font-bold">{orderId || '#' + Date.now()}</span>
              </div>
              <div className="flex justify-between border-b border-dark-border pb-2">
                <span>Plano:</span>
                <span className="font-bold">{plan.name}</span>
              </div>
              <div className="flex justify-between border-b border-dark-border pb-2">
                <span>Frequência:</span>
                <span>{plan.frequency}</span>
              </div>
              <div className="flex justify-between border-b border-dark-border pb-2">
                <span>Subtotal:</span>
                <span className="text-white">{plan.months ?? 1} × R$ {parsePlanPrice(plan.price).toFixed(2).replace('.', ',')} = R$ {(parsePlanPrice(plan.price) * (plan.months ?? 1)).toFixed(2).replace('.', ',')}</span>
              </div>
              {coupon && (
                <div className="flex justify-between border-b border-dark-border pb-2">
                  <span>Desconto ({coupon.code}):</span>
                  <span className="text-lime-green">-R$ {((parsePlanPrice(plan.price) * (plan.months ?? 1)) - displayPrice).toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-dark-border pb-2">
                <span>Valor Final:</span>
                <span className="text-lime-green font-bold text-xl">R$ {displayPrice.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <div className="bg-black border border-dark-border p-6 mb-6">
            <h3 className="text-xl font-bebas uppercase mb-4 text-lime-green">
              Próximos Passos
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <Mail className="text-lime-green mt-1 flex-shrink-0" size={20} />
                <span>Você receberá um email de confirmação em <strong className="text-white">{userData.email}</strong> com todos os detalhes</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-lime-green mt-1 flex-shrink-0" size={20} />
                <span>Acesse a área do aluno para visualizar seus treinos e acompanhamento</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all"
            >
              Acessar Área do Aluno
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 border-2 border-lime-green text-lime-green font-bold py-4 uppercase hover:bg-lime-green hover:text-black transition-all"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
