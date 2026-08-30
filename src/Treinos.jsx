import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Circle, Dumbbell, Clock, PlayCircle,
  BedDouble, X, ListChecks, ChevronDown, ChevronUp, History, CalendarDays,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { workouts as workoutsApi } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import { ShimmerButton } from './components/magicui/shimmer-button';

const WORKOUT_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const WEEK_LABELS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

const toLocalISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function getWeekDays() {
  const today = new Date();
  const todayDow = today.getDay(); // 0=dom, 1=seg...
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((todayDow + 6) % 7)); // segunda-feira
  startOfWeek.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return {
      label: WEEK_LABELS[i],
      iso: toLocalISO(d),
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

// ─── Modal calendário ────────────────────────────────────────────────────────
function CalendarModal({ onClose }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-based
  const [selected, setSelected]   = useState(null); // iso selecionado

  useEffect(() => {
    workoutsApi.history().catch(() => ({}))
      .then(d => {
        const raw = d.logs ?? d.history ?? [];
        // Normaliza para UTC→local e filtra apenas finalizados
        const finished = raw.filter(l => l.completed && (l.finished_at || l.started_at)).map(l => {
          const dateRaw = l.finished_at || l.started_at;
          const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(dateRaw);
          const norm = dateRaw.includes('T') ? (hasTimezone ? dateRaw : dateRaw + 'Z') : dateRaw + 'T00:00:00';
          return { ...l, localIso: toLocalISO(new Date(norm)) };
        });
        setLogs(finished);
      })
      .finally(() => setLoading(false));
  }, []);

  // Mapa iso → log
  const logMap = {};
  logs.forEach(l => { if (!logMap[l.localIso]) logMap[l.localIso] = l; });

  const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const DAY_LABELS  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  // Dias do mês em exibição
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=dom
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(viewYear, viewMonth, i + 1);
      return toLocalISO(d);
    })
  );
  // Completa para múltiplo de 7
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); setSelected(null); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); setSelected(null); };

  const todayIso = toLocalISO(today);
  const selectedLog = selected ? logMap[selected] : null;

  const dur = (start, end) => {
    if (!start || !end) return null;
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    return mins > 0 ? `${mins} min` : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 px-4 pb-4 md:pb-0" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-sm bg-dark-card border border-dark-border flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <p className="font-bebas text-xl text-white flex items-center gap-2">
            <CalendarDays size={18} className="text-lime-green" /> Calendário de Treinos
          </p>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Navegação mês */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="text-gray-500 hover:text-white p-1"><ChevronLeft size={18} /></button>
            <span className="text-white font-bold text-sm">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            <button
              onClick={nextMonth}
              disabled={viewYear === today.getFullYear() && viewMonth === today.getMonth()}
              className="text-gray-500 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
            ><ChevronRight size={18} /></button>
          </div>

          {loading ? (
            <p className="text-gray-500 text-xs text-center py-6 animate-pulse">Carregando...</p>
          ) : (
            <>
              {/* Labels dias da semana */}
              <div className="grid grid-cols-7 gap-1">
                {DAY_LABELS.map(l => (
                  <div key={l} className="text-center text-[9px] font-bold text-gray-600 uppercase">{l}</div>
                ))}
              </div>

              {/* Grid dias */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((iso, i) => {
                  if (!iso) return <div key={i} />;
                  const hasLog  = !!logMap[iso];
                  const isToday = iso === todayIso;
                  const isSel   = iso === selected;
                  const isFuture = iso > todayIso;
                  return (
                    <button
                      key={iso}
                      disabled={!hasLog}
                      onClick={() => setSelected(isSel ? null : iso)}
                      className={`relative aspect-square flex flex-col items-center justify-center text-[11px] font-bold border transition-all
                        ${ isSel          ? 'border-lime-green bg-lime-green/20 text-lime-green'
                          : hasLog        ? 'border-lime-green/40 bg-lime-green/8 text-lime-green hover:bg-lime-green/15 cursor-pointer'
                          : isToday       ? 'border-lime-green/30 text-lime-green/60'
                          : isFuture      ? 'border-transparent text-gray-700'
                          : 'border-transparent text-gray-600' }`}
                    >
                      {parseInt(iso.split('-')[2], 10)}
                      {hasLog && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-lime-green" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detalhe do dia selecionado */}
              {selectedLog && (
                <div className="border border-lime-green/30 bg-lime-green/5 p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bebas text-2xl text-lime-green leading-none">{selectedLog.training ?? '✓'}</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{selectedLog.day_name ?? 'Treino'}</p>
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <CalendarDays size={10} />
                        {new Date(selected + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                        {dur(selectedLog.started_at, selectedLog.finished_at) && (
                          <><Clock size={10} className="ml-1" /> {dur(selectedLog.started_at, selectedLog.finished_at)}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Legenda */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-green" />
                  <span className="text-[10px] text-gray-500">Treino finalizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border border-lime-green/30" />
                  <span className="text-[10px] text-gray-500">Hoje</span>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function WeekBar({ weekLogs, onHistoryClick, onCalendarClick }) {
  const days = getWeekDays();
  const doneCount = days.filter(d => weekLogs[d.iso]).length;
  return (
    <div className="bg-dark-card border border-dark-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-lime-green" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Semana atual</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">
            <span className="text-lime-green font-bold">{doneCount}</span>/{days.length} dias
          </span>
          <button
            onClick={onCalendarClick}
            className="flex items-center gap-1.5 text-[11px] text-gray-500 border border-dark-border px-2.5 py-1 hover:border-lime-green hover:text-lime-green transition-colors"
          >
            <CalendarDays size={12} /> Calendário
          </button>
          <button
            onClick={onHistoryClick}
            className="flex items-center gap-1.5 text-[11px] text-gray-500 border border-dark-border px-2.5 py-1 hover:border-lime-green hover:text-lime-green transition-colors"
          >
            <History size={12} /> Histórico
          </button>
        </div>
      </div>

      {/* Barra de progresso semanal */}
      <div className="w-full bg-black h-1">
        <div
          className="bg-lime-green h-1 transition-all duration-700"
          style={{ width: `${(doneCount / days.length) * 100}%` }}
        />
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ label, iso, isToday }) => {
          const log = weekLogs[iso];
          return (
            <div
              key={iso}
              className={`relative flex flex-col items-center gap-1 py-2.5 px-1 border transition-all
                ${log
                  ? 'border-lime-green/50 bg-lime-green/8'
                  : isToday
                  ? 'border-lime-green/30 bg-lime-green/3'
                  : 'border-dark-border/60'}`}
            >
              {/* Dot indicador */}
              {isToday && !log && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-lime-green animate-pulse" />
              )}
              <span className={`text-[9px] font-bold uppercase tracking-wider
                ${isToday && !log ? 'text-lime-green' : log ? 'text-lime-green/70' : 'text-gray-600'}`}>
                {label}
              </span>
              {log ? (
                <>
                  <span className="text-lime-green font-bebas text-base leading-none">{log.label}</span>
                  <CheckCircle size={12} className="text-lime-green" />
                </>
              ) : (
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center
                  ${isToday ? 'border-lime-green/40' : 'border-dark-border/40'}`}>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-lime-green/40" />}
                </span>
              )}
              {log?.name && (
                <span className="text-[8px] text-gray-600 truncate w-full text-center leading-tight">
                  {log.name.split(' ')[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Modal histórico ─────────────────────────────────────────────────────────
function HistoryModal({ onClose }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workoutsApi.history().catch(() => ({}))
      .then(d => setLogs(d.logs ?? d.history ?? []))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' });
  };

  const dur = (start, end) => {
    if (!start || !end) return null;
    const mins = Math.round((new Date(end) - new Date(start)) / 60000);
    return mins > 0 ? `${mins} min` : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 px-4 pb-4 md:pb-0" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md bg-dark-card border border-dark-border max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-dark-border shrink-0">
          <p className="font-bebas text-xl text-white flex items-center gap-2">
            <History size={18} className="text-lime-green" /> Histórico de Treinos
          </p>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {loading && <p className="text-gray-500 text-sm text-center py-8 animate-pulse">Carregando...</p>}
          {!loading && logs.length === 0 && (
            <div className="text-center py-10">
              <Dumbbell size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Nenhum treino registrado ainda.</p>
            </div>
          )}
          {logs.map((l, i) => (
            <div key={l.id ?? i} className="flex items-center gap-3 border border-dark-border bg-black p-3">
              {/* Badge treino */}
              <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-lime-green/30 bg-lime-green/5">
                <span className="font-bebas text-xl text-lime-green leading-none">
                  {l.training ?? '✓'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{l.day_name ?? 'Treino'}</p>
                <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-2">
                  <CalendarDays size={10} /> {fmt(l.finished_at ?? l.started_at)}
                  {dur(l.started_at, l.finished_at) && (
                    <><Clock size={10} /> {dur(l.started_at, l.finished_at)}</>
                  )}
                </p>
              </div>
              {l.completed ? (
                <CheckCircle size={16} className="text-lime-green shrink-0" />
              ) : (
                <span className="text-[10px] text-yellow-500 border border-yellow-500/30 px-1.5 py-0.5 shrink-0">Parcial</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function isGif(url) {
  return /\.gif(\?.*)?$/i.test(url);
}

function isVideo(url) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('youtube') || url.includes('youtu.be') || url.includes('vimeo');
}

function getYoutubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
}

function MediaButton({ url }) {
  const [open, setOpen] = useState(false);
  const gif = isGif(url);
  const video = isVideo(url);
  const youtubeEmbed = (video && !gif) ? getYoutubeEmbed(url) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-20 flex items-center justify-center gap-1 bg-black border border-blue-500/40 text-blue-400 text-[10px] font-bold py-2 hover:bg-blue-500/10 hover:border-blue-400 transition-all"
      >
        <PlayCircle size={13} /> {gif ? 'Treino' : 'Vídeo'}
      </button>

      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-dark-card border border-dark-border p-4"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              {gif && (
                <img src={url} alt="Execução" className="w-full rounded" />
              )}

              {video && youtubeEmbed && (
                <div className="aspect-video">
                  <iframe
                    src={youtubeEmbed}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}

              {video && !youtubeEmbed && (
                <video src={url} controls autoPlay className="w-full" />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
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
function WorkoutSelectModal({ trainDays, suggested, userGoal, templateGender, onSelect, onRest, onClose }) {
  const goalColor = userGoal === 'Emagrecimento' ? 'text-orange-400 border-orange-400/40' : 'text-lime-green border-lime-green/40';
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 px-4 pb-4 md:pb-0">
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md bg-dark-card border border-dark-border p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bebas text-xl text-white flex items-center gap-2">
              <ListChecks size={18} className="text-lime-green" /> Escolha o treino de hoje
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {userGoal && (
                <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 inline-block ${goalColor}`}>
                  {userGoal === 'Hipertrofia' ? '💪' : '🔥'} {userGoal}
                </span>
              )}
              {templateGender && (
                <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 inline-block capitalize ${
                  templateGender === 'feminino' ? 'text-pink-400 border-pink-400/40' : 'text-blue-400 border-blue-400/40'
                }`}>
                  {templateGender === 'feminino' ? '♀️' : '♂️'} {templateGender}
                </span>
              )}
            </div>
          </div>
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
  const [userGoal, setUserGoal]       = useState(null); // objetivo do aluno
  const [templateGender, setTemplateGender] = useState(null);
  const [exercises, setExercises]     = useState({});
  const [checked, setChecked]         = useState({});
  const [weights, setWeights]         = useState({});
  const [activeLog, setActiveLog]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadingEx, setLoadingEx]     = useState(false);
  const [isRest, setIsRest]           = useState(false);
  const [planName, setPlanName]       = useState('');
  const [templateName, setTemplateName] = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [weeklyResult, setWeeklyResult]         = useState(null);
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const [pendingFinish, setPendingFinish]         = useState(false);
  const [showExercises, setShowExercises] = useState(true);
  const [weekLogs, setWeekLogs]       = useState({});
  const [showHistory, setShowHistory]   = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const planRef = useRef(null);

  useEffect(() => {
    Promise.all([
      workoutsApi.plan().catch(() => ({})),
      workoutsApi.history().catch(() => ({})),
    ]).then(([planData, histData]) => {
      if (!planData.detail && !planData.error) {
        planRef.current = planData.plan;
        setPlanName(planData.plan?.name || '');
        setTemplateName(planData.plan?.template_name || '');
        const days = (planData.plan?.days ?? []).map((d, i) => ({
          ...d,
          originalIsRest: d.is_rest ?? false,
          workoutLabel: WORKOUT_LABELS[i] ?? String(i + 1),
        }));
        setAllDays(days);
        setUserGoal(planData.plan?.user_goal ?? null);
        setTemplateGender(planData.plan?.gender ?? null);

        const trainOnly = days.filter(d => !d.is_rest);
        // Tenta usar o dia marcado como 'today' pela API, senão usa o primeiro dia de treino
        const s = trainOnly.find(d => d.status === 'today') ?? trainOnly[0] ?? null;
        setSuggested(s ?? null);
        setTodayDay(s ?? null);
        if (s) fetchExercises(s.id);
      }
      buildWeekLogs(histData);
    }).finally(() => setLoading(false));
  }, []);

  const buildWeekLogs = (histData) => {
    const logs = histData.logs ?? histData.history ?? [];
    const today = new Date();
    const todayDow = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((todayDow + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const map = {};
    logs.forEach(l => {
      if (!l.completed) return;
      const dateRaw = l.finished_at || l.started_at;
      if (!dateRaw) return;
      const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(dateRaw);
      const normalized = dateRaw.includes('T') ? (hasTimezone ? dateRaw : dateRaw + 'Z') : dateRaw + 'T00:00:00';
      const d = new Date(normalized);
      if (isNaN(d) || d < weekStart || d >= weekEnd) return;
      const iso = toLocalISO(d);
      if (!map[iso]) map[iso] = { label: l.training ?? '✓', name: l.day_name ?? '' };
    });
    setWeekLogs(map);
  };

  const fetchExercises = async (dayId) => {
    if (exercises[dayId] !== undefined) return;
    setLoadingEx(true);
    const data = await workoutsApi.dayExercises(dayId).catch(() => ({}));
    const exList = Array.isArray(data.exercises) ? data.exercises : [];
    setExercises(prev => ({ ...prev, [dayId]: exList }));
    setLoadingEx(false);
  };

  const trainDays = allDays.filter(d => !d.originalIsRest);

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

    // Atualiza barra imediatamente com o treino finalizado (Data Local)
    const todayIso = toLocalISO(new Date());
    const finishedDay = trainDays.find(d => d.id === dayId);
    setWeekLogs(prev => ({ ...prev, [todayIso]: { label: finishedDay?.workoutLabel ?? '✓', name: finishedDay?.name ?? '' } }));

    // Sincroniza com histórico real
    const histData = await workoutsApi.history().catch(() => ({}));
    buildWeekLogs(histData);

    const allLogs = histData.logs ?? histData.history ?? [];
    const today = new Date();
    const todayDow = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((todayDow + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weeklyDone = allLogs.filter(l => {
      if (!l.completed) return false;
      const _raw = l.finished_at || l.started_at;
      if (!_raw) return false;
      const hasTimezone = /Z$|[+-]\d{2}:\d{2}$/.test(_raw);
      const normalized = _raw.includes('T') ? (hasTimezone ? _raw : _raw + 'Z') : _raw + 'T00:00:00';
      const d = new Date(normalized);
      return d >= weekStart && d < weekEnd;
    }).length;
    const weeklyGoal = planRef.current?.weekly_goal ?? trainDays.length ?? 3;
    setWeeklyResult({ weeklyDone, weeklyGoal });
  };

  const handleFinishClick = () => {
    if (!activeLog) return;
    const { dayId } = activeLog;
    const exList = exercises[dayId] ?? [];
    const anyMissing = exList.some(ex => !weights[`${dayId}-${ex.id}`]);
    if (anyMissing) { setShowWeightWarning(true); return; }
    finishWorkout();
  };

  const confirmFinish = () => { setShowWeightWarning(false); setPendingFinish(false); finishWorkout(); };

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
            userGoal={userGoal}
            templateGender={templateGender}
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
        {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}
        {showCalendar && <CalendarModal onClose={() => setShowCalendar(false)} />}
        {showWeightWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={() => setShowWeightWarning(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm bg-dark-card border border-yellow-500/40 p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <span className="text-4xl">&#9878;</span>
                <p className="font-bebas text-2xl text-white mt-2">Registre as cargas!</p>
              </div>
              <p className="text-gray-300 text-sm text-center leading-relaxed">
                Registrar o peso utilizado em cada exercício é essencial para acompanhar sua
                <span className="text-yellow-400 font-semibold"> evolução de força</span> ao longo do tempo.
              </p>
              <p className="text-gray-500 text-xs text-center">
                Com os dados de carga, o Matheus consegue ajustar seu treino com precisão e você visualiza seu progresso real nos gráficos.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => { setShowWeightWarning(false); setPendingFinish(false); }}
                  className="border border-dark-border text-gray-400 font-bold py-3 text-sm uppercase hover:border-gray-500 hover:text-white transition-colors"
                >
                  Voltar e preencher
                </button>
                <button
                  onClick={confirmFinish}
                  className="border border-yellow-500/50 text-yellow-400 font-bold py-3 text-sm uppercase hover:bg-yellow-500/10 transition-colors"
                >
                  Salvar mesmo assim
                </button>
              </div>
            </motion.div>
          </div>
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
                  <p className="text-lime-green text-xs font-bold uppercase tracking-widest flex items-center gap-1 flex-wrap">
                    <Dumbbell size={12} /> Treino de hoje
                    {templateName && (
                      <span className="text-gray-400 font-normal normal-case tracking-normal"> • {templateName}</span>
                    )}
                    {userGoal && (
                      <span className="text-[10px] border border-lime-green/40 px-1.5 py-0.5 font-normal">
                        {userGoal}
                      </span>
                    )}
                    {templateGender && (
                      <span className={`text-[10px] border px-1.5 py-0.5 font-normal capitalize ${
                        templateGender === 'feminino' ? 'border-pink-400/40 text-pink-400' : 'border-blue-400/40 text-blue-400'
                      }`}>
                        {templateGender === 'feminino' ? '♀️' : '♂️'} {templateGender}
                      </span>
                    )}
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
                    weekLogs[toLocalISO(new Date())] ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 border border-lime-green/40 bg-lime-green/5 px-3 py-2">
                          <CheckCircle size={13} className="text-lime-green shrink-0" />
                          <span className="text-lime-green text-[11px] font-bold whitespace-nowrap">Treino registrado</span>
                        </div>
                        <span className="text-[10px] text-gray-600">Volte amanhã 💪</span>
                      </div>
                    ) : (
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
                    )
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
                          <MediaButton url={ex.video_url} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Botão finalizar */}
              {activeLog && dayExercises.length > 0 && (
                <ShimmerButton
                  onClick={handleFinishClick}
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
        <WeekBar weekLogs={weekLogs} onHistoryClick={() => setShowHistory(true)} onCalendarClick={() => setShowCalendar(true)} />

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
