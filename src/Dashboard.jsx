import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell, TrendingUp, Salad, User, LogOut,
  Flame, Calendar, ChevronRight, Trophy, Zap, Bell
} from 'lucide-react';
import matheusLogo from './assets/logotipo_matheus_personal.png';

// Mock — substituir por dados reais da API
const MOCK_USER = {
  name: 'João Silva',
  plan: 'OURO',
  streak: 12,
  trainingsThisWeek: 3,
  nextTraining: { name: 'Peito + Tríceps', exercises: 6, day: 'Hoje' },
  goal: 'Hipertrofia',
  startDate: '2024-01-15',
  notifications: 2,
};

const MOCK_WEEK = [
  { day: 'Seg', done: true },
  { day: 'Ter', done: true },
  { day: 'Qua', done: false, today: true },
  { day: 'Qui', done: false },
  { day: 'Sex', done: false },
  { day: 'Sáb', done: false },
  { day: 'Dom', done: false, rest: true },
];

const MOCK_BADGES = [
  { icon: '🔥', label: 'Sequência de 12 dias', earned: true },
  { icon: '💪', label: 'Primeiro treino', earned: true },
  { icon: '🏆', label: '30 dias seguidos', earned: false },
  { icon: '⚡', label: 'Meta atingida', earned: false },
];

const modules = [
  { icon: <Dumbbell size={28} />, label: 'Treinos', path: '/dashboard/treinos', color: 'border-lime-green text-lime-green', desc: 'Ver plano da semana' },
  { icon: <TrendingUp size={28} />, label: 'Evolução', path: '/dashboard/evolucao', color: 'border-blue-400 text-blue-400', desc: 'Métricas e gráficos' },
  { icon: <Salad size={28} />, label: 'Nutrição', path: '/dashboard/nutricao', color: 'border-purple-400 text-purple-400', desc: 'Plano alimentar' },
  { icon: <User size={28} />, label: 'Perfil', path: '/dashboard/perfil', color: 'border-gray-400 text-gray-400', desc: 'Seus dados' },
];

const planColors = {
  BRONZE: 'text-orange-400 border-orange-400',
  PRATA: 'text-gray-300 border-gray-300',
  OURO: 'text-yellow-400 border-yellow-400',
  DIAMANTE: 'text-purple-400 border-purple-400',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(MOCK_USER);

  const daysActive = Math.floor((new Date() - new Date(user.startDate)) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-dark-bg text-white font-inter">

      {/* Header */}
      <header className="bg-black border-b border-dark-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <img src={matheusLogo} alt="Matheus Personal" className="h-8 brightness-0 invert" />
        <div className="flex items-center gap-4">
          <button className="relative text-gray-400 hover:text-lime-green transition-colors">
            <Bell size={22} />
            {user.notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-lime-green text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {user.notifications}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-gray-400 hover:text-red-400 transition-colors"
            title="Sair"
          >
            <LogOut size={22} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Saudação */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Bem-vindo de volta</p>
          <div className="flex items-center justify-between mt-1">
            <h1 className="text-4xl font-bebas text-white">
              {user.name.split(' ')[0]} <span className="text-lime-green">💪</span>
            </h1>
            <span className={`border px-3 py-1 text-xs font-bold uppercase tracking-wider ${planColors[user.plan] ?? 'text-lime-green border-lime-green'}`}>
              Plano {user.plan}
            </span>
          </div>
        </motion.div>

        {/* Stats rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: <Flame size={20} />, value: user.streak, label: 'Dias seguidos', color: 'text-orange-400' },
            { icon: <Calendar size={20} />, value: user.trainingsThisWeek, label: 'Treinos na semana', color: 'text-lime-green' },
            { icon: <Trophy size={20} />, value: daysActive, label: 'Dias de jornada', color: 'text-yellow-400' },
          ].map((s, i) => (
            <div key={i} className="bg-dark-card border border-dark-border p-4 text-center">
              <div className={`flex justify-center mb-1 ${s.color}`}>{s.icon}</div>
              <div className={`text-3xl font-bebas ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-[10px] uppercase tracking-wide leading-tight mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Semana visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-dark-card border border-dark-border p-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Semana atual</p>
          <div className="flex justify-between gap-1">
            {MOCK_WEEK.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[10px] text-gray-500 uppercase">{d.day}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${d.done ? 'bg-lime-green border-lime-green text-black' :
                    d.today ? 'border-lime-green text-lime-green animate-pulse' :
                    d.rest ? 'border-dark-border text-gray-600' :
                    'border-dark-border text-gray-600'}`}
                >
                  {d.done ? '✓' : d.today ? '▶' : d.rest ? '—' : '·'}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Treino do dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => navigate('/dashboard/treinos')}
            className="w-full bg-black border-2 border-lime-green p-5 text-left hover:bg-lime-green/5 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lime-green text-xs uppercase tracking-widest font-bold mb-1">
                  <Zap size={12} className="inline mr-1" />{user.nextTraining.day}
                </p>
                <h2 className="text-2xl font-bebas text-white">{user.nextTraining.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{user.nextTraining.exercises} exercícios</p>
              </div>
              <div className="bg-lime-green text-black p-3 group-hover:scale-110 transition-transform">
                <ChevronRight size={24} />
              </div>
            </div>
            <div className="mt-4 bg-lime-green/10 border border-lime-green/30 px-4 py-2 text-center">
              <span className="text-lime-green font-bold uppercase text-sm tracking-wider">Iniciar Treino ▶</span>
            </div>
          </button>
        </motion.div>

        {/* Módulos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3"
        >
          {modules.map((m, i) => (
            <button
              key={i}
              onClick={() => navigate(m.path)}
              className={`bg-dark-card border-2 ${m.color.split(' ')[0]} p-5 text-left hover:bg-white/5 transition-all group`}
            >
              <div className={`mb-3 ${m.color.split(' ')[1]} group-hover:scale-110 transition-transform inline-block`}>
                {m.icon}
              </div>
              <div className={`text-xl font-bebas uppercase ${m.color.split(' ')[1]}`}>{m.label}</div>
              <div className="text-gray-500 text-xs mt-1">{m.desc}</div>
            </button>
          ))}
        </motion.div>

        {/* Conquistas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-dark-card border border-dark-border p-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Conquistas</p>
          <div className="grid grid-cols-2 gap-2">
            {MOCK_BADGES.map((b, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 border ${b.earned ? 'border-lime-green/30 bg-lime-green/5' : 'border-dark-border opacity-40'}`}>
                <span className="text-2xl">{b.icon}</span>
                <span className={`text-xs font-semibold ${b.earned ? 'text-white' : 'text-gray-600'}`}>{b.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="text-center text-gray-700 text-xs pb-4">
          © {new Date().getFullYear()} Matheus Personal · <a href="/" className="hover:text-lime-green transition-colors">Voltar ao site</a>
        </p>
      </main>
    </div>
  );
}
