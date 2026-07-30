import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import matheusLogo from './assets/logotipo_matheus_personal.png';
import { auth } from './services/alunoApi';

const inp = 'w-full p-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Se tem token na URL → tela de nova senha; senão → tela de solicitar e-mail
  const [step, setStep] = useState(token ? 'reset' : 'request');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  // Solicitar e-mail de recuperação
  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await auth.forgotPassword(email).catch(() => null);
    setLoading(false);
    if (res?.message || res?.detail === undefined) {
      setDone(true);
    } else {
      setError(res?.detail ?? 'Erro ao enviar e-mail. Tente novamente.');
    }
  };

  // Redefinir senha com token
  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (password.length < 6)  { setError('Mínimo 6 caracteres.'); return; }
    setLoading(true); setError('');
    const res = await auth.resetPassword(token, password).catch(() => null);
    setLoading(false);
    if (res?.message) {
      setDone(true);
    } else {
      setError(res?.detail ?? 'Link inválido ou expirado. Solicite um novo.');
    }
  };

  return (
    <div className="min-h-screen sport-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/"><img src={matheusLogo} alt="Matheus Personal" className="h-16 mx-auto mb-4 brightness-0 invert" /></a>
          <p className="text-gray-400 text-sm uppercase tracking-wider">Área do Aluno</p>
        </div>

        <div className="bg-dark-card border border-dark-border p-8">

          {/* ── Solicitação enviada / senha redefinida ── */}
          {done ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle size={48} className="text-lime-green mx-auto" />
              <h2 className="text-2xl font-bebas uppercase text-white">
                {step === 'request' ? 'E-mail enviado!' : 'Senha redefinida!'}
              </h2>
              <p className="text-gray-400 text-sm">
                {step === 'request'
                  ? 'Verifique sua caixa de entrada e clique no link para redefinir sua senha.'
                  : 'Sua senha foi alterada com sucesso. Faça login com a nova senha.'}
              </p>
              <button onClick={() => navigate('/login')}
                className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all flex items-center justify-center gap-2">
                Ir para o Login <ArrowRight size={18} />
              </button>
            </div>

          ) : step === 'request' ? (
            /* ── Solicitar recuperação ── */
            <>
              <h2 className="text-2xl font-bebas uppercase text-center mb-2 text-white">Recuperar Senha</h2>
              <p className="text-gray-500 text-sm text-center mb-6">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={handleRequest} className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">E-mail</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full pl-11 pr-4 py-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                      placeholder="seu@email.com" />
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 p-3">{error}</p>}
                <button type="submit" disabled={loading || !email}
                  className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? 'Enviando...' : <> Enviar link <ArrowRight size={18} /> </>}
                </button>
              </form>
            </>

          ) : (
            /* ── Nova senha ── */
            <>
              <h2 className="text-2xl font-bebas uppercase text-center mb-2 text-white">Nova Senha</h2>
              <p className="text-gray-500 text-sm text-center mb-6">Digite e confirme sua nova senha.</p>
              <form onSubmit={handleReset} className="space-y-5">
                {[
                  { label: 'Nova senha',         val: password, set: setPassword },
                  { label: 'Confirmar nova senha', val: confirm,  set: setConfirm  },
                ].map(({ label, val, set }, i) => (
                  <div key={i}>
                    <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wide">{label}</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={val} onChange={e => set(e.target.value)} required minLength={6}
                        className="w-full pl-11 pr-11 py-4 bg-black border border-dark-border text-white focus:outline-none focus:border-lime-green transition-colors"
                        placeholder="••••••••"
                      />
                      {i === 0 && (
                        <button type="button" onClick={() => setShowPw(v => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 p-3">{error}</p>}
                <button type="submit" disabled={loading || !password || !confirm}
                  className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? 'Salvando...' : <> Redefinir Senha <ArrowRight size={18} /> </>}
                </button>
              </form>
            </>
          )}

          {!done && (
            <div className="mt-6 text-center">
              <a href="/login" className="text-sm text-gray-400 hover:text-lime-green transition-colors">
                ← Voltar para o Login
              </a>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-gray-600 text-xs">
          <p>© {new Date().getFullYear()} Matheus Personal. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
