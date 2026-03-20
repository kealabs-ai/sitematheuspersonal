import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import ProgressIndicator from './ProgressIndicator';
import api from './services/api';

const COUNTRY_CODES = [
  { code: '+55',  flag: '🇧🇷', name: 'Brasil' },
  { code: '+1',   flag: '🇺🇸', name: 'EUA/Canadá' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colômbia' },
  { code: '+52',  flag: '🇲🇽', name: 'México' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguai' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguai' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },
  { code: '+593', flag: '🇪🇨', name: 'Equador' },
  { code: '+591', flag: '🇧🇴', name: 'Bolívia' },
  { code: '+44',  flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+49',  flag: '🇩🇪', name: 'Alemanha' },
  { code: '+33',  flag: '🇫🇷', name: 'França' },
  { code: '+34',  flag: '🇪🇸', name: 'Espanha' },
  { code: '+39',  flag: '🇮🇹', name: 'Itália' },
  { code: '+81',  flag: '🇯🇵', name: 'Japão' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+61',  flag: '🇦🇺', name: 'Austrália' },
];

const validateCPF = (cpf) => {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1{10}$/.test(nums)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(nums[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(nums[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(nums[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(nums[10]);
};

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    username: '',
    password: '',
    confirmPassword: '',
    countryCode: '+55',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name === 'phone') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
      }
    }

    if (name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem!');
      return;
    }
    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido. Verifique o número digitado.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const now = new Date().toISOString().slice(0, 19);
      const userBody = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        cep: '',
        address: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        country_code: formData.countryCode,
        username: formData.username,
        password: formData.password,
        created_at: now,
        updated_at: now
      };

      const result = await api.createUser(userBody);
      const userId = result?.userId || result?.id;
      const isSuccess = result?.success === true || result?.status === 'success';

      if (isSuccess && userId) {
        navigate('/checkout', {
          state: {
            plan,
            userData: { ...userBody, userId }
          }
        });
      } else {
        const msg = result?.message || '';
        if (msg.includes('Duplicate entry') || msg.includes('1062') || msg.includes('23000')) {
          const field = msg.includes('email') ? 'E-mail'
            : msg.includes('cpf') ? 'CPF'
            : msg.includes('username') ? 'Nome de usuário'
            : msg.includes('phone') ? 'Telefone'
            : null;
          setError(field
            ? `${field} já cadastrado. Utilize outro ou faça login.`
            : 'Esses dados já estão cadastrados. Verifique e-mail, CPF ou nome de usuário.'
          );
        } else {
          setError(msg || 'Erro ao criar usuário');
        }
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <ProgressIndicator currentStep={2} />
          
          <button
            onClick={() => navigate('/cart', { state: { plan } })}
            className="flex items-center gap-2 text-lime-green hover:text-neon-green mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar ao Carrinho
          </button>

          <h1 className="text-5xl font-bebas uppercase mb-4">
            <span className="text-lime-green">Cadastro</span> de Usuário
          </h1>

          <div className="bg-lime-green/10 border-l-4 border-lime-green p-6 mb-8">
            <h2 className="text-xl font-bold text-lime-green mb-3">Cadastro Simplificado</h2>
            <p className="text-gray-300">Precisamos apenas de algumas informações básicas. Dados de endereço serão solicitados após a confirmação do pagamento.</p>
          </div>

          <div className="bg-dark-card border border-dark-border p-8">
            <div className="flex items-center gap-3 mb-6">
              <User size={32} className="text-lime-green" />
              <h2 className="text-2xl font-bebas uppercase text-lime-green">
                Informações Pessoais
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                  placeholder="Digite seu nome completo"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    maxLength="14"
                    className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                  Telefone/WhatsApp *
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-44 p-4 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors"
                  >
                    {COUNTRY_CODES.map(({ code, flag, name }) => (
                      <option key={code} value={code}>{flag} {code} {name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength="15"
                    className="flex-1 p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="border-t border-dark-border pt-6 mt-6">
                <h3 className="text-xl font-bebas uppercase mb-4 text-lime-green">
                  Dados de Acesso
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                      Nome de Usuário *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                      placeholder="Escolha um nome de usuário"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                        Senha *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        autoComplete="new-password"
                        className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                        Confirmar Senha *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength="6"
                        autoComplete="new-password"
                        className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                        placeholder="Repita a senha"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black border border-lime-green/30 p-4 text-sm text-gray-300">
                <p>* Campos obrigatórios</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 p-4 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all text-lg disabled:opacity-50"
              >
                {loading ? 'Criando conta...' : 'Continuar para Pagamento'}
              </button>
            </form>
          </div>

          {/* Resumo do Plano */}
          <div className="mt-6 bg-black border border-dark-border p-6">
            <h3 className="text-xl font-bebas uppercase mb-3 text-lime-green">
              Plano Selecionado
            </h3>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold">Plano {plan.name}</p>
                <p className="text-sm text-gray-400">{plan.frequency}</p>
              </div>
              <p className="text-2xl font-bebas text-lime-green">
                R$ {plan.price}
                <span className="text-sm text-gray-400">/mês</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
