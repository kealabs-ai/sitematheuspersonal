import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import matheusLogo from './assets/logotipo_matheus_personal.png';
import { auth, passkeys, saveSession } from './services/alunoApi';
import UpgradeModal from './UpgradeModal';
import InstallPwaModal from './components/InstallPwaModal';
import { hasPlatformAuthenticator, hasWebAuthn } from './utils/pwa';
import { prepareCreationOptions, prepareRequestOptions, creationResponse, assertionResponse } from './utils/passkeys';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inactiveModal, setInactiveModal] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [passkeyPrompt, setPasskeyPrompt] = useState(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    hasPlatformAuthenticator().then((available) => setPasskeySupported(hasWebAuthn() && available));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await auth.login(email, password);
      if (data.access_token) {
        saveSession(data);
        if (passkeySupported) setPasskeyPrompt(data);
        else navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        const detail = data.detail ?? data.message ?? '';
        if (detail.toLowerCase().includes('senha')) {
          setError('Senha incorreta. Verifique e tente novamente.');
        } else if (detail.toLowerCase().includes('encontrado')) {
          setError('E-mail não cadastrado. Verifique o endereço digitado.');
        } else if (detail.toLowerCase().includes('inativa')) {
          setInactiveModal(true);
        } else {
          setError('Não foi possível entrar. Verifique seus dados e tente novamente.');
        }
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const activatePasskey = async () => {
    setPasskeyLoading(true);
    setError('');
    try {
      const options = await passkeys.registerOptions();
      const publicKey = prepareCreationOptions(options.publicKey ?? options);
      const credential = await navigator.credentials.create({ publicKey });
      if (!credential) throw new Error('Registro cancelado');
      const result = await passkeys.registerVerify(creationResponse(credential));
      if (result?.error || result?.success === false) throw new Error(result.detail || result.message || 'Não foi possível ativar');
    } catch (err) {
      setError(err?.name === 'NotAllowedError' ? 'A ativação da biometria foi cancelada.' : (err.message || 'Não foi possível ativar o login por biometria.'));
      setPasskeyLoading(false);
      return;
    }
    setPasskeyLoading(false);
    setPasskeyPrompt(null);
    navigate(passkeyPrompt?.user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  const loginWithPasskey = async () => {
    setPasskeyLoading(true);
    setError('');
    try {
      const options = await passkeys.authenticateOptions(email);
      if (options?.error) throw new Error(options.detail || options.message || 'Não foi possível iniciar a biometria.');
      const publicKey = prepareRequestOptions(options.publicKey ?? options);
      const credential = await navigator.credentials.get({ publicKey });
      if (!credential) throw new Error('Autenticação cancelada');
      const data = await passkeys.authenticateVerify(email, assertionResponse(credential));
      if (!data.access_token) throw new Error(data.detail || data.message || 'Credencial inválida ou revogada.');
      saveSession(data);
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err?.name === 'NotAllowedError' ? 'A autenticação por biometria foi cancelada.' : (err.message || 'Falha na autenticação por biometria.'));
    } finally {
      setPasskeyLoading(false);
    }
  };

  const continueAfterPrompt = () => {
    setPasskeyPrompt(null);
    navigate(passkeyPrompt?.user?.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen sport-bg flex items-center justify-center px-4">
      {inactiveModal && (
        <UpgradeModal closable={false} expired={true} onClose={() => setInactiveModal(false)} />
      )}
      {passkeyPrompt && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="passkey-title" className="w-full max-w-md border border-lime-green/30 bg-[#111] p-6">
            <h2 id="passkey-title" className="text-2xl font-bebas uppercase text-white">Entre com biometria nos próximos acessos</h2>
            <p className="mt-3 text-sm leading-6 text-gray-300">Ative o acesso rápido e seguro ao Matheus Personal usando a biometria ou o desbloqueio do seu celular.</p>
            {error && <p className="mt-3 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
            <button type="button" onClick={activatePasskey} disabled={passkeyLoading} className="mt-5 w-full bg-lime-green py-4 font-bold uppercase text-black disabled:opacity-70">
              {passkeyLoading ? 'Configurando...' : 'Ativar acesso rápido'}
            </button>
            <button type="button" onClick={continueAfterPrompt} className="mt-2 w-full py-3 text-sm text-gray-400">Agora não</button>
          </div>
        </div>
      )}
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

            <InstallPwaModal showTrigger />

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
            {passkeySupported && (
              <button
                type="button"
                onClick={loginWithPasskey}
                disabled={passkeyLoading}
                className="w-full border border-lime-green/60 text-lime-green font-bold py-4 uppercase hover:bg-lime-green/10 disabled:opacity-70"
              >
                {passkeyLoading ? 'Verificando...' : 'Entrar com biometria'}
              </button>
            )}
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
