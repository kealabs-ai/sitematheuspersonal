import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronUp, CheckCircle, Circle, Dumbbell,
  Clock, Zap, PlayCircle, BedDouble, Lock, Trophy, X, ListChecks,
} from 'lucide-react';
import { workouts as workoutsApi } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import { ShimmerButton } from './components/magicui/shimmer-button';

const MAX_REST_DAYS = 3;

const statusConfig = {
  done:     { border: 'border-lime-green/30', dot: 'bg-lime-green' },
  today:    { border: 'border-lime-green',    dot: 'bg-lime-green animate-pulse' },
  rest:     { border: 'border-blue-400/30',   dot: 'bg-blue-400/40' },
  upcoming: { border: 'border-dark-border/40', dot: 'bg-gray-700' },
  pending:  { border: 'border-dark-border/40', dot: 'bg-gray-700' },
};

const WEEK_DAY_LABEL = { 1:'SEG', 2:'TER', 3:'QUA', 4:'QUI', 5:'SEX', 6:'SAB', 7:'DOM' };

const normalizeDay = (day) => ({
  ...day,
  day: day.day ?? WEEK_DAY_LABEL[day.week_day] ?? '?',
  status: day.is_rest ? 'rest' : (day.status === 'pending' ? 'upcoming' : (day.status ?? 'upcoming')),
  originalIsRest: day.is_rest ?? false,
});

