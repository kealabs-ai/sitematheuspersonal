import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle, Circle, Dumbbell, Clock, Zap } from 'lucide-react';

// Mock — substituir por dados reais da API
const MOCK_WEEK_PLAN = [
  {
    id: 1,
    day: 'Segunda',
    label: 'Seg',
    name: 'Peito + Tríceps',
    status: 'done', // done | today | upcoming | rest
    duration: '55 min',
    exercises: [
      { id: 1, name: 'Supino Reto', sets: 4, reps: '8-12', rest: '90s', muscle: 'Peito', loggedWeight: '70kg' },
      { id: 2, name: 'Supino Inclinado', sets: 3, reps: '10-12', rest: '90s', muscle: 'Peito', loggedWeight: '60kg' },
      { id: 3, name: 'Crucifixo', sets: 3, reps: '12-15', rest: '60s', muscle: 'Peito', loggedWeight: '' },
      { id: 4, name: 'Tríceps Pulley', sets: 4, reps: '10-12', rest: '60s', muscle: 'Tríceps', loggedWeight: '' },
      { id: 5, name: 'Tríceps Francês', sets: 3, reps: '10-12', rest: '60s', muscle: 'Tríceps', loggedWeight: '' },
      { id: 6, name: 'Mergulho', sets: 3, reps: 'Falha', rest: '90s', muscle: 'Tríceps', loggedWeight: '' },
    ],
  },
  {
    id: 2,
    day: 'Terça',
    label: 'Ter',
    name: 'Costas + Bíceps',
    status: 'done',
    duration: '60 min',
    exercises: [
      { id: 1, name: 'Puxada Frontal', sets: 4, reps: '8-12', rest: '90s', muscle: 'Costas', loggedWeight: '65kg' },
      { id: 2, name: 'Remada Curvada', sets: 4, reps: '8-10', rest: '90s', muscle: 'Costas', loggedWeight: '80kg' },
      { id: 3, name: 'Remada Unilateral', sets: 3, reps: '10-12', rest: '60s', muscle: 'Costas', loggedWeight: '' },
      { id: 4, name: 'Rosca Direta', sets: 4, reps: '10-12', rest: '60s', muscle: 'Bíceps', loggedWeight: '' },
      { id: 5, name: 'Rosca Martelo', sets: 3, reps: '12', rest: '60s', muscle: 'Bíceps', loggedWeight: '' },
    ],
  },
  {
    id: 3,
    day: 'Quarta',
    label: 'Qua',
    name: 'Pernas',
    status: 'today',
    duration: '65 min',
    exercises: [
      { id: 1, name: 'Agachamento Livre', sets: 4, reps: '8-10', rest: '120s', muscle: 'Quadríceps', loggedWeight: '' },
      { id: 2, name: 'Leg Press 45°', sets: 4, reps: '10-12', rest: '90s', muscle: 'Quadríceps', loggedWeight: '' },
      { id: 3, name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest: '60s', muscle: 'Quadríceps', loggedWeight: '' },
      { id: 4, name: 'Mesa Flexora', sets: 4, reps: '10-12', rest: '60s', muscle: 'Posterior', loggedWeight: '' },
      { id: 5, name: 'Stiff', sets: 3, reps: '10-12', rest: '90s', muscle: 'Posterior', loggedWeight: '' },
      { id: 6, name: 'Panturrilha em Pé', sets: 4, reps: '15-20', rest: '45s', muscle: 'Panturrilha', loggedWeight: '' },
    ],
  },
  {
    id: 4,
    day: 'Quinta',
    label: 'Qui',
    name: 'Ombro + Trapézio',
    status: 'upcoming',
    duration: '50 min',
    exercises: [
      { id: 1, name: 'Desenvolvimento', sets: 4, reps: '8-12', rest: '90s', muscle: 'Ombro', loggedWeight: '' },
      { id: 2, name: 'Elevação Lateral', sets: 4, reps: '12-15', rest: '60s', muscle: 'Ombro', loggedWeight: '' },
      { id: 3, name: 'Elevação Frontal', sets: 3, reps: '12', rest: '60s', muscle: 'Ombro', loggedWeight: '' },
      { id: 4, name: 'Encolhimento', sets: 4, reps: '12-15', rest: '60s', muscle: 'Trapézio', loggedWeight: '' },
    ],
  },
  {
    id: 5,
    day: 'Sexta',
    label: 'Sex',
    name: 'Peito + Costas',
    status: 'upcoming',
    duration: '60 min',
    exercises: [
      { id: 1, name: 'Supino Reto', sets: 4, reps: '8-12', rest: '90s', muscle: 'Peito', loggedWeight: '' },
      { id: 2, name: 'Puxada Frontal', sets: 4, reps: '8-12', rest: '90s', muscle: 'Costas', loggedWeight: '' },
      { id: 3, name: 'Crucifixo', sets: 3, reps: '12-15', rest: '60s', muscle: 'Peito', loggedWeight: '' },
      { id: 4, name: 'Remada Curvada', sets: 3, reps: '10', rest: '90s', muscle: 'Costas', loggedWeight: '' },
    ],
  },
  {
    id: 6,
    day: 'Sábado',
    label: 'Sáb',
    name: 'Cardio + Core',
    status: 'upcoming',
    duration: '40 min',
    exercises: [
      { id: 1, name: 'Esteira HIIT', sets: 1, reps: '20 min', rest: '—', muscle: 'Cardio', loggedWeight: '' },
      { id: 2, name: 'Prancha', sets: 4, reps: '45s', rest: '30s', muscle: 'Core', loggedWeight: '' },
      { id: 3, name: 'Abdominal Crunch', sets: 4, reps: '20', rest: '30s', muscle: 'Core', loggedWeight: '' },
    ],
  },
  {
    id: 7,
    day: 'Domingo',
    label: 'Dom',
    name: 'Descanso',
    status: 'rest',
    duration: '—',
    exercises: [],
  },
];

