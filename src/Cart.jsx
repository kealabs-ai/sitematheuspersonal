import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingCart, Plus, Tag } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPlan = location.state?.plan;

  const [cartItems, setCartItems] = useState(initialPlan ? [initialPlan] : []);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const coupons = {
    'PRIMEIRA': { discount: 10, type: 'percent' },
    'BEM-VINDO': { discount: 15, type: 'percent' },
    'PROMO50': { discount: 50, type: 'fixed' }
  };

  const removeItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const applyCoupon = () => {
    const coupon = coupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
      setCouponError('');
    } else {
      setCouponError('Cupom inválido');
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percent') {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handleCheckout = () => {
    navigate('/register', { 
      state: { 
        plan: cartItems[0],
        cartItems,
        coupon: appliedCoupon,
        total: calculateTotal()
      } 
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart size={80} className="mx-auto mb-6 text-gray-600" />
            <h2 className="text-3xl font-bebas uppercase mb-4">Carrinho Vazio</h2>
            <p className="text-gray-400 mb-8">Adicione um plano para continuar</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-lime-green text-black font-bold py-3 px-8 uppercase hover:bg-neon-green transition-all"
              >
                Ver Planos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <ProgressIndicator currentStep={1} />
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-lime-green hover:text-neon-green mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar aos Planos
          </button>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-bebas uppercase">
              Seu <span className="text-lime-green">Carrinho</span>
            </h1>
            <button
              onClick={() => navigate('/#consultoria')}
              className="border-2 border-lime-green text-lime-green font-bold py-2 px-6 uppercase hover:bg-lime-green hover:text-black transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Adicionar Plano
            </button>
          </div>

          {cartItems.map((item, index) => (
          <div key={index} className="bg-dark-card border border-dark-border p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bebas text-lime-green mb-2">
                  Plano {item.name}
                </h3>
                <p className="text-gray-400 text-sm mb-2">{item.frequency}</p>
                <p className="text-gray-400 text-sm mb-2">{item.classes}</p>
                <p className="text-gray-300 text-sm">{item.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bebas text-white">
                  R$ {item.price}
                  <span className="text-sm text-gray-400">/mês</span>
                </span>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-400 transition-colors"
                  title="Remover"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
          ))}

          {/* Cupom de Desconto */}
          <div className="bg-dark-card border border-dark-border p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={20} className="text-lime-green" />
              <h3 className="text-xl font-bebas uppercase text-lime-green">
                Cupom de Desconto
              </h3>
            </div>
            {!appliedCoupon ? (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código do cupom"
                    className="flex-1 p-3 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-lime-green text-black font-bold px-6 py-3 uppercase hover:bg-neon-green transition-all"
                  >
                    Aplicar
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm mt-2">{couponError}</p>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  <p>Cupons disponíveis: PRIMEIRA (10% off), BEM-VINDO (15% off), PROMO50 (R$50 off)</p>
                </div>
              </div>
            ) : (
              <div className="bg-lime-green/10 border border-lime-green/30 p-4 flex justify-between items-center">
                <div>
                  <p className="text-lime-green font-bold">{appliedCoupon.code}</p>
                  <p className="text-sm text-gray-300">
                    Desconto: {appliedCoupon.type === 'percent' ? `${appliedCoupon.discount}%` : `R$ ${appliedCoupon.discount}`}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-black border-2 border-lime-green p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span>R$ {calculateSubtotal().toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-lime-green">
                  <span>Desconto ({appliedCoupon.code}):</span>
                  <span>- R$ {calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-dark-border pt-3">
                <span className="text-xl font-bebas uppercase">Total:</span>
                <span className="text-4xl font-bebas text-lime-green">
                  R$ {calculateTotal().toFixed(2)}
                  <span className="text-lg text-gray-400">/mês</span>
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all text-lg"
            >
              Finalizar Compra
            </button>
            <div className="text-center text-xs text-gray-500 mt-4">
              {appliedCoupon && (
                <p className="text-lime-green mb-2">✓ Cupom {appliedCoupon.code} aplicado com sucesso!</p>
              )}
              <p>Você pode adicionar mais planos antes de finalizar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
