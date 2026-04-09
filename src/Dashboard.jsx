import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, TrendingUp, Salad, User, Flame, Calendar, ChevronRight, Trophy, Zap } from 'lucide-react';
import { dashboard, getUser } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import OnboardingModal from './OnboardingModal';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import { NumberTicker } from './components/magicui/number-ticker';
import { ShimmerButton } from './components/magicui/shimmer-button';
import { Meteors } from './components/magicui/meteors';
import { AnimatedGradientText } from './components/magicui/animated-gradient-text';
import { ShineBorder } from './components/magicui/shine-border';

const modules = [
  { icon: <Dumbbell size={28} />, label: 'Treinos',  path: '/dashboard/treinos',  color: 'border-lime-green text-lime-green', desc: 'Ver plano da semana' },
  { icon: <TrendingUp size={28} />, label: 'Evolução', path: '/dashboard/evolucao', color: 'border-blue-400 text-blue-400',   desc: 'Métricas e gráficos' },
  { icon: <Salad size={28} />,    label: 'Nutrição', path: '/dashboard/nutricao', color: 'border-purple-400 text-purple-400', desc: 'Plano alimentar', diamanteOnly: true },
  { icon: <User size={28} />,     label: 'Perfil',   path: '/dashboard/perfil',   color: 'border-gray-400 text-gray-400',    desc: 'Seus dados' },
];

const planColors = {
  BRONZE:   'text-orange-400 border-orange-400',
  PRATA:    'text-gray-300 border-gray-300',
  OURO:     'text-yellow-400 border-yellow-400',
  DIAMANTE: 'text-purple-400 border-purple-400',
};

