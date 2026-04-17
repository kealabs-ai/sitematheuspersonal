import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Circle, Dumbbell, Clock, Zap, PlayCircle,
  BedDouble, X, ListChecks, ChevronDown, ChevronUp,
} from 'lucide-react';
import { workouts as workoutsApi } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import { ShimmerButton } from './components/magicui/shimmer-button';

const WORKOUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const WEEK_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

function getWeekDays() {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return {
      label: WEEK_LABELS[i],
      iso: d.toISOString().split('T')[0],
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

function WeekBar({ weekLogs }) {
  const days = getWeekDays();
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map(({ label, iso, isToday }) => {
        const log = weekLogs[iso];
        return (
          <div key={iso} className={`flex flex-col items-center gap-1 py-2 px-1 border transition-colors
            ${log ? 'border-lime-green/40 bg-lime-green/5' : isToday ? 'border-lime-green/20' : 'border-dark-border'}`}>
            <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-lime-green' : 'text-gray-500'}`}>{label}</span>
            {log ? (
              <>
                <span className="text-lime-green text-xs">&#10003;</span>
                <span className="text-lime-green font-bebas text-sm leading-none">{log.label}</span>
              </>
            ) : (
              <span className="w-3 h-3 rounded-full border border-dark-border/60" />
            )}
          </div>
        );
      })}
    </div>
  );
}

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

