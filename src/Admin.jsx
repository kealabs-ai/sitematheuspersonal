import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Dumbbell, Salad, DollarSign,
  PlayCircle, LogOut, Menu, X, ShieldCheck, ArrowRight,
} from 'lucide-react';
import { auth, clearSession, getUser, saveSession } from './services/alunoApi';
import matheusLogo from './assets/logotipo_matheus_personal.png';
import AdminAlunos     from './admin/AdminAlunos';
import AdminVideos     from './admin/AdminVideos';
import AdminTreinos    from './admin/AdminTreinos';
import AdminNutricao   from './admin/AdminNutricao';
import AdminFinanceiro from './admin/AdminFinanceiro';

// ─── Módulos do painel ────────────────────────────────────────────────────────
const MODULES = [
  { key: 'alunos',     label: 'Alunos',     icon: <Users size={18} />,      color: 'text-lime-green',  desc: 'Gerenciar alunos e planos' },
  { key: 'videos',     label: 'Vídeos',     icon: <PlayCircle size={18} />, color: 'text-blue-400',    desc: 'Postar e organizar vídeos' },
  { key: 'treinos',    label: 'Treinos',    icon: <Dumbbell size={18} />,   color: 'text-orange-400',  desc: 'Criar planos e exercícios' },
  { key: 'nutricao',   label: 'Nutrição',   icon: <Salad size={18} />,      color: 'text-purple-400',  desc: 'Planos alimentares' },
  { key: 'financeiro', label: 'Financeiro', icon: <DollarSign size={18} />, color: 'text-yellow-400',  desc: 'Receitas e pedidos' },
];

const MODULE_COMPONENTS = {
  alunos:     () => <AdminAlunos />,
  videos:     () => <AdminVideos />,
  treinos:    () => <AdminTreinos />,
  nutricao:   () => <AdminNutricao />,
  financeiro: () => <AdminFinanceiro />,
};

// ─── Tela de login admin ──────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const data = await auth.login(email, password);
      if (data.access_token) {
        if (data.user?.role !== 'admin') { setError('Acesso restrito a administradores.'); setLoading(false); return; }
        saveSession(data);
        onLogin(data.user);
      } else {
        setError(data.message ?? data.error_description ?? JSON.stringify(data));
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen sport-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={matheusLogo} alt="Matheus Personal" className="h-14 mx-auto mb-4 brightness-0 invert" />
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm uppercase tracking-wider">
            <ShieldCheck size={16} className="text-lime-green" /> Painel Administrativo
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border p-8">
          <h2 className="text-2xl font-bebas uppercase text-center mb-6 text-white">Acesso Admin</h2>
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="username"
                className="w-full p-3 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors"
                placeholder="admin@email.com" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                autoComplete="current-password"
                className="w-full p-3 bg-black border border-dark-border text-white text-sm focus:outline-none focus:border-lime-green transition-colors"
                placeholder="••••••••" />
            </div>
            {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 p-2.5">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-60">
              {loading ? 'Entrando...' : <><ShieldCheck size={16} /> Entrar <ArrowRight size={16} /></>}
            </button>
          </form>
          <div className="mt-5 text-center">
            <a href="/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Área do Aluno</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Painel principal ─────────────────────────────────────────────────────────
function AdminPanel({ user, onLogout }) {
  const [active, setActive]     = useState('alunos');
  const [sideOpen, setSideOpen] = useState(false);

  const current = MODULES.find(m => m.key === active);

  const handleLogout = async () => {
    await auth.logout(localStorage.getItem('refresh_token')).catch(() => {});
    clearSession();
    onLogout();
  };

  const NavItem = ({ mod }) => (
    <button onClick={() => { setActive(mod.key); setSideOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group ${active === mod.key ? `bg-white/5 border-l-2 border-lime-green ${mod.color}` : 'text-gray-500 hover:text-gray-300 hover:bg-white/3 border-l-2 border-transparent'}`}>
      <span className={active === mod.key ? mod.color : 'text-gray-600 group-hover:text-gray-400'}>{mod.icon}</span>
      <div>
        <p className="text-sm font-semibold">{mod.label}</p>
        <p className="text-[10px] text-gray-600 leading-tight">{mod.desc}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen sport-bg text-white font-inter flex flex-col">

      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 md:px-6"
        style={{ background: 'linear-gradient(180deg,#0a0a0a 0%,#111 100%)', borderBottom: '1px solid #1f1f1f' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSideOpen(v => !v)} className="md:hidden text-gray-400 hover:text-white transition-colors">
            <Menu size={22} />
          </button>
          <img src={matheusLogo} alt="MP" className="h-8 brightness-0 invert opacity-90" />
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 border border-dark-border px-2.5 py-1">
            <ShieldCheck size={12} className="text-lime-green" /> Admin
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-white text-xs font-semibold">{user.name}</p>
            <p className="text-gray-600 text-[10px]">{user.email}</p>
          </div>
          <button onClick={handleLogout} title="Sair"
            className="flex items-center gap-1.5 text-xs text-gray-500 border border-dark-border px-3 py-1.5 hover:border-red-500/50 hover:text-red-400 transition-colors">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      <div className="flex flex-1 pt-14">

        {/* ── Sidebar desktop ── */}
        <aside className="hidden md:flex flex-col w-56 fixed top-14 bottom-0 border-r border-dark-border bg-[#0a0a0a] overflow-y-auto">
          <div className="py-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest px-4 mb-2">Módulos</p>
            {MODULES.map(mod => <NavItem key={mod.key} mod={mod} />)}
          </div>
          <div className="mt-auto p-4 border-t border-dark-border">
            <a href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={12} /> Área do Aluno
            </a>
          </div>
        </aside>

        {/* ── Sidebar mobile (drawer) ── */}
        <AnimatePresence>
          {sideOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setSideOpen(false)} />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.22 }}
                className="fixed top-14 bottom-0 left-0 w-64 bg-[#0a0a0a] border-r border-dark-border z-50 md:hidden overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Módulos</p>
                  <button onClick={() => setSideOpen(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
                </div>
                {MODULES.map(mod => <NavItem key={mod.key} mod={mod} />)}
                <div className="p-4 border-t border-dark-border mt-4">
                  <a href="/dashboard" className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1.5">
                    <LayoutDashboard size={12} /> Área do Aluno
                  </a>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Conteúdo principal ── */}
        <main className="flex-1 md:ml-56 p-4 md:p-6 min-h-0">
          <div className="max-w-5xl mx-auto">
            {/* Cabeçalho da seção */}
            <div className="flex items-center gap-3 mb-6">
              <span className={current?.color}>{current?.icon}</span>
              <div>
                <h1 className="text-2xl font-bebas uppercase text-white">{current?.label}</h1>
                <p className="text-gray-500 text-xs">{current?.desc}</p>
              </div>
            </div>

            {/* Módulo ativo */}
            <AnimatePresence mode="wait">
              <motion.div key={active}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}>
                {MODULE_COMPONENTS[active]?.()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export default function Admin() {
  const [user, setUser] = useState(() => {
    const u = getUser();
    return u?.role === 'admin' ? u : null;
  });

  // Verifica token ao montar
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setUser(null); return; }
    const u = getUser();
    if (u?.role !== 'admin') setUser(null);
  }, []);

  if (!user) return <AdminLogin onLogin={setUser} />;
  return <AdminPanel user={user} onLogout={() => setUser(null)} />;
}