export default function Dashboard() {
  useBlockBack();
  const navigate = useNavigate();
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    dashboard.summary()
      .then(data => {
        setSummary(data);
        const hasFlag = !!localStorage.getItem('onboarding_done');
        const hasPlan = Array.isArray(data?.week) && data.week.length > 0;
        if (!hasFlag && !hasPlan) setShowOnboarding(true);
        else if (hasPlan && !hasFlag) localStorage.setItem('onboarding_done', '1');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen sport-bg flex items-center justify-center">
      <p className="text-lime-green font-bebas text-2xl animate-pulse">Carregando...</p>
    </div>
  );

  const user         = summary?.user ?? getUser() ?? {};
  const stats        = summary?.stats ?? { streak: 0, trainings_this_week: 0, days_active: 0 };
  const WEEK_LABEL   = { 1:'SEG', 2:'TER', 3:'QUA', 4:'QUI', 5:'SEX', 6:'SAB', 7:'DOM' };
  const week         = (summary?.week ?? []).map(d => ({ ...d, day: d.day ?? WEEK_LABEL[d.week_day] ?? '?', status: d.is_rest ? 'rest' : (d.status === 'pending' ? 'upcoming' : (d.status ?? 'upcoming')) }));
  const todayWorkout = summary?.today_workout ?? null;
  const badgesEarned = summary?.badges_earned ?? 0;
  const badgesTotal  = summary?.badges_total ?? 0;

  return (
    <div className="min-h-dvh sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-10">
      {/* Orbe IA pulsante */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,180,216,0.08)_0%,transparent_70%)] animate-ai-pulse pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,100,180,0.06)_0%,transparent_70%)] animate-ai-pulse pointer-events-none z-0" style={{ animationDelay: '2s' }} />

      {showOnboarding && (
        <OnboardingModal userName={user.name} onComplete={() => { setShowOnboarding(false); window.location.reload(); }} />
      )}

      <main className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Saudação */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Bem-vindo de volta</p>
          <div className="flex items-center justify-between mt-1">
            <h1 className="text-4xl font-bebas">
              <AnimatedGradientText>{(user.name ?? 'Aluno').split(' ')[0]}</AnimatedGradientText>
              {' '}<span className="text-white">💪</span>
            </h1>
            <span className={`border px-3 py-1 text-xs font-bold uppercase tracking-wider ${planColors[user.plan] ?? 'text-lime-green border-lime-green'}`}>
              Plano {user.plan ?? '—'}
            </span>
          </div>
        </motion.div>

        {/* Stats rápidos com NumberTicker */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 md:grid-cols-3 gap-3">
          {[
            { icon: <Flame size={20} />,    value: stats.streak,              label: 'Dias seguidos',    color: 'text-orange-400', beam: ['#f97316','#fb923c'] },
            { icon: <Calendar size={20} />, value: stats.trainings_this_week, label: 'Treinos na semana', color: 'text-lime-green',  beam: ['#00B4D8','#0096C7'] },
            { icon: <Trophy size={20} />,   value: stats.days_active,         label: 'Dias de jornada',  color: 'text-yellow-400', beam: ['#facc15','#fbbf24'] },
          ].map((s, i) => (
            <div key={i} className="relative bg-dark-card border border-dark-border p-4 text-center overflow-hidden">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <div className={`text-3xl font-bebas ${s.color}`}>
                <NumberTicker value={s.value} />
              </div>
              <div className="text-gray-500 text-[10px] uppercase tracking-wide leading-tight mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Semana visual */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="relative bg-dark-card border border-dark-border p-4 overflow-hidden">
          <Meteors number={8} />
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Semana atual</p>
          <div className="flex justify-between gap-1">
            {week.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-gray-500 uppercase">{d.day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${d.status === 'done'  ? 'bg-lime-green border-lime-green text-black' :
                    d.status === 'today' ? 'border-lime-green text-lime-green animate-pulse' :
                    d.status === 'rest'  ? 'border-dark-border text-gray-600' :
                    'border-dark-border text-gray-600'}`}>
                  {d.status === 'done' ? '✓' : d.status === 'today' ? '▶' : d.status === 'rest' ? '—' : '·'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Treino do dia */}
        {todayWorkout && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <ShineBorder className="bg-black" color={['#00B4D8', '#0096C7']}>
              <button onClick={() => navigate('/dashboard/treinos')}
                className="w-full p-5 text-left hover:bg-lime-green/5 transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lime-green text-xs uppercase tracking-widest font-bold mb-1">
                      <Zap size={12} className="inline mr-1" />Hoje
                    </p>
                    <h2 className="text-2xl font-bebas text-white">{todayWorkout.name}</h2>
                    <p className="text-gray-400 text-sm mt-1">{todayWorkout.exercises_count} exercícios · {todayWorkout.duration_min} min</p>
                  </div>
                  <div className="bg-lime-green text-black p-3 group-hover:scale-110 transition-transform">
                    <ChevronRight size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <ShimmerButton className="w-full justify-center py-2.5" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
                    <Zap size={14} /> Iniciar Treino
                  </ShimmerButton>
                </div>
              </button>
            </ShineBorder>
          </motion.div>
        )}

        {/* Módulos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modules.map((m, i) => {
            const locked = m.diamanteOnly && user.plan !== 'DIAMANTE';
            return locked ? (
              <div key={i} className="relative bg-dark-card border-2 border-dark-border p-5 text-left opacity-50 overflow-hidden cursor-not-allowed">
                <div className="mb-3 text-gray-600 inline-block">{m.icon}</div>
                <div className="text-xl font-bebas uppercase text-gray-600">{m.label}</div>
                <div className="text-gray-700 text-xs mt-1">{m.desc}</div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-center">
                    <span className="text-purple-400 text-lg">💎</span>
                    <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mt-1">Plano Diamante</p>
                  </div>
                </div>
              </div>
            ) : (
              <button key={i} onClick={() => navigate(m.path)}
                className={`relative bg-dark-card border-2 ${m.color.split(' ')[0]} p-5 text-left hover:bg-white/5 transition-all group overflow-hidden`}>
                <div className={`mb-3 ${m.color.split(' ')[1]} group-hover:scale-110 transition-transform inline-block`}>{m.icon}</div>
                <div className={`text-xl font-bebas uppercase ${m.color.split(' ')[1]}`}>{m.label}</div>
                <div className="text-gray-500 text-xs mt-1">{m.desc}</div>
              </button>
            );
          })}
        </motion.div>

        {/* Conquistas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="relative bg-dark-card border border-dark-border p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Conquistas</p>
            <span className="text-xs text-lime-green font-bold">
              <NumberTicker value={badgesEarned} />/{badgesTotal}
            </span>
          </div>
          <button onClick={() => navigate('/dashboard/evolucao')} className="w-full text-left">
            <div className="w-full bg-dark-border h-1.5 mb-3">
              <div className="bg-lime-green h-1.5 transition-all" style={{ width: badgesTotal ? `${(badgesEarned / badgesTotal) * 100}%` : '0%' }} />
            </div>
            <p className="text-gray-500 text-xs">Ver todas as conquistas →</p>
          </button>
        </motion.div>

        <p className="text-center text-gray-700 text-xs pb-4">
          © {new Date().getFullYear()} Matheus Personal · <a href="/" className="hover:text-lime-green transition-colors">Voltar ao site</a>
        </p>
      </main>

      <AppFooter />
      <BottomNav />
    </div>
  );
}
