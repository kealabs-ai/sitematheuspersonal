import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, CheckCircle, Circle, Dumbbell, Clock, Zap, PlayCircle } from 'lucide-react';
import { workouts as workoutsApi } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import { ShimmerButton } from './components/magicui/shimmer-button';

const statusConfig = {
  done:     { border: 'border-lime-green/30', dot: 'bg-lime-green' },
  today:    { border: 'border-lime-green',    dot: 'bg-lime-green animate-pulse' },
  rest:     { border: 'border-dark-border',   dot: 'bg-blue-400/40' },
  upcoming: { border: 'border-dark-border',   dot: 'bg-gray-600' },
  pending:  { border: 'border-dark-border',   dot: 'bg-gray-600' },
};

const WEEK_DAY_LABEL = { 1:'SEG', 2:'TER', 3:'QUA', 4:'QUI', 5:'SEX', 6:'SAB', 7:'DOM' };

// Normaliza o objeto day vindo da API para o formato esperado pelo frontend
const normalizeDay = (day) => ({
  ...day,
  day: day.day ?? WEEK_DAY_LABEL[day.week_day] ?? '?',
  status: day.is_rest ? 'rest' : (day.status === 'pending' ? 'upcoming' : (day.status ?? 'upcoming')),
});

const muscleColors = {
  'Peito':        'bg-red-500/10 text-red-400 border-red-500/20',
  'Costas':       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Pernas':       'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Quadríceps':   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Posterior':    'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Glúteos':      'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Ombro':        'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Tríceps':      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Bíceps':       'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Abdômen':      'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Core':         'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Panturrilha':  'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Trapézio':     'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'Full Body':    'bg-white/10 text-white border-white/20',
  'Cardio':       'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function Treinos() {
  useBlockBack();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [exercises, setExercises] = useState({});
  const [checked, setChecked] = useState({});
  const [weights, setWeights] = useState({});
  const [activeLog, setActiveLog] = useState(null); // { logId, dayId }

  useEffect(() => {
    workoutsApi.plan()
      .then(data => {
        if (data.detail || data.error) return;
        // API retorna { plan: { id, name, days: [{ id, week_day, name, duration_min, is_rest, exercises_count, status }] } }
        const normalized = {
          ...data.plan,
          days: (data.plan?.days ?? []).map(normalizeDay),
        };
        setPlan(normalized);
        const today = normalized.days.find(d => d.status === 'today');
        if (today) setExpanded(today.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadExercises = async (dayId) => {
    if (exercises[dayId]) return;
    const data = await workoutsApi.dayExercises(dayId).catch(() => ({}));
    // API retorna { id, name, week_day, exercises: [{ id, name, muscle_group, sets, reps, rest_seconds, video_url }] }
    setExercises(prev => ({ ...prev, [dayId]: data.exercises ?? [] }));
  };

  const toggleExpand = (day) => {
    if (day.status === 'upcoming') return;
    const next = expanded === day.id ? null : day.id;
    setExpanded(next);
    if (next && day.status !== 'rest') loadExercises(day.id);
  };

  const startWorkout = async (day) => {
    // API retorna { log_id: 42, started_at: "..." }
    const data = await workoutsApi.startLog(day.id).catch(() => null);
    if (data?.log_id) {
      setActiveLog({ logId: data.log_id, dayId: day.id });
      loadExercises(day.id);
      setExpanded(day.id);
    }
  };

  const finishWorkout = async (dayId) => {
    if (!activeLog) return;
    const exList = exercises[dayId] ?? [];
    // Monta payload conforme spec: { exercise_id, weight_kg, sets_done, reps_done, completed }
    const payload = exList.map(ex => ({
      exercise_id: ex.id,
      weight_kg:   parseFloat(weights[`${dayId}-${ex.id}`]) || null,
      sets_done:   ex.sets,
      reps_done:   null,
      completed:   !!checked[`${dayId}-${ex.id}`],
    }));
    await workoutsApi.saveExercises(activeLog.logId, payload).catch(() => {});
    await workoutsApi.finishLog(activeLog.logId, true).catch(() => {});
    setActiveLog(null);
  };

  const toggleCheck = (dayId, exId) => {
    const key = `${dayId}-${exId}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setWeight = (dayId, exId, val) => {
    setWeights(prev => ({ ...prev, [`${dayId}-${exId}`]: val }));
  };

  const days = plan?.days ?? [];
  const todayPlan = days.find(d => d.status === 'today');

  if (loading) return (
    <div className="min-h-screen sport-bg flex items-center justify-center">
      <p className="text-lime-green font-bebas text-2xl animate-pulse">Carregando...</p>
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-6">
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <Dumbbell size={48} className="text-gray-700 mb-4" />
        <p className="text-gray-400 font-bebas text-2xl uppercase mb-2">Nenhum plano ativo</p>
        <p className="text-gray-600 text-sm">Seu plano de treino ainda não foi configurado.<br />Entre em contato com o Matheus para começar.</p>
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-10">

      <main className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-4">

        {/* Banner treino de hoje */}
        {todayPlan && !activeLog && (
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
                <Clock size={12} /> {todayPlan.duration_min} min · {todayPlan.exercises_count} exercícios
              </p>
            </div>
            <ShimmerButton onClick={() => startWorkout(todayPlan)} shimmerColor="#ffffff" background="rgba(0,180,216,1)" className="px-4 py-2 text-sm">
              Iniciar ▶
            </ShimmerButton>
          </motion.div>
        )}

        {/* Lista da semana */}
        <div className="space-y-2">
          {days.map((day, i) => {
            const cfg = statusConfig[day.status] ?? statusConfig.upcoming;
            const isOpen = expanded === day.id;
            const isActive = activeLog?.dayId === day.id;
            const dayExercises = exercises[day.id] ?? [];
            const doneCount = dayExercises.filter(ex => checked[`${day.id}-${ex.id}`]).length;

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
                  onClick={() => day.status !== 'rest' && day.status !== 'upcoming' && toggleExpand(day)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  disabled={day.status === 'rest' || day.status === 'upcoming'}
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
                          <Clock size={12} /> {day.duration_min} min
                        </span>
                        {day.status === 'done' && (
                          <span className="text-lime-green text-xs font-bold">✓ Feito</span>
                        )}
                        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </>
                    )}
                    {day.status === 'rest'     && <span className="text-blue-400 text-xs">😴 Recuperação</span>}
                    {day.status === 'upcoming'  && <span className="text-gray-600 text-xs uppercase tracking-wide">Bloqueado</span>}
                  </div>
                </button>

                {/* Exercícios expandidos */}
                <AnimatePresence>
                  {isOpen && (
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
                              <span className="text-lime-green font-bold">{doneCount}/{dayExercises.length}</span>
                            </div>
                            <div className="w-full bg-dark-border h-2">
                              <div
                                className="bg-lime-green h-2 transition-all duration-500"
                                style={{ width: `${dayExercises.length ? (doneCount / dayExercises.length) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {dayExercises.length === 0 && (
                          <p className="text-gray-600 text-xs text-center py-4">Carregando exercícios...</p>
                        )}

                        {dayExercises.map((ex) => {
                          const key = `${day.id}-${ex.id}`;
                          const isDone = checked[key];
                          const muscleClass = muscleColors[ex.muscle_group] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';

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
                                      <span className="text-gray-600 text-xs">Descanso: {ex.rest_seconds}s</span>
                                      <span className={`text-[10px] border px-1.5 py-0.5 ${muscleClass}`}>{ex.muscle_group}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Carga + Vídeo */}
                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                  <input
                                    type="text"
                                    placeholder="Carga"
                                    value={weights[`${day.id}-${ex.id}`] ?? ''}
                                    onChange={(e) => setWeight(day.id, ex.id, e.target.value)}
                                    className="w-20 bg-dark-bg border border-dark-border text-white text-xs text-center p-2 focus:outline-none focus:border-lime-green transition-colors"
                                  />
                                  {ex.video_url && (
                                    <a
                                      href={ex.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-20 flex items-center justify-center gap-1 bg-dark-bg border border-blue-500/40 text-blue-400 text-[10px] font-bold py-2 hover:bg-blue-500/10 hover:border-blue-400 transition-all"
                                    >
                                      <PlayCircle size={13} /> Vídeo
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {isActive ? (
                          <ShimmerButton onClick={() => finishWorkout(day.id)} className="w-full mt-2 justify-center" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
                            {doneCount === dayExercises.length ? '✓ Finalizar Treino' : `Salvar Progresso (${doneCount}/${dayExercises.length})`}
                          </ShimmerButton>
                        ) : (
                          (day.status === 'today' || day.status === 'done') && (
                            <button
                              onClick={() => startWorkout(day)}
                              className="w-full mt-2 border-2 border-lime-green text-lime-green font-bold py-3 uppercase text-sm hover:bg-lime-green hover:text-black transition-all"
                            >
                              {day.status === 'done' ? 'Refazer Treino ↺' : 'Iniciar Treino ▶'}
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
      <AppFooter />
      <BottomNav />
    </div>
  );
}