const muscleColors = {
  'Peito':       'bg-red-500/10 text-red-400 border-red-500/20',
  'Costas':      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Pernas':      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Quadríceps':  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Posterior':   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Glúteos':     'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Ombro':       'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Tríceps':     'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'Bíceps':      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Abdômen':     'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Core':        'bg-lime-500/10 text-lime-400 border-lime-500/20',
  'Panturrilha': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Trapézio':    'bg-gray-500/10 text-gray-400 border-gray-500/20',
  'Full Body':   'bg-white/10 text-white border-white/20',
  'Cardio':      'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const WORKOUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// ─── Modal: Seleção de Treino ────────────────────────────────────────────────
function WorkoutSelectModal({ days, onSelect, onRest, onClose }) {
  const trainDays = days.filter(d => !d.originalIsRest).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 px-4 pb-4 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md bg-dark-card border border-dark-border p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <p className="font-bebas text-xl text-white flex items-center gap-2">
            <ListChecks size={18} className="text-lime-green" /> Escolha o treino de hoje
          </p>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <p className="text-gray-600 text-xs">Selecione qualquer treino — sem restrição de dia.</p>

        <div className="space-y-2">
          {trainDays.map((d, i) => {
            const label = WORKOUT_LABELS[i] ?? String(i + 1);
            return (
              <button
                key={d.id}
                onClick={() => onSelect(d)}
                className="w-full flex items-center gap-4 border border-dark-border hover:border-lime-green bg-black hover:bg-lime-green/5 p-3 transition-all text-left group"
              >
                {/* Badge A/B/C */}
                <div className="w-10 h-10 shrink-0 flex items-center justify-center border-2 border-lime-green/40 group-hover:border-lime-green group-hover:bg-lime-green/10 transition-colors">
                  <span className="font-bebas text-2xl text-lime-green leading-none">{label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{d.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-2">
                    <Clock size={11} /> {d.duration_min} min
                    {d.exercises_count > 0 && <> · {d.exercises_count} exercícios</>}
                    {d.day_of_week && <span className="text-gray-700 uppercase">{d.day_of_week}</span>}
                  </p>
                </div>
                {d.status === 'done' && (
                  <span className="text-lime-green text-[10px] font-bold shrink-0">✓ Feito</span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onRest}
          className="w-full flex items-center justify-center gap-2 border border-blue-400/40 text-blue-400 hover:bg-blue-400/10 py-3 text-sm font-bold transition-all"
        >
          <BedDouble size={15} /> Descansar Hoje
        </button>
      </motion.div>
    </div>
  );
}

// ─── Modal: Resultado Semanal ────────────────────────────────────────────────
function WeeklyResultModal({ weeklyDone, weeklyGoal, onClose }) {
  const goalMet = weeklyDone >= weeklyGoal;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm bg-dark-card border border-dark-border p-6 text-center space-y-4"
      >
        <div className={`text-5xl ${goalMet ? 'text-lime-green' : 'text-yellow-400'}`}>
          {goalMet ? '🏆' : '💪'}
        </div>
        <p className="font-bebas text-2xl text-white">
          {goalMet ? 'Meta Semanal Atingida!' : 'Treino Registrado!'}
        </p>
        <p className="text-gray-400 text-sm">
          {goalMet
            ? `Você completou ${weeklyDone} de ${weeklyGoal} treinos esta semana. Excelente disciplina!`
            : `${weeklyDone} de ${weeklyGoal} treinos concluídos esta semana. Continue firme!`
          }
        </p>
        <div className="w-full bg-dark-border h-2">
          <div
            className={`h-2 transition-all duration-700 ${goalMet ? 'bg-lime-green' : 'bg-yellow-400'}`}
            style={{ width: `${Math.min((weeklyDone / weeklyGoal) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">{weeklyDone}/{weeklyGoal} treinos</p>
        <button
          onClick={onClose}
          className="w-full bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-lime-green/90 transition-all"
        >
          Continuar
        </button>
      </motion.div>
    </div>
  );
}

// ─── Componente Principal ────────────────────────────────────────────────────
export default function Treinos() {
  useBlockBack();
  const navigate = useNavigate();
  const [plan, setPlan]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [exercises, setExercises] = useState({});
  const [checked, setChecked]     = useState({});
  const [weights, setWeights]     = useState({});
  const [activeLog, setActiveLog] = useState(null); // { logId, dayId }
  const [todayIsRest, setTodayIsRest] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState(null); // { weeklyDone, weeklyGoal }

  useEffect(() => {
    workoutsApi.plan()
      .then(data => {
        if (data.detail || data.error) return;
        const normalized = {
          ...data.plan,
          days: (data.plan?.days ?? []).map(normalizeDay),
        };
        setPlan(normalized);
        const today = normalized.days.find(d => d.status === 'today');
        if (today) {
          setExpanded(today.id);
          loadExercisesById(today.id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadExercisesById = async (dayId) => {
    const data = await workoutsApi.dayExercises(dayId).catch(() => ({}));
    setExercises(prev => ({ ...prev, [dayId]: data.exercises ?? [] }));
  };

  const loadExercises = async (dayId) => {
    if (exercises[dayId]) return;
    await loadExercisesById(dayId);
  };

  const toggleExpand = (day) => {
    // Trava de sequência: bloqueia upcoming e today em descanso
    if (day.status === 'upcoming') return;
    if (day.status === 'today' && todayIsRest) return;
    const next = expanded === day.id ? null : day.id;
    setExpanded(next);
    if (next && day.status !== 'rest') loadExercises(day.id);
  };

  // Inicia treino com qualquer dia selecionado pelo aluno
  const startWorkout = async (day) => {
    const data = await workoutsApi.startLog(day.id).catch(() => null);
    const logId = data?.log_id ?? data?.id;
    if (logId) {
      setActiveLog({ logId, dayId: day.id });
      loadExercises(day.id);
      setExpanded(day.id);
      setShowSelectModal(false);
    }
  };

  const finishWorkout = async (dayId) => {
    if (!activeLog) return;
    const exList = exercises[dayId] ?? [];
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

    // Histórico e meta semanal
    const [histData] = await Promise.all([
      workoutsApi.history().catch(() => ({})),
    ]);
    const logs = histData.logs ?? histData.history ?? [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyDone = logs.filter(l => {
      const d = new Date(l.finished_at ?? l.started_at ?? l.date);
      return d >= weekStart && l.completed !== false;
    }).length;
    const weeklyGoal = plan?.weekly_goal ?? plan?.days?.filter(d => !d.originalIsRest).length ?? 4;
    setWeeklyResult({ weeklyDone, weeklyGoal });
  };

  const toggleCheck = (dayId, exId) =>
    setChecked(prev => ({ ...prev, [`${dayId}-${exId}`]: !prev[`${dayId}-${exId}`] }));

  const setWeight = (dayId, exId, val) =>
    setWeights(prev => ({ ...prev, [`${dayId}-${exId}`]: val }));

  const days = plan?.days ?? [];
  const todayDay = days.find(d => d.status === 'today');
  const restCount = days.filter(d => d.status === 'rest').length + (todayIsRest ? 1 : 0);

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

      <AnimatePresence>
        {showSelectModal && (
          <WorkoutSelectModal
            days={days}
            onSelect={startWorkout}
            onRest={() => { setTodayIsRest(true); setShowSelectModal(false); }}
            onClose={() => setShowSelectModal(false)}
          />
        )}
        {weeklyResult && (
          <WeeklyResultModal
            weeklyDone={weeklyResult.weeklyDone}
            weeklyGoal={weeklyResult.weeklyGoal}
            onClose={() => setWeeklyResult(null)}
          />
        )}
      </AnimatePresence>

      <main className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-4">

        {/* Banner do dia atual */}
        {todayDay && !activeLog && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`border-2 p-4 ${todayIsRest ? 'border-blue-400/40 bg-blue-400/5' : 'border-lime-green bg-lime-green/10'}`}
          >
            {todayIsRest ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <BedDouble size={12} /> Dia de Descanso
                  </p>
                  <p className="text-white font-bebas text-2xl mt-0.5">Recuperação Ativa</p>
                  <p className="text-gray-500 text-xs mt-1">Você escolheu descansar hoje. Ótima decisão!</p>
                </div>
                <button
                  onClick={() => setTodayIsRest(false)}
                  className="text-xs text-gray-500 border border-dark-border px-3 py-2 hover:border-lime-green hover:text-lime-green transition-all"
                >
                  Treinar mesmo assim
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lime-green text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Zap size={12} /> Treino de hoje
                  </p>
                  <p className="text-white font-bebas text-2xl mt-0.5">{todayDay.name}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                    <Clock size={12} /> {todayDay.duration_min} min · {todayDay.exercises_count} exercícios
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <ShimmerButton
                    onClick={() => setShowSelectModal(true)}
                    shimmerColor="#ffffff"
                    background="rgba(0,180,216,1)"
                    className="px-4 py-2 text-sm whitespace-nowrap"
                  >
                    Iniciar ▶
                  </ShimmerButton>
                  {restCount < MAX_REST_DAYS && (
                    <button
                      onClick={() => setTodayIsRest(true)}
                      className="text-[11px] text-blue-400/70 hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                      <BedDouble size={11} /> Descansar hoje
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Contador de descanso */}
        {restCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BedDouble size={13} className="text-blue-400" />
            <span>Dias de descanso: <span className={restCount >= MAX_REST_DAYS ? 'text-blue-400 font-bold' : 'text-gray-400'}>{restCount}/{MAX_REST_DAYS}</span></span>
            {restCount >= MAX_REST_DAYS && <span className="text-blue-400/60">(limite atingido)</span>}
          </div>
        )}

        {/* Lista da semana */}
        <div className="space-y-2">
          {days.map((day, i) => {
            const isUpcoming   = day.status === 'upcoming';
            const isToday      = day.status === 'today';
            const isRest       = day.status === 'rest' || (isToday && todayIsRest);
            const effectiveStatus = isRest ? 'rest' : day.status;
            const cfg          = statusConfig[effectiveStatus] ?? statusConfig.upcoming;
            const isOpen       = expanded === day.id;
            const isActive     = activeLog?.dayId === day.id;
            const dayExercises = exercises[day.id] ?? [];
            const doneCount    = dayExercises.filter(ex => checked[`${day.id}-${ex.id}`]).length;

            return (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border ${cfg.border} bg-dark-card overflow-hidden ${isUpcoming ? 'opacity-50' : ''}`}
              >
                {/* Cabeçalho */}
                <div className="w-full flex items-center justify-between p-4">
                  <button
                    onClick={() => !isUpcoming && !isRest && toggleExpand(day)}
                    className="flex items-center gap-3 flex-1 text-left"
                    disabled={isUpcoming || isRest}
                  >
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs uppercase tracking-wide">{day.day}</span>
                        {isToday && !todayIsRest && (
                          <span className="bg-lime-green text-black text-[10px] font-bold px-2 py-0.5 uppercase">Hoje</span>
                        )}
                      </div>
                      <p className={`font-bebas text-xl ${isRest || isUpcoming ? 'text-gray-600' : 'text-white'}`}>
                        {day.name}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Trava de sequência — visual de cadeado */}
                    {isUpcoming && (
                      <span className="flex items-center gap-1 text-gray-700 text-xs">
                        <Lock size={13} /> Bloqueado
                      </span>
                    )}
                    {isRest && <span className="text-blue-400 text-xs">😴 Descanso</span>}
                    {!isUpcoming && !isRest && (
                      <>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={12} /> {day.duration_min} min
                        </span>
                        {day.status === 'done' && (
                          <span className="text-lime-green text-xs font-bold">✓ Feito</span>
                        )}
                        <button onClick={() => toggleExpand(day)} className="text-gray-400">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>

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
                          <ShimmerButton
                            onClick={() => finishWorkout(day.id)}
                            className="w-full mt-2 justify-center"
                            shimmerColor="#ffffff"
                            background="rgba(0,180,216,1)"
                          >
                            {doneCount === dayExercises.length ? '✓ Finalizar Treino' : `Salvar Progresso (${doneCount}/${dayExercises.length})`}
                          </ShimmerButton>
                        ) : (
                          day.status === 'done' && (
                            <button
                              onClick={() => startWorkout(day)}
                              className="w-full mt-2 border-2 border-lime-green text-lime-green font-bold py-3 uppercase text-sm hover:bg-lime-green hover:text-black transition-all"
                            >
                              Refazer Treino ↺
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
