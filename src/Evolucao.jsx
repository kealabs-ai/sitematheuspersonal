import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, Scale, Ruler, Camera,
  Trophy, ChevronDown, Plus
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

// Mock — substituir por dados reais da API
const MOCK_WEIGHT = [
  { date: 'Jan', peso: 92 },
  { date: 'Fev', peso: 90.5 },
  { date: 'Mar', peso: 89 },
  { date: 'Abr', peso: 87.2 },
  { date: 'Mai', peso: 85.8 },
  { date: 'Jun', peso: 84.1 },
  { date: 'Jul', peso: 83 },
];

const MOCK_EXERCISES = {
  'Supino Reto': [
    { date: 'Jan', carga: 50 }, { date: 'Fev', carga: 55 }, { date: 'Mar', carga: 60 },
    { date: 'Abr', carga: 65 }, { date: 'Mai', carga: 67.5 }, { date: 'Jun', carga: 70 }, { date: 'Jul', carga: 72.5 },
  ],
  'Agachamento': [
    { date: 'Jan', carga: 60 }, { date: 'Fev', carga: 70 }, { date: 'Mar', carga: 80 },
    { date: 'Abr', carga: 90 }, { date: 'Mai', carga: 95 }, { date: 'Jun', carga: 100 }, { date: 'Jul', carga: 107.5 },
  ],
  'Puxada Frontal': [
    { date: 'Jan', carga: 50 }, { date: 'Fev', carga: 55 }, { date: 'Mar', carga: 58 },
    { date: 'Abr', carga: 62 }, { date: 'Mai', carga: 65 }, { date: 'Jun', carga: 67.5 }, { date: 'Jul', carga: 70 },
  ],
};

const MOCK_MEASUREMENTS = [
  { label: 'Peso', value: '83 kg', prev: '92 kg', icon: <Scale size={18} />, diff: '-9 kg', positive: true },
  { label: 'Cintura', value: '82 cm', prev: '92 cm', icon: <Ruler size={18} />, diff: '-10 cm', positive: true },
  { label: 'Braço', value: '38 cm', prev: '34 cm', icon: <Ruler size={18} />, diff: '+4 cm', positive: true },
  { label: 'Perna', value: '58 cm', prev: '54 cm', icon: <Ruler size={18} />, diff: '+4 cm', positive: true },
  { label: '% Gordura', value: '14%', prev: '22%', icon: <TrendingUp size={18} />, diff: '-8%', positive: true },
];

const MOCK_BADGES = [
  { icon: '🔥', label: 'Sequência de 12 dias', date: 'Jul 2024', earned: true },
  { icon: '💪', label: 'Primeiro treino', date: 'Jan 2024', earned: true },
  { icon: '⚖️', label: 'Perdeu 5kg', date: 'Mar 2024', earned: true },
  { icon: '🏋️', label: 'Supino 70kg', date: 'Jun 2024', earned: true },
  { icon: '🏆', label: '30 dias seguidos', date: '—', earned: false },
  { icon: '🎯', label: 'Meta de peso', date: '—', earned: false },
];

const MOCK_PHOTOS = [
  { date: 'Jan 2024', label: 'Início' },
  { date: 'Abr 2024', label: '3 meses' },
  { date: 'Jul 2024', label: '6 meses' },
];

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-lime-green/40 px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-lime-green font-bold">{payload[0].value}{unit}</p>
    </div>
  );
};

const tabs = ['Peso', 'Força', 'Medidas', 'Fotos', 'Conquistas'];

