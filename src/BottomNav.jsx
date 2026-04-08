import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, TrendingUp, Salad, LayoutDashboard, LogOut, Settings } from 'lucide-react';
import { auth, clearSession, getUser } from './services/alunoApi';
import matheusLogo from './assets/logotipo_matheus_personal.png';

const planColors = {
  BRONZE:   { text: 'text-orange-400', border: 'border-orange-400', ring: 'ring-orange-400/40' },
  PRATA:    { text: 'text-gray-300',   border: 'border-gray-300',   ring: 'ring-gray-300/40'   },
  OURO:     { text: 'text-yellow-400', border: 'border-yellow-400', ring: 'ring-yellow-400/40' },
  DIAMANTE: { text: 'text-purple-400', border: 'border-purple-400', ring: 'ring-purple-400/40' },
};

const planBadge = {
  BRONZE: 'bg-orange-400/15 text-orange-400 border-orange-400/30',
  PRATA:  'bg-gray-300/15 text-gray-300 border-gray-300/30',
  OURO:   'bg-yellow-400/15 text-yellow-400 border-yellow-400/30',
  DIAMANTE: 'bg-purple-400/15 text-purple-400 border-purple-400/30',
};

const NAV = [
  { path: '/dashboard',          icon: <LayoutDashboard size={20} />, label: 'Início'   },
  { path: '/dashboard/treinos',  icon: <Dumbbell size={20} />,        label: 'Treinos'  },
  { path: '/dashboard/evolucao', icon: <TrendingUp size={20} />,      label: 'Evolução' },
  { path: '/dashboard/nutricao', icon: <Salad size={20} />,           label: 'Nutrição', diamanteOnly: true },
];

export default function AppNav() {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const user         = getUser() ?? {};
  const pc           = planColors[user.plan] ?? planColors.OURO;
  const pb           = planBadge[user.plan] ?? planBadge.OURO;
  const initials     = (user.name ?? 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const firstName    = (user.name ?? 'Aluno').split(' ')[0];

  const isActive = (path) =>
    pathname === path || (path !== '/dashboard' && pathname.startsWith(path));

  const handleNav = (item) => {
    if (item.diamanteOnly && user.plan !== 'DIAMANTE') return;
    navigate(item.path);
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await auth.logout(localStorage.getItem('refresh_token')).catch(() => {});
    clearSession();
    navigate('/login');
  };

  return (
    <>
      {/* ─── DESKTOP: TopNav (md+) ─────────────────────────────── */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-[68px] items-center px-8 gap-8"
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)', borderBottom: '1px solid #1f1f1f' }}>

        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} className="flex-shrink-0 opacity-90 hover:opacity-100 transition-opacity">
          <img src={matheusLogo} alt="Matheus Personal" className="h-8 brightness-0 invert" />
        </button>

        {/* Divisor */}
        <div className="w-px h-6 bg-white/10 flex-shrink-0" />

        {/* Links centralizados */}
        <nav className="flex items-center justify-center gap-0.5 flex-1">
          {NAV.map((item) => {
            const locked = item.diamanteOnly && user.plan !== 'DIAMANTE';
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item)}
                disabled={locked}
                className={`relative flex items-center gap-2 px-5 py-2 text-[13px] font-semibold uppercase tracking-wider transition-all rounded-sm
                  ${locked ? 'opacity-25 cursor-not-allowed' : ''}
                  ${active
                    ? 'text-lime-green bg-lime-green/8'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                  }`}
              >
                {item.icon}
                {item.label}
                {locked && <span className="text-[10px]">💎</span>}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-lime-green rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Divisor */}
        <div className="w-px h-6 bg-white/10 flex-shrink-0" />

        {/* Avatar + info + sair */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Avatar clicável */}
          <button
            onClick={() => navigate('/dashboard/perfil')}
            className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold bg-dark-card transition-all hover:scale-105 ring-2 ring-offset-1 ring-offset-black ${pc.border} ${pc.text} ${pc.ring}`}
          >
            {initials}
          </button>

          {/* Nome + plano */}
          <div className="text-left">
            <p className="text-white text-sm font-semibold leading-tight">{firstName}</p>
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded-sm mt-0.5 ${pb}`}>
              {user.plan ?? '—'}
            </span>
          </div>

          {/* Botão sair — só ícone */}
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="w-9 h-9 flex items-center justify-center rounded-sm border border-white/10 text-gray-500 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/8 transition-all ml-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ─── MOBILE: TopBar fixa (< md) ────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-4"
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 100%)', borderBottom: '1px solid #1f1f1f' }}>

        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} className="flex-shrink-0">
          <img src={matheusLogo} alt="MP" className="h-7 brightness-0 invert opacity-90" />
        </button>

        {/* Avatar + menu */}
        <div className="relative flex items-center gap-2" ref={menuRef}>
          <div className="text-right">
            <p className="text-white text-xs font-semibold leading-tight">{firstName}</p>
            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border rounded-sm mt-0.5 ${pb}`}>
              {user.plan ?? '—'}
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold bg-dark-card ring-2 ring-offset-1 ring-offset-black transition-all active:scale-95 ${pc.border} ${pc.text} ${pc.ring}`}
          >
            {initials}
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute top-12 right-0 w-44 bg-[#111] border border-white/10 shadow-xl z-[60] overflow-hidden">
              <button
                onClick={() => { setMenuOpen(false); navigate('/dashboard/perfil'); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <Settings size={15} className="text-gray-400" />
                Configurações
              </button>
              <div className="border-t border-white/10" />
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── MOBILE: BottomNav (< md) ──────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[60px] flex items-center"
        style={{ background: 'linear-gradient(0deg, #0a0a0a 0%, #111111 100%)', borderTop: '1px solid #1f1f1f' }}>
        <div className="flex items-center justify-around w-full px-2">
          {NAV.map((item) => {
            const locked = item.diamanteOnly && user.plan !== 'DIAMANTE';
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item)}
                className={`relative flex flex-col items-center gap-1 px-3 py-1.5 transition-all
                  ${locked ? 'opacity-25 cursor-not-allowed' : ''}
                  ${active ? 'text-lime-green' : 'text-gray-600 hover:text-gray-400'}`}
              >
                {active && (
                  <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-5 h-[2px] bg-lime-green rounded-full" />
                )}
                <span className={active ? 'drop-shadow-[0_0_6px_rgba(132,204,22,0.6)]' : ''}>
                  {item.icon}
                </span>
                <span className="text-[9px] uppercase tracking-wider font-semibold">{item.label}</span>
                {locked && <span className="absolute -top-0.5 -right-0.5 text-[8px]">💎</span>}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
