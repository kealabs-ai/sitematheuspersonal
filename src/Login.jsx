import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import matheusLogo from './assets/logotipo_matheus_personal.png';
import { auth, saveSession } from './services/alunoApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await auth.login(email, password);
      if (data.access_token) {
        saveSession(data);
        navigate('/dashboard');
      } else {
        setError(data.message ?? 'Credenciais inválidas.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen sport-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/"><img 
            src={matheusLogo} 
            alt="Matheus Personal" 
            className="h-16 mx-auto mb-4 brightness-0 invert"
          /></a>
          <p className="text-gray-400 text-sm uppercase tracking-wider">Área do Aluno</p>
        </div>

        <div className="bg-dark-card border border-dark-border p-8">
          <h2 className="text-2xl font-bebas uppercase text-center mb-6 text-white">
            Faça seu Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                Usuário / E-mail
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                placeholder="Digite seu e-mail"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                placeholder="Digite sua senha"
                required
              />
            </div>

            <div className="text-right">
              <a href="/recuperar-senha" className="text-sm text-lime-green hover:text-neon-green transition-colors">
                Esqueci minha senha
              </a>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? 'Entrando...' : <> Entrar <ArrowRight className="ml-2" size={20} /> </>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-lime-green transition-colors">
              ← Voltar para o site
            </a>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-600 text-xs">
          <p>© {new Date().getFullYear()} Matheus Personal. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