const statusConfig = {
  done: { label: 'Concluído', dot: 'bg-lime-green', text: 'text-lime-green', border: 'border-lime-green/40' },
  today: { label: 'Hoje', dot: 'bg-lime-green animate-pulse', text: 'text-lime-green', border: 'border-lime-green' },
  upcoming: { label: 'Próximo', dot: 'bg-gray-600', text: 'text-gray-400', border: 'border-dark-border' },
  rest: { label: 'Descanso', dot: 'bg-blue-400/50', text: 'text-blue-400', border: 'border-blue-400/20' },
};

const muscleColors = {
  Peito: 'bg-red-500/10 text-red-400 border-red-500/20',
  Tríceps: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Costas: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Bíceps: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Quadríceps: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Posterior: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Panturrilha: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Ombro: 'bg-lime-500/10 text-lime-400 border-lime-500/20',
  Trapézio: 'bg-green-500/10 text-green-400 border-green-500/20',
  Core: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Cardio: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function Treinos() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(3); // abre o treino de hoje por padrão
  const [checked, setChecked] = useState({});
  const [weights, setWeights] = useState({});
  const [activeWorkout, setActiveWorkout] = useState(null);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);
  const toggleCheck = (dayId, exId) => {
    const key = `${dayId}-${exId}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const setWeight = (dayId, exId, val) => {
    setWeights(prev => ({ ...prev, [`${dayId}-${exId}`]: val }));
  };

  const todayPlan = MOCK_WEEK_PLAN.find(d => d.status === 'today');

  return (
    <div className="min-h-screen bg-dark-bg text-white font-inter">

      {/* Header */}
      <header className="bg-black border-b border-dark-border px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-lime-green transition-colors">
          <ArrowLeft size={22} />
        </button>
        <Dumbbell size={20} className="text-lime-green" />
        <h1 className="text-xl font-bebas uppercase tracking-wide">Meus Treinos</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Banner treino de hoje */}
        {todayPlan && !activeWorkout && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-lime-green/10 border-2 border-lime-green p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-lime-green text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                <Zap size={12} /> Treino de hoje
              </p>
              <p className="text-white font-bebas text-2xl mt-0.5">{todayPlan.name}</p>
              <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                <Clock size={12} /> {todayPlan.duration} · {todayPlan.exercises.length} exercícios
              </p>
            </div>
            <button
              onClick={() => setActiveWorkout(todayPlan.id)}
              className="bg-lime-green text-black font-bold px-4 py-2 uppercase text-sm hover:bg-neon-green transition-all"
            >
              Iniciar ▶
            </button>
          </motion.div>
        )}

        {/* Lista da semana */}
        <div className="space-y-2">
          {MOCK_WEEK_PLAN.map((day, i) => {
            const cfg = statusConfig[day.status];
            const isOpen = expanded === day.id;
            const isActive = activeWorkout === day.id;
            const doneCount = day.exercises.filter((_, ei) => checked[`${day.id}-${ei + 1}`]).length;

            return (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border ${cfg.border} bg-dark-card overflow-hidden`}
              >
                {/* Cabeçalho do dia */}
                <button
                  onClick={() => day.status !== 'rest' && toggleExpand(day.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  disabled={day.status === 'rest'}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">{day.day}</span>
                        {day.status === 'today' && (
                          <span className="bg-lime-green text-black text-[10px] font-bold px-2 py-0.5 uppercase">Hoje</span>
                        )}
                      </div>
                      <p className={`font-bebas text-xl ${day.status === 'rest' ? 'text-gray-600' : 'text-white'}`}>
                        {day.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {day.status !== 'rest' && (
                      <>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={12} /> {day.duration}
                        </span>
                        {day.status === 'done' && (
                          <span className="text-lime-green text-xs font-bold">✓ Feito</span>
                        )}
                        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </>
                    )}
                    {day.status === 'rest' && <span className="text-blue-400 text-xs">😴 Recuperação</span>}
                  </div>
                </button>

                {/* Exercícios expandidos */}
                <AnimatePresence>
                  {isOpen && day.exercises.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-dark-border px-4 pb-4 pt-3 space-y-3">

                        {/* Progresso do treino ativo */}
                        {isActive && (
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progresso</span>
                              <span className="text-lime-green font-bold">{doneCount}/{day.exercises.length}</span>
                            </div>
                            <div className="w-full bg-dark-border h-2">
                              <div
                                className="bg-lime-green h-2 transition-all duration-500"
                                style={{ width: `${(doneCount / day.exercises.length) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {day.exercises.map((ex) => {
                          const key = `${day.id}-${ex.id}`;
                          const isDone = checked[key];
                          const muscleClass = muscleColors[ex.muscle] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';

                          return (
                            <div
                              key={ex.id}
                              className={`border p-3 transition-all ${isDone ? 'border-lime-green/40 bg-lime-green/5' : 'border-dark-border bg-black'}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3 flex-1">
                                  {isActive && (
                                    <button onClick={() => toggleCheck(day.id, ex.id)} className="mt-0.5 flex-shrink-0">
                                      {isDone
                                        ? <CheckCircle size={20} className="text-lime-green" />
                                        : <Circle size={20} className="text-gray-600" />
                                      }
                                    </button>
                                  )}
                                  <div className="flex-1">
                                    <p className={`font-semibold text-sm ${isDone ? 'text-lime-green line-through opacity-60' : 'text-white'}`}>
                                      {ex.name}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                      <span className="text-gray-400 text-xs">{ex.sets} séries × {ex.reps}</span>
                                      <span className="text-gray-600 text-xs">Descanso: {ex.rest}</span>
                                      <span className={`text-[10px] border px-1.5 py-0.5 ${muscleClass}`}>{ex.muscle}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Campo de carga */}
                                <div className="flex-shrink-0">
                                  <input
                                    type="text"
                                    placeholder={ex.loggedWeight || 'Carga'}
                                    value={weights[key] ?? ex.loggedWeight}
                                    onChange={(e) => setWeight(day.id, ex.id, e.target.value)}
                                    className="w-20 bg-dark-bg border border-dark-border text-white text-xs text-center p-2 focus:outline-none focus:border-lime-green transition-colors"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Botão finalizar */}
                        {isActive ? (
                          <button
                            onClick={() => setActiveWorkout(null)}
                            className="w-full mt-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-all"
                          >
                            {doneCount === day.exercises.length ? '✓ Finalizar Treino' : `Salvar Progresso (${doneCount}/${day.exercises.length})`}
                          </button>
                        ) : (
                          day.status !== 'done' && (
                            <button
                              onClick={() => setActiveWorkout(day.id)}
                              className="w-full mt-2 border-2 border-lime-green text-lime-green font-bold py-3 uppercase text-sm hover:bg-lime-green hover:text-black transition-all"
                            >
                              Iniciar Treino ▶
                            </button>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-gray-700 text-xs pb-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-lime-green transition-colors">
            ← Voltar ao Dashboard
          </button>
        </p>
      </main>
    </div>
  );
}