// ─── Modal seleção A/B/C ─────────────────────────────────────────────────────
function WorkoutSelectModal({ trainDays, suggested, onSelect, onRest, onClose }) {
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

        {suggested && (
          <p className="text-gray-500 text-xs">
            Sugerido para hoje: <span className="text-lime-green font-semibold">{suggested.name}</span>
          </p>
        )}

        <div className="space-y-2">
          {trainDays.map((d, i) => {
            const label = WORKOUT_LABELS[i] ?? String(i + 1);
            const isSuggested = suggested?.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelect(d)}
                className={`w-full flex items-center gap-4 border p-3 transition-all text-left group
                  ${isSuggested
                    ? 'border-lime-green/60 bg-lime-green/5'
                    : 'border-dark-border hover:border-lime-green bg-black hover:bg-lime-green/5'}`}
              >
                <div className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 transition-colors
                  ${isSuggested ? 'border-lime-green bg-lime-green/10' : 'border-lime-green/40 group-hover:border-lime-green group-hover:bg-lime-green/10'}`}>
                  <span className="font-bebas text-2xl text-lime-green leading-none">{label}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm truncate">{d.name}</p>
                    {isSuggested && <span className="text-[10px] text-lime-green border border-lime-green/40 px-1.5 py-0.5 shrink-0">Sugerido</span>}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-2">
                    <Clock size={11} /> {d.duration_min} min
                    {d.exercises_count > 0 && <> · {d.exercises_count} exercícios</>}
                  </p>
                </div>
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

// ─── Modal resultado semanal ─────────────────────────────────────────────────
function WeeklyResultModal({ weeklyDone, weeklyGoal, onClose }) {
  const goalMet = weeklyDone >= weeklyGoal;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm bg-dark-card border border-dark-border p-6 text-center space-y-4"
      >
        <div className="text-5xl">{goalMet ? '🏆' : '💪'}</div>
        <p className="font-bebas text-2xl text-white">
          {goalMet ? 'Meta Semanal Atingida!' : 'Treino Registrado!'}
        </p>
        <p className="text-gray-400 text-sm">
          {goalMet
            ? `Você completou ${weeklyDone} de ${weeklyGoal} treinos esta semana. Excelente disciplina!`
            : `${weeklyDone} de ${weeklyGoal} treinos concluídos esta semana. Continue firme!`}
        </p>
        <div className="w-full bg-dark-border h-2">
          <div
            className={`h-2 transition-all duration-700 ${goalMet ? 'bg-lime-green' : 'bg-yellow-400'}`}
            style={{ width: `${Math.min((weeklyDone / weeklyGoal) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">{weeklyDone}/{weeklyGoal} treinos</p>
        <button onClick={onClose} className="w-full bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-lime-green/90 transition-all">
          Continuar
        </button>
      </motion.div>
    </div>
  );
}

// ─── Principal ───────────────────────────────────────────────────────────────
export default function Treinos() {
  useBlockBack();
  const navigate = useNavigate();

  const [allDays, setAllDays]         = useState([]);   // todos os dias do template
  const [suggested, setSuggested]     = useState(null); // sugerido pela API para hoje
  const [todayDay, setTodayDay]       = useState(null); // dia corrente (escolhido ou sugerido)
  const [exercises, setExercises]     = useState({});
  const [checked, setChecked]         = useState({});
  const [weights, setWeights]         = useState({});
  const [activeLog, setActiveLog]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadingEx, setLoadingEx]     = useState(false);
  const [isRest, setIsRest]           = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [weeklyResult, setWeeklyResult] = useState(null);
  const [showExercises, setShowExercises] = useState(true);
  const [weekLogs, setWeekLogs]       = useState({});
  const planRef = useRef(null);

  useEffect(() => {
    Promise.all([
      workoutsApi.plan().catch(() => ({})),
      workoutsApi.history().catch(() => ({})),
    ]).then(([planData, histData]) => {
      if (!planData.detail && !planData.error) {
        planRef.current = planData.plan;
        const days = (planData.plan?.days ?? []).map((d, i) => ({
          ...d,
          originalIsRest: d.is_rest ?? false,
          workoutLabel: WORKOUT_LABELS[i] ?? String(i + 1),
        }));
        setAllDays(days);
        const s = days.find(d => d.status === 'today' && !d.is_rest);
        setSuggested(s ?? null);
        setTodayDay(s ?? null);
        if (s) fetchExercises(s.id);
      }
      buildWeekLogs(histData);
    }).finally(() => setLoading(false));
  }, []);

  const buildWeekLogs = (histData) => {
    const logs = histData.logs ?? histData.history ?? [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const map = {};
    logs.forEach(l => {
      const d = new Date(l.finished_at ?? l.started_at ?? l.date ?? '');
      if (isNaN(d) || d < weekStart) return;
      const iso = d.toISOString().split('T')[0];
      if (!map[iso]) map[iso] = { label: l.training ?? l.workout_label ?? l.day_label ?? '✓', name: l.day_name ?? '' };
    });
    setWeekLogs(map);
  };

  const fetchExercises = async (dayId) => {
    if (exercises[dayId]) return;
    setLoadingEx(true);
    const data = await workoutsApi.dayExercises(dayId).catch(() => ({}));
    setExercises(prev => ({ ...prev, [dayId]: data.exercises ?? [] }));
    setLoadingEx(false);
  };

  const trainDays = allDays.filter(d => !d.originalIsRest).slice(0, 3);

  // Aluno escolhe treino no modal → atualiza dia corrente
  const handleSelect = async (day) => {
    setTodayDay(day);       // atualiza banner para o escolhido
    setIsRest(false);
    setShowModal(false);
    setShowExercises(true);
    await fetchExercises(day.id);

    // inicia log com o day_id do treino escolhido
    const training = day.workoutLabel ?? 'A';
    const data = await workoutsApi.startLog(day.id, training).catch(() => null);
    const logId = data?.log_id ?? data?.id;
    if (logId) setActiveLog({ logId, dayId: day.id, training });
  };

  const finishWorkout = async () => {
    if (!activeLog) return;
    const { logId, dayId } = activeLog;
    const exList = exercises[dayId] ?? [];
    const payload = exList.map(ex => ({
      exercise_id: ex.id,
      weight_kg:   parseFloat(weights[`${dayId}-${ex.id}`]) || null,
      sets_done:   ex.sets,
      reps_done:   null,
      completed:   !!checked[`${dayId}-${ex.id}`],
    }));
    await workoutsApi.saveExercises(logId, payload).catch(() => {});
    await workoutsApi.finishLog(logId, true).catch(() => {});
    setActiveLog(null);

    // Atualiza barra imediatamente com o treino finalizado
    const todayIso = new Date().toISOString().split('T')[0];
    const finishedDay = trainDays.find(d => d.id === dayId);
    setWeekLogs(prev => ({ ...prev, [todayIso]: { label: finishedDay?.workoutLabel ?? '✓', name: finishedDay?.name ?? '' } }));

    // Sincroniza com histórico real
    const histData = await workoutsApi.history().catch(() => ({}));
    buildWeekLogs(histData);

    const allLogs = histData.logs ?? histData.history ?? [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyDone = allLogs.filter(l => {
      const d = new Date(l.finished_at ?? l.started_at ?? l.date);
      return d >= weekStart && l.completed !== false;
    }).length;
    const weeklyGoal = planRef.current?.weekly_goal ?? trainDays.length ?? 3;
    setWeeklyResult({ weeklyDone, weeklyGoal });
  };

  const toggleCheck = (dayId, exId) =>
    setChecked(prev => ({ ...prev, [`${dayId}-${exId}`]: !prev[`${dayId}-${exId}`] }));

  const setWeight = (dayId, exId, val) =>
    setWeights(prev => ({ ...prev, [`${dayId}-${exId}`]: val }));

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen sport-bg flex items-center justify-center">
      <p className="text-lime-green font-bebas text-2xl animate-pulse">Carregando...</p>
    </div>
  );

  // ── Sem plano ──
  if (allDays.length === 0) return (
    <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-6">
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <Dumbbell size={48} className="text-gray-700 mb-4" />
        <p className="text-gray-400 font-bebas text-2xl uppercase mb-2">Nenhum plano ativo</p>
        <p className="text-gray-600 text-sm">Seu plano de treino ainda não foi configurado.<br />Entre em contato com o Matheus para começar.</p>
      </div>
      <BottomNav />
    </div>
  );

  const dayExercises = todayDay ? (exercises[todayDay.id] ?? []) : [];
  const doneCount = dayExercises.filter(ex => checked[`${todayDay?.id}-${ex.id}`]).length;

  return (
    <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-10">

      <AnimatePresence>
        {showModal && (
          <WorkoutSelectModal
            trainDays={trainDays}
            suggested={suggested}
            onSelect={handleSelect}
            onRest={() => { setIsRest(true); setShowModal(false); setActiveLog(null); }}
            onClose={() => setShowModal(false)}
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

      <main className="max-w-2xl md:max-w-3xl mx-auto px-4 md:px-8 py-6 space-y-4">

        {/* ── Banner dia corrente ── */}
        <AnimatePresence mode="wait">
          {isRest ? (
            <motion.div key="rest"
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border-2 border-blue-400/40 bg-blue-400/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <BedDouble size={12} /> Dia de Descanso
                  </p>
                  <p className="text-white font-bebas text-2xl mt-0.5">Recuperação Ativa</p>
                  <p className="text-gray-500 text-xs mt-1">Você escolheu descansar hoje. Ótima decisão!</p>
                </div>
                <button
                  onClick={() => { setIsRest(false); setShowModal(true); }}
                  className="text-xs text-gray-500 border border-dark-border px-3 py-2 hover:border-lime-green hover:text-lime-green transition-all"
                >
                  Treinar mesmo assim
                </button>
              </div>
            </motion.div>
          ) : todayDay ? (
            <motion.div key={todayDay.id}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="border-2 border-lime-green bg-lime-green/10 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lime-green text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Zap size={12} /> Treino de hoje
                  </p>
                  <p className="text-white font-bebas text-2xl mt-0.5 truncate">{todayDay.name}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                    <Clock size={12} /> {todayDay.duration_min} min
                    {todayDay.exercises_count > 0 && <> · {todayDay.exercises_count} exercícios</>}
                    {suggested && todayDay.id !== suggested.id && (
                      <span className="text-gray-600">· alterado</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end shrink-0">
                  {!activeLog ? (
                    <>
                      <ShimmerButton
                        onClick={() => setShowModal(true)}
                        shimmerColor="#ffffff"
                        background="rgba(0,180,216,1)"
                        className="px-4 py-2 text-sm whitespace-nowrap"
                      >
                        Iniciar ▶
                      </ShimmerButton>
                      <button
                        onClick={() => { setIsRest(true); }}
                        className="text-[11px] text-blue-400/70 hover:text-blue-400 flex items-center gap-1 transition-colors"
                      >
                        <BedDouble size={11} /> Descansar hoje
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowExercises(v => !v)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showExercises ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Barra de progresso quando ativo */}
              {activeLog && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span className="text-lime-green font-bold">{doneCount}/{dayExercises.length}</span>
                  </div>
                  <div className="w-full bg-dark-border h-1.5">
                    <div
                      className="bg-lime-green h-1.5 transition-all duration-500"
                      style={{ width: `${dayExercises.length ? (doneCount / dayExercises.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Exercícios do dia escolhido ── */}
        <AnimatePresence>
          {todayDay && !isRest && showExercises && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {loadingEx && (
                <p className="text-gray-600 text-xs text-center py-6 animate-pulse">Carregando exercícios...</p>
              )}

              {!loadingEx && dayExercises.length === 0 && (
                <p className="text-gray-700 text-xs text-center py-6">Nenhum exercício cadastrado neste treino.</p>
              )}

              {dayExercises.map((ex) => {
                const key = `${todayDay.id}-${ex.id}`;
                const isDone = !!checked[key];
                const muscleClass = muscleColors[ex.muscle_group] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                return (
                  <div
                    key={ex.id}
                    className={`border p-3 transition-all ${isDone ? 'border-lime-green/40 bg-lime-green/5' : 'border-dark-border bg-dark-card'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        {activeLog && (
                          <button onClick={() => toggleCheck(todayDay.id, ex.id)} className="mt-0.5 shrink-0">
                            {isDone
                              ? <CheckCircle size={20} className="text-lime-green" />
                              : <Circle size={20} className="text-gray-600" />}
                          </button>
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${isDone ? 'text-lime-green line-through opacity-60' : 'text-white'}`}>
                            {ex.name}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-gray-400 text-xs">{ex.sets} séries × {ex.reps}</span>
                            {ex.rest_seconds > 0 && <span className="text-gray-600 text-xs">Descanso: {ex.rest_seconds}s</span>}
                            {ex.muscle_group && <span className={`text-[10px] border px-1.5 py-0.5 ${muscleClass}`}>{ex.muscle_group}</span>}
                          </div>
                          {ex.notes && <p className="text-gray-600 text-xs mt-1 italic">{ex.notes}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <input
                          type="text"
                          placeholder="Carga"
                          value={weights[key] ?? ''}
                          onChange={e => setWeight(todayDay.id, ex.id, e.target.value)}
                          className="w-20 bg-black border border-dark-border text-white text-xs text-center p-2 focus:outline-none focus:border-lime-green transition-colors"
                        />
                        {ex.video_url && (
                          <a
                            href={ex.video_url} target="_blank" rel="noopener noreferrer"
                            className="w-20 flex items-center justify-center gap-1 bg-black border border-blue-500/40 text-blue-400 text-[10px] font-bold py-2 hover:bg-blue-500/10 hover:border-blue-400 transition-all"
                          >
                            <PlayCircle size={13} /> Vídeo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Botão finalizar */}
              {activeLog && dayExercises.length > 0 && (
                <ShimmerButton
                  onClick={finishWorkout}
                  className="w-full mt-2 justify-center"
                  shimmerColor="#ffffff"
                  background="rgba(0,180,216,1)"
                >
                  {doneCount === dayExercises.length ? '✓ Finalizar Treino' : `Salvar Progresso (${doneCount}/${dayExercises.length})`}
                </ShimmerButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Barra semanal ── */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Semana atual</p>
          <WeekBar weekLogs={weekLogs} />
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