export default function Evolucao() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Peso');
  const [selectedExercise, setSelectedExercise] = useState('Supino Reto');
  const [showExSelect, setShowExSelect] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg text-white font-inter">

      {/* Header */}
      <header className="bg-black border-b border-dark-border px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-lime-green transition-colors">
          <ArrowLeft size={22} />
        </button>
        <TrendingUp size={20} className="text-blue-400" />
        <h1 className="text-xl font-bebas uppercase tracking-wide">Minha Evolução</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Resumo rápido */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-blue-400/10 border border-blue-400/30 p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Jornada iniciada em Jan 2024</p>
            <p className="text-white font-bebas text-2xl mt-0.5">6 meses de transformação</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bebas text-lime-green">-9 kg</p>
            <p className="text-gray-400 text-xs">de progresso</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all border
                ${tab === t
                  ? 'bg-lime-green text-black border-lime-green'
                  : 'bg-dark-card border-dark-border text-gray-400 hover:border-lime-green/50 hover:text-white'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab: Peso */}
        {tab === 'Peso' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-dark-card border border-dark-border p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-white">Evolução do Peso (kg)</p>
                <button className="flex items-center gap-1 text-xs text-lime-green border border-lime-green/40 px-3 py-1 hover:bg-lime-green/10 transition-colors">
                  <Plus size={12} /> Registrar
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MOCK_WEIGHT}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip unit=" kg" />} />
                  <Area type="monotone" dataKey="peso" stroke="#84cc16" strokeWidth={2} fill="url(#weightGrad)" dot={{ fill: '#84cc16', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Histórico de registros */}
            <div className="bg-dark-card border border-dark-border p-4">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Histórico</p>
              <div className="space-y-2">
                {[...MOCK_WEIGHT].reverse().map((w, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                    <span className="text-gray-400 text-sm">{w.date} 2024</span>
                    <span className="text-white font-bold">{w.peso} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Força */}
        {tab === 'Força' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Seletor de exercício */}
            <div className="relative">
              <button
                onClick={() => setShowExSelect(!showExSelect)}
                className="w-full bg-dark-card border border-dark-border p-3 flex items-center justify-between text-sm text-white hover:border-lime-green/50 transition-colors"
              >
                <span>{selectedExercise}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showExSelect ? 'rotate-180' : ''}`} />
              </button>
              {showExSelect && (
                <div className="absolute top-full left-0 right-0 bg-black border border-dark-border z-10">
                  {Object.keys(MOCK_EXERCISES).map(ex => (
                    <button
                      key={ex}
                      onClick={() => { setSelectedExercise(ex); setShowExSelect(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-lime-green/10 hover:text-lime-green transition-colors border-b border-dark-border last:border-0"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-dark-card border border-dark-border p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">{selectedExercise}</p>
                <span className="text-lime-green font-bebas text-xl">
                  +{MOCK_EXERCISES[selectedExercise].at(-1).carga - MOCK_EXERCISES[selectedExercise][0].carga} kg
                </span>
              </div>
              <p className="text-gray-500 text-xs mb-4">
                {MOCK_EXERCISES[selectedExercise][0].carga} kg → {MOCK_EXERCISES[selectedExercise].at(-1).carga} kg
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={MOCK_EXERCISES[selectedExercise]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip unit=" kg" />} />
                  <Line type="monotone" dataKey="carga" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Recordes */}
            <div className="bg-dark-card border border-dark-border p-4">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Recordes Pessoais</p>
              <div className="space-y-2">
                {Object.entries(MOCK_EXERCISES).map(([ex, data]) => (
                  <div key={ex} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                    <span className="text-gray-300 text-sm">{ex}</span>
                    <div className="text-right">
                      <span className="text-blue-400 font-bold">{data.at(-1).carga} kg</span>
                      <span className="text-gray-600 text-xs ml-2">(+{data.at(-1).carga - data[0].carga} kg)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab: Medidas */}
        {tab === 'Medidas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex justify-end">
              <button className="flex items-center gap-1 text-xs text-lime-green border border-lime-green/40 px-3 py-1 hover:bg-lime-green/10 transition-colors">
                <Plus size={12} /> Nova medição
              </button>
            </div>
            {MOCK_MEASUREMENTS.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-dark-card border border-dark-border p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lime-green">{m.icon}</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{m.label}</p>
                    <p className="text-gray-500 text-xs">Início: {m.prev}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bebas text-2xl">{m.value}</p>
                  <p className="text-lime-green text-xs font-bold">{m.diff}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Tab: Fotos */}
        {tab === 'Fotos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-end">
              <button className="flex items-center gap-1 text-xs text-lime-green border border-lime-green/40 px-3 py-1 hover:bg-lime-green/10 transition-colors">
                <Plus size={12} /> Adicionar foto
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MOCK_PHOTOS.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                  className="aspect-[3/4] bg-dark-card border border-dark-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-lime-green/50 transition-colors"
                >
                  <Camera size={28} className="text-gray-600" />
                  <p className="text-gray-500 text-xs text-center">{p.label}</p>
                  <p className="text-gray-600 text-[10px]">{p.date}</p>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                className="aspect-[3/4] bg-dark-card border-2 border-dashed border-dark-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-lime-green/50 transition-colors"
              >
                <Plus size={24} className="text-gray-600" />
                <p className="text-gray-600 text-xs">Nova foto</p>
              </motion.div>
            </div>
            <p className="text-gray-600 text-xs text-center">As fotos são privadas e visíveis apenas para você e seu personal.</p>
          </motion.div>
        )}

        {/* Tab: Conquistas */}
        {tab === 'Conquistas' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              {MOCK_BADGES.filter(b => b.earned).length} de {MOCK_BADGES.length} conquistas desbloqueadas
            </p>
            {/* Barra de progresso geral */}
            <div className="w-full bg-dark-border h-2 mb-2">
              <div
                className="bg-lime-green h-2 transition-all"
                style={{ width: `${(MOCK_BADGES.filter(b => b.earned).length / MOCK_BADGES.length) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {MOCK_BADGES.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className={`flex items-center gap-4 p-4 border transition-all
                    ${b.earned
                      ? 'border-lime-green/30 bg-lime-green/5'
                      : 'border-dark-border opacity-40 grayscale'
                    }`}
                >
                  <span className="text-3xl">{b.icon}</span>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${b.earned ? 'text-white' : 'text-gray-500'}`}>{b.label}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{b.earned ? `Conquistado em ${b.date}` : 'Bloqueado'}</p>
                  </div>
                  {b.earned && <Trophy size={18} className="text-lime-green flex-shrink-0" />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <p className="text-center text-gray-700 text-xs pb-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-lime-green transition-colors">
            ← Voltar ao Dashboard
          </button>
        </p>
      </main>
    </div>
  );
}
