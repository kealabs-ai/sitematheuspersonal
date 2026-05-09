import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronRight, Dumbbell, Images, Search, Copy, GripVertical } from 'lucide-react';
import { ShimmerButton } from '../components/magicui/shimmer-button';
import { adminWorkouts } from '../services/adminApi';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const IconMars  = () => <span className="text-[15px] leading-none">♂</span>;
const IconVenus = () => <span className="text-[15px] leading-none">♀</span>;

const GIF_DIRS = [
  { label: 'Peito',      path: '1- PEITO',       count: 70 },
  { label: 'Costas',     path: '2- COSTAS',      count: 61 },
  { label: 'Tríceps',    path: '3- TRICEPS',     count: 55 },
  { label: 'Bíceps',     path: '4- BICEPS',      count: 56 },
  { label: 'Ombros',     path: '5- OMBROS',      count: 94 },
  { label: 'Antebraço',  path: '6- ANTEBRAÇO',   count: 9  },
  { label: 'Trapézio',   path: '7- TRAPÉZIO',    count: 9  },
  { label: 'Abs e Core', path: '8- ABS E CORE',  count: 93 },
  { label: 'Pernas',     path: '9- PERNAS',      count: 105},
  { label: 'Panturrilha',path: '10- PANTURRILHA',count: 18 },
  { label: 'Cardio',     path: '11- CARDIO',     count: 19 },
];

function buildGifs(dir) {
  const urls = [];
  for (let i = 1; i <= dir.count; i++) urls.push(`/img/${dir.path}/${i}.gif`);
  return urls;
}

function GifPickerModal({ onSelect, onClose }) {
  const [activeDir, setActiveDir] = useState(GIF_DIRS[0]);
  const [search, setSearch]       = useState('');
  const [preview, setPreview]     = useState(null);

  const gifs = buildGifs(activeDir);
  const filtered = search
    ? gifs.filter(u => u.toLowerCase().includes(search.toLowerCase()))
    : gifs;

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-dark-border w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border shrink-0">
          <h3 className="text-lg font-bebas uppercase text-lime-green flex items-center gap-2">
            <Images size={18} /> Selecionar GIF de Treino
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex flex-1 min-h-0">

          {/* Sidebar — grupos musculares */}
          <div className="w-36 shrink-0 border-r border-dark-border overflow-y-auto">
            {GIF_DIRS.map(dir => (
              <button
                key={dir.path}
                onClick={() => { setActiveDir(dir); setSearch(''); setPreview(null); }}
                className={`w-full text-left px-3 py-2.5 text-xs font-semibold transition-colors border-b border-dark-border/50 ${
                  activeDir.path === dir.path
                    ? 'bg-lime-green/10 text-lime-green border-l-2 border-l-lime-green'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {dir.label}
                <span className="block text-[10px] text-gray-600 font-normal">{dir.count} gifs</span>
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Busca */}
            <div className="p-3 border-b border-dark-border shrink-0">
              <div className="flex items-center gap-2 bg-black border border-dark-border px-3 py-2">
                <Search size={14} className="text-gray-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Buscar em ${activeDir.label}...`}
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-600"
                />
                {search && <button onClick={() => setSearch('')} className="text-gray-600 hover:text-white"><X size={12} /></button>}
              </div>
            </div>

            <div className="flex flex-1 min-h-0">

              {/* Grid de GIFs */}
              <div className="flex-1 overflow-y-auto p-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">
                  {activeDir.label} · {filtered.length} imagens
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {filtered.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setPreview(url)}
                      className={`aspect-square border-2 overflow-hidden transition-all hover:border-lime-green ${
                        preview === url ? 'border-lime-green' : 'border-dark-border'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`gif-${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="w-48 shrink-0 border-l border-dark-border p-3 flex flex-col gap-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Preview</p>
                  <img src={preview} alt="preview" className="w-full border border-dark-border" />
                  <p className="text-[10px] text-gray-600 break-all">{preview}</p>
                  <button
                    onClick={() => { onSelect(preview); onClose(); }}
                    className="w-full bg-lime-green text-black font-bold py-2 text-xs uppercase hover:bg-neon-green transition-colors"
                  >
                    Usar este GIF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MUSCLES   = ['Peito','Costas','Pernas','Quadríceps','Posterior','Glúteos','Ombro','Tríceps','Bíceps','Abdômen','Core','Panturrilha','Trapézio','Full Body','Cardio'];
const WEEK_DAYS = ['SEG','TER','QUA','QUI','SEX','SAB','DOM'];
const WEEK_DAY_NUM = { SEG:1, TER:2, QUA:3, QUI:4, SEX:5, SAB:6, DOM:7 };
const WEEK_DAY_LABEL = { 1:'SEG', 2:'TER', 3:'QUA', 4:'QUI', 5:'SEX', 6:'SAB', 7:'DOM' };
const dayLabel = (d) => d?.day_of_week ?? WEEK_DAY_LABEL[d?.week_day] ?? '—';

const LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];
const LEVEL_COLORS = {
  'Iniciante':     'text-green-400 border-green-400/30',
  'Intermediário': 'text-yellow-400 border-yellow-400/30',
  'Avançado':      'text-red-400 border-red-400/30',
};

const emptyTpl = { name: '', description: '', goal: '', gender: 'masculino', level: 'Iniciante', months: '' };
const emptyDay  = { name: '', day_of_week: 'SEG', duration_min: 60, is_rest: false };
const emptyEx = { name: '', sets: 3, reps: '12', rest_seconds: 60, muscle_groups: [], video_url: '', notes: '' };

const toArr = (v) => !v ? [] : Array.isArray(v) ? v : v.split(',').map(s => s.trim()).filter(Boolean);
const toStr = (arr) => arr.join(', ');

function MuscleChips({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const toggle = (m) => onChange(selected.includes(m) ? selected.filter(x => x !== m) : [...selected, m]);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {selected.length === 0 && <span className="text-gray-600 text-xs italic">Nenhum grupo selecionado</span>}
        {selected.map(m => (
          <span key={m} className="flex items-center gap-1 bg-lime-green/10 border border-lime-green/40 text-lime-green text-xs px-2 py-0.5">
            {m}
            <button type="button" onClick={() => toggle(m)} className="hover:text-white transition-colors"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="relative">
        <button type="button" onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between bg-black border border-dark-border text-gray-400 text-sm p-2.5 hover:border-lime-green transition-colors">
          <span>Adicionar grupo muscular...</span>
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-20 top-full left-0 right-0 bg-[#111] border border-dark-border mt-0.5 max-h-48 overflow-y-auto">
            {MUSCLES.map(m => {
              const active = selected.includes(m);
              return (
                <button key={m} type="button" onClick={() => toggle(m)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                    ${active ? 'text-lime-green bg-lime-green/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                  {m}
                  {active && <span className="text-lime-green text-xs">&#10003;</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
const tid = (t) => t?.template_id ?? t?.id_template ?? t?.id;
const did = (d) => d?.day_id      ?? d?.id_day      ?? d?.id;
const eid = (e) => e?.exercise_id ?? e?.id_exercise ?? e?.id;

const norm = (d, key) => Array.isArray(d) ? d : (d?.[key] ?? d?.data ?? []);

const inp = 'w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors';

function SortableDay({ day, children }) {
  const id = String(did(day));
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border border-dark-border bg-dark-card overflow-hidden ${
        isDragging ? 'opacity-50 ring-1 ring-lime-green' : ''
      }`}
    >
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-lg font-bebas uppercase text-lime-green">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function AdminTreinos() {
  const [templates, setTemplates]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]       = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [days, setDays]               = useState({});
  const [exercises, setExercises]     = useState({});
  const [loadingDays, setLoadingDays] = useState({});
  const [loadingExs, setLoadingExs]   = useState({});

  const [tplModal, setTplModal]   = useState(null);
  const [dayModal, setDayModal]   = useState(null);
  const [exModal, setExModal]     = useState(null);
  const [gifPicker, setGifPicker] = useState(false);

  const [tplForm, setTplForm]     = useState(emptyTpl);
  const [dayForm, setDayForm]     = useState(emptyDay);
  const [exForm, setExForm]       = useState(emptyEx);
  const [saving, setSaving]       = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [pendingOrder, setPendingOrder] = useState({}); // { [templateId]: true }
  const [savingOrder, setSavingOrder]   = useState({});

  const confirm = (message, onConfirm) => setConfirmModal({ message, onConfirm });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (templateId, event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDays(prev => {
      const list = prev[templateId] ?? [];
      const oldIndex = list.findIndex(d => String(did(d)) === active.id);
      const newIndex = list.findIndex(d => String(did(d)) === over.id);
      const reordered = arrayMove(list, oldIndex, newIndex);
      return { ...prev, [templateId]: reordered };
    });
    setPendingOrder(p => ({ ...p, [templateId]: true }));
  };

  const saveOrder = async (templateId) => {
    setSavingOrder(p => ({ ...p, [templateId]: true }));
    const list = days[templateId] ?? [];
    await Promise.all(
      list.map((d, i) => adminWorkouts.updateDay(did(d), { sort_order: i + 1 }).catch(() => {}))
    );
    setSavingOrder(p => ({ ...p, [templateId]: false }));
    setPendingOrder(p => ({ ...p, [templateId]: false }));
  };

  useEffect(() => {
    adminWorkouts.templates()
      .then(t => setTemplates(norm(t, 'templates')))
      .finally(() => setLoading(false));
  }, []);

  const toggleTemplate = async (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!days[id]) {
      setLoadingDays(p => ({ ...p, [id]: true }));
      const d = await adminWorkouts.templateDays(id).catch(() => ({}));
      setDays(p => ({ ...p, [id]: norm(d, 'days') }));
      setLoadingDays(p => ({ ...p, [id]: false }));
    }
  };

  const toggleDay = async (dayId) => {
    if (expandedDay === dayId) { setExpandedDay(null); return; }
    setExpandedDay(dayId);
    if (exercises[dayId] !== undefined) return;
    setLoadingExs(p => ({ ...p, [dayId]: true }));
    const d = await adminWorkouts.dayExercises(dayId).catch(() => ({}));
    setExercises(p => ({ ...p, [dayId]: norm(d, 'exercises') }));
    setLoadingExs(p => ({ ...p, [dayId]: false }));
  };

  // ── Template ──
  const saveTpl = async () => {
    setSaving(true);
    const payload = { ...tplForm, months: tplForm.months === '' ? null : +tplForm.months };
    if (tplModal === 'new') {
      await adminWorkouts.createTemplate(payload).catch(() => null);
      const updated = await adminWorkouts.templates().catch(() => null);
      if (updated) setTemplates(norm(updated, 'templates'));
    } else {
      await adminWorkouts.updateTemplate(tid(tplModal), payload).catch(() => {});
      setTemplates(p => p.map(t => tid(t) === tid(tplModal) ? { ...t, ...payload } : t));
    }
    setSaving(false); setTplModal(null);
  };

  const deleteTpl = (id) => confirm(
    'Excluir este template? Todos os dias e exercícios serão removidos.',
    async () => {
      await adminWorkouts.deleteTemplate(id).catch(() => {});
      setTemplates(p => p.filter(t => tid(t) !== id));
      if (expanded === id) setExpanded(null);
    }
  );

  const cloneTpl = async (tpl) => {
    const res = await adminWorkouts.createTemplate({
      name: `${tpl.name} (cópia)`,
      goal: tpl.goal ?? '',
      description: tpl.description ?? '',
      gender: tpl.gender ?? 'masculino',
      level: tpl.level ?? 'Iniciante',
      months: tpl.months ?? null,
    }).catch(() => null);
    if (!res?.template_id) return;
    const newId = res.template_id;
    // clona os dias e exercícios
    const srcDays = days[tid(tpl)] ?? [];
    const daysToClone = srcDays.length ? srcDays : norm(await adminWorkouts.templateDays(tid(tpl)).catch(() => ({})), 'days');
    for (const day of daysToClone) {
      const dr = await adminWorkouts.createDay(newId, {
        name: day.name, day_of_week: dayLabel(day),
        duration_min: day.duration_min ?? 60, is_rest: !!day.is_rest,
        week_day: day.week_day,
      }).catch(() => null);
      if (!dr?.day_id) continue;
      const exs = exercises[did(day)] ?? norm(await adminWorkouts.dayExercises(did(day)).catch(() => ({})), 'exercises');
      for (const ex of exs) {
        await adminWorkouts.createExercise(dr.day_id, {
          name: ex.name, sets: ex.sets, reps: ex.reps,
          rest_seconds: ex.rest_seconds, muscle_group: ex.muscle_group,
          video_url: ex.video_url ?? '', notes: ex.notes ?? '',
        }).catch(() => null);
      }
    }
    const updated = await adminWorkouts.templates().catch(() => null);
    if (updated) setTemplates(norm(updated, 'templates'));
  };

  const cloneDay = async (templateId, day) => {
    const exs = exercises[did(day)] ?? norm(await adminWorkouts.dayExercises(did(day)).catch(() => ({})), 'exercises');
    const res = await adminWorkouts.createDay(templateId, {
      name: `${day.name} (cópia)`, day_of_week: dayLabel(day),
      duration_min: day.duration_min ?? 60, is_rest: !!day.is_rest,
      week_day: day.week_day,
    }).catch(() => null);
    if (!res?.day_id) return;
    for (const ex of exs) {
      await adminWorkouts.createExercise(res.day_id, {
        name: ex.name, sets: ex.sets, reps: ex.reps,
        rest_seconds: ex.rest_seconds, muscle_group: ex.muscle_group,
        video_url: ex.video_url ?? '', notes: ex.notes ?? '',
      }).catch(() => null);
    }
    const updated = await adminWorkouts.templateDays(templateId).catch(() => null);
    if (updated) setDays(p => ({ ...p, [templateId]: norm(updated, 'days') }));
  };

  const cloneEx = async (dayId, ex) => {
    await adminWorkouts.createExercise(dayId, {
      name: `${ex.name} (cópia)`, sets: ex.sets, reps: ex.reps,
      rest_seconds: ex.rest_seconds, muscle_group: ex.muscle_group,
      video_url: ex.video_url ?? '', notes: ex.notes ?? '',
    }).catch(() => null);
    const updated = await adminWorkouts.dayExercises(dayId).catch(() => null);
    if (updated) setExercises(p => ({ ...p, [dayId]: norm(updated, 'exercises') }));
  };

  // ── Dia ──
  const saveDay = async () => {
    setSaving(true);
    const { templateId, day } = dayModal;
    const payload = { ...dayForm, week_day: WEEK_DAY_NUM[dayForm.day_of_week] ?? 1 };
    if (!day) {
      await adminWorkouts.createDay(templateId, payload).catch(() => null);
      const updated = await adminWorkouts.templateDays(templateId).catch(() => null);
      if (updated) setDays(p => ({ ...p, [templateId]: norm(updated, 'days') }));
    } else {
      await adminWorkouts.updateDay(did(day), payload).catch(() => {});
      setDays(p => ({ ...p, [templateId]: (p[templateId] ?? []).map(d => did(d) === did(day) ? { ...d, ...payload } : d) }));
    }
    setSaving(false); setDayModal(null);
  };

  const deleteDay = (templateId, dayId) => confirm(
    'Excluir este dia de treino e todos os seus exercícios?',
    async () => {
      await adminWorkouts.deleteDay(dayId).catch(() => {});
      setDays(p => ({ ...p, [templateId]: (p[templateId] ?? []).filter(d => did(d) !== dayId) }));
    }
  );

  // ── Exercício ──
  const saveEx = async () => {
    setSaving(true);
    const { dayId, ex } = exModal;
    const payload = { ...exForm, muscle_group: toStr(exForm.muscle_groups) };
    if (!ex) {
      await adminWorkouts.createExercise(dayId, payload).catch(() => null);
      const updated = await adminWorkouts.dayExercises(dayId).catch(() => null);
      if (updated) setExercises(p => ({ ...p, [dayId]: norm(updated, 'exercises') }));
    } else {
      await adminWorkouts.updateExercise(eid(ex), payload).catch(() => {});
      setExercises(p => ({ ...p, [dayId]: (p[dayId] ?? []).map(e => eid(e) === eid(ex) ? { ...e, ...payload } : e) }));
    }
    setSaving(false); setExModal(null);
  };

  const deleteEx = (dayId, exId) => confirm(
    'Excluir este exercício?',
    async () => {
      await adminWorkouts.deleteExercise(exId).catch(() => {});
      setExercises(p => ({ ...p, [dayId]: (p[dayId] ?? []).filter(e => eid(e) !== exId) }));
    }
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <button onClick={() => { setTplForm(emptyTpl); setTplModal('new'); }}
          className="flex items-center gap-2 bg-lime-green text-black font-bold px-4 py-2.5 text-sm uppercase hover:bg-neon-green transition-colors">
          <Plus size={16} /> Novo Template
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Nenhum template criado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((tpl, i) => (
            <div key={tid(tpl) ?? i} className="border border-dark-border bg-dark-card overflow-hidden">

              {/* Cabeçalho */}
              <div className="flex items-center justify-between px-4 py-3">
                <button onClick={() => toggleTemplate(tid(tpl))} className="flex items-center gap-3 flex-1 text-left min-w-0">
                  {expanded === tid(tpl)
                    ? <ChevronDown size={16} className="text-lime-green shrink-0" />
                    : <ChevronRight size={16} className="text-gray-500 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{tpl.name}</p>
                    {tpl.description && <p className="text-gray-500 text-xs truncate">{tpl.description}</p>}
                  </div>
                  {tpl.goal && <span className="text-[10px] text-gray-500 border border-dark-border px-2 py-0.5 ml-2 shrink-0">{tpl.goal}</span>}
                  {tpl.months != null && (
                    <span className="text-[10px] text-cyan-400 border border-cyan-400/30 px-2 py-0.5 ml-1 shrink-0">
                      {tpl.months}m
                    </span>
                  )}
                  {tpl.level && (
                    <span className={`text-[10px] border px-2 py-0.5 ml-1 shrink-0 ${LEVEL_COLORS[tpl.level] ?? 'text-gray-500 border-dark-border'}`}>
                      {tpl.level}
                    </span>
                  )}
                  {tpl.gender && (
                    <span className={`inline-flex items-center gap-1 text-[10px] border px-2 py-0.5 ml-1 shrink-0 capitalize ${
                      tpl.gender === 'feminino' ? 'text-pink-400 border-pink-400/30' : 'text-blue-400 border-blue-400/30'
                    }`}>
                      {tpl.gender === 'feminino' ? <IconVenus /> : <IconMars />}
                      {tpl.gender}
                    </span>
                  )}
                </button>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => cloneTpl(tpl)}
                    className="p-1.5 text-gray-500 hover:text-lime-green transition-colors" title="Clonar template"><Copy size={14} /></button>
                  <button onClick={() => { setTplForm({ name: tpl.name, description: tpl.description ?? '', goal: tpl.goal ?? '', gender: tpl.gender ?? 'masculino', level: tpl.level ?? 'Iniciante', months: tpl.months ?? '' }); setTplModal(tpl); }}
                    className="p-1.5 text-gray-500 hover:text-lime-green transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => deleteTpl(tid(tpl))}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Dias */}
              {expanded === tid(tpl) && (
                <div className="border-t border-dark-border bg-black/30 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Dias</p>
                    <div className="flex items-center gap-2">
                      {pendingOrder[tid(tpl)] && (
                        <button
                          onClick={() => saveOrder(tid(tpl))}
                          disabled={savingOrder[tid(tpl)]}
                          className="flex items-center gap-1 text-xs text-lime-green bg-lime-green/10 border border-lime-green/40 px-2.5 py-1 hover:bg-lime-green/20 transition-colors disabled:opacity-50"
                        >
                          <Save size={11} />
                          {savingOrder[tid(tpl)] ? 'Salvando...' : 'Salvar ordem'}
                        </button>
                      )}
                      <button onClick={() => { setDayForm(emptyDay); setDayModal({ templateId: tid(tpl) }); }}
                        className="flex items-center gap-1 text-xs text-lime-green border border-lime-green/30 px-2.5 py-1 hover:bg-lime-green/10 transition-colors">
                        <Plus size={12} /> Adicionar Dia
                      </button>
                    </div>
                  </div>

                  {loadingDays[tid(tpl)] && <p className="text-gray-600 text-xs animate-pulse">Carregando dias...</p>}

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(tid(tpl), e)}
                  >
                    <SortableContext
                      items={(days[tid(tpl)] ?? []).map(d => String(did(d)))}
                      strategy={verticalListSortingStrategy}
                    >
                      {(days[tid(tpl)] ?? []).map((day, di) => (
                        <SortableDay key={did(day) ?? di} day={day}>
                          {({ dragHandleProps }) => (
                            <>
                              <div className="flex items-center justify-between px-3 py-2.5">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span {...dragHandleProps} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0 touch-none">
                                    <GripVertical size={14} />
                                  </span>
                                  <button onClick={() => toggleDay(did(day))} className="flex items-center gap-2 flex-1 text-left min-w-0">
                                    {expandedDay === did(day)
                                      ? <ChevronDown size={13} className="text-lime-green shrink-0" />
                                      : <ChevronRight size={13} className="text-gray-600 shrink-0" />}
                                    <span className="text-[10px] font-bold text-gray-400 border border-dark-border px-1.5 py-0.5 uppercase shrink-0">
                                      {dayLabel(day)}
                                    </span>
                                    <span className="text-white text-sm truncate">{day.name}</span>
                                    {day.is_rest ? <span className="text-blue-400 text-[10px] shrink-0">Descanso</span> : null}
                                    {day.duration_min > 0 && <span className="text-gray-600 text-xs shrink-0">{day.duration_min}min</span>}
                                  </button>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button onClick={e => { e.stopPropagation(); if (expandedDay !== did(day)) setExpandedDay(did(day)); setExForm(emptyEx); setExModal({ dayId: did(day) }); }}
                                    className="p-1 text-gray-600 hover:text-lime-green transition-colors" title="Adicionar exercício">
                                    <Plus size={13} />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); cloneDay(tid(tpl), day); }}
                                    className="p-1 text-gray-600 hover:text-lime-green transition-colors" title="Clonar dia"><Copy size={13} /></button>
                                  <button onClick={e => { e.stopPropagation(); setDayForm({ name: day.name, day_of_week: dayLabel(day), duration_min: day.duration_min ?? 60, is_rest: !!day.is_rest }); setDayModal({ templateId: tid(tpl), day }); }}
                                    className="p-1 text-gray-600 hover:text-lime-green transition-colors"><Pencil size={13} /></button>
                                  <button onClick={e => { e.stopPropagation(); deleteDay(tid(tpl), did(day)); }}
                                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                                </div>
                              </div>

                              {expandedDay === did(day) && (
                                <div className="border-t border-dark-border px-3 pb-2 pt-1 space-y-1">
                                  {loadingExs[did(day)] && <p className="text-gray-600 text-xs py-2 animate-pulse">Carregando exercícios...</p>}
                                  {!loadingExs[did(day)] && (exercises[did(day)] ?? []).length === 0 && (
                                    <p className="text-gray-700 text-xs py-1">Nenhum exercício. Clique em + para adicionar.</p>
                                  )}
                                  {(exercises[did(day)] ?? []).map((ex, ei) => (
                                    <div key={eid(ex) ?? ei} className="flex items-center justify-between py-1.5 border-b border-dark-border/50 last:border-0">
                                      <div className="min-w-0">
                                        <span className="text-white text-xs font-medium">{ex.name}</span>
                                        <span className="text-gray-500 text-[10px] ml-2">
                                          {ex.sets}×{ex.reps}
                                          {ex.muscle_group && ` · ${ex.muscle_group}`}
                                          {ex.rest_seconds > 0 && ` · ${ex.rest_seconds}s`}
                                        </span>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <button onClick={() => cloneEx(did(day), ex)}
                                          className="p-1 text-gray-600 hover:text-lime-green transition-colors" title="Clonar exercício"><Copy size={12} /></button>
                                        <button onClick={() => { setExForm({ name: ex.name, sets: ex.sets ?? 3, reps: ex.reps ?? '12', rest_seconds: ex.rest_seconds ?? 60, muscle_groups: toArr(ex.muscle_group), video_url: ex.video_url ?? '', notes: ex.notes ?? '' }); setExModal({ dayId: did(day), ex }); }}
                                          className="p-1 text-gray-600 hover:text-lime-green transition-colors"><Pencil size={12} /></button>
                                        <button onClick={() => deleteEx(did(day), eid(ex))}
                                          className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </SortableDay>
                      ))}
                    </SortableContext>
                  </DndContext>

                  {!loadingDays[tid(tpl)] && (days[tid(tpl)] ?? []).length === 0 && (
                    <p className="text-gray-700 text-xs">Nenhum dia configurado.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Template */}
      {tplModal !== null && (
        <Modal title={tplModal === 'new' ? 'Novo Template' : 'Editar Template'} onClose={() => setTplModal(null)}>
          <Field label="Nome do template">
            <input className={inp} value={tplForm.name} onChange={e => setTplForm({ ...tplForm, name: e.target.value })} placeholder="Ex: Hipertrofia A/B/C" />
          </Field>
          <Field label="Objetivo">
            <input className={inp} value={tplForm.goal} onChange={e => setTplForm({ ...tplForm, goal: e.target.value })} placeholder="Ex: Hipertrofia" />
          </Field>
          <Field label="Gênero">
            <div className="grid grid-cols-2 gap-2">
              <ShimmerButton
                type="button"
                onClick={() => setTplForm({ ...tplForm, gender: 'masculino' })}
                shimmerColor="#60a5fa"
                background={tplForm.gender === 'masculino' ? 'rgba(37,99,235,0.15)' : 'rgba(10,10,10,1)'}
                className={`w-full justify-center py-3 gap-2 border transition-colors ${
                  tplForm.gender === 'masculino' ? 'border-blue-400' : 'border-dark-border'
                }`}
              >
                <IconMars />
                <span className={`text-sm font-bold ${
                  tplForm.gender === 'masculino' ? 'text-blue-400' : 'text-gray-500'
                }`}>Masculino</span>
              </ShimmerButton>
              <ShimmerButton
                type="button"
                onClick={() => setTplForm({ ...tplForm, gender: 'feminino' })}
                shimmerColor="#f472b6"
                background={tplForm.gender === 'feminino' ? 'rgba(219,39,119,0.15)' : 'rgba(10,10,10,1)'}
                className={`w-full justify-center py-3 gap-2 border transition-colors ${
                  tplForm.gender === 'feminino' ? 'border-pink-400' : 'border-dark-border'
                }`}
              >
                <IconVenus />
                <span className={`text-sm font-bold ${
                  tplForm.gender === 'feminino' ? 'text-pink-400' : 'text-gray-500'
                }`}>Feminino</span>
              </ShimmerButton>
            </div>
          </Field>
          <Field label="Nível">
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map(lv => (
                <button key={lv} type="button" onClick={() => setTplForm({ ...tplForm, level: lv })}
                  className={`py-2.5 text-xs font-bold border transition-colors ${
                    tplForm.level === lv
                      ? `${LEVEL_COLORS[lv]} bg-white/5`
                      : 'border-dark-border text-gray-600 hover:border-gray-500'
                  }`}>
                  {lv}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Validade do treino">
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                className={`${inp} w-28 text-center`}
                value={tplForm.months}
                onChange={e => setTplForm({ ...tplForm, months: e.target.value === '' ? '' : +e.target.value })}
                placeholder="Ex: 2"
              />
              <span className="text-gray-400 text-sm font-semibold">meses</span>
              <span className="text-gray-600 text-xs">Deixe vazio para sem limite</span>
            </div>
          </Field>
          <Field label="Descrição">
            <textarea rows={2} className={`${inp} resize-none`} value={tplForm.description} onChange={e => setTplForm({ ...tplForm, description: e.target.value })} />
          </Field>
          <button onClick={saveTpl} disabled={saving || !tplForm.name}
            className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Template'}
          </button>
        </Modal>
      )}

      {/* Modal Dia */}
      {dayModal !== null && (
        <Modal title={dayModal.day ? 'Editar Dia' : 'Novo Dia'} onClose={() => setDayModal(null)}>
          <Field label="Nome do treino">
            <input className={inp} value={dayForm.name} onChange={e => setDayForm({ ...dayForm, name: e.target.value })} placeholder="Ex: Peito e Tríceps" />
          </Field>
          <Field label="Dia da semana">
            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map(w => (
                <button key={w} onClick={() => setDayForm({ ...dayForm, day_of_week: w })}
                  className={`py-2 text-xs font-bold border transition-colors ${dayForm.day_of_week === w ? 'border-lime-green text-lime-green' : 'border-dark-border text-gray-600'}`}>
                  {w}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Duração (min)">
              <input type="number" className={inp} value={dayForm.duration_min} onChange={e => setDayForm({ ...dayForm, duration_min: +e.target.value })} />
            </Field>
            <Field label="Descanso?">
              <button onClick={() => setDayForm({ ...dayForm, is_rest: !dayForm.is_rest })}
                className={`w-full py-2.5 text-sm font-bold border transition-colors ${dayForm.is_rest ? 'border-blue-400 text-blue-400' : 'border-dark-border text-gray-600'}`}>
                {dayForm.is_rest ? '✓ Sim' : 'Não'}
              </button>
            </Field>
          </div>
          <button onClick={saveDay} disabled={saving || !dayForm.name}
            className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Dia'}
          </button>
        </Modal>
      )}

      {/* Modal Exercício */}
      {exModal !== null && (
        <Modal title={exModal.ex ? 'Editar Exercício' : 'Novo Exercício'} onClose={() => setExModal(null)}>
          <Field label="Nome do exercício">
            <input className={inp} value={exForm.name} onChange={e => setExForm({ ...exForm, name: e.target.value })} placeholder="Ex: Supino Reto" />
          </Field>
          <Field label="Grupos musculares">
            <MuscleChips
              selected={exForm.muscle_groups}
              onChange={v => setExForm({ ...exForm, muscle_groups: v })}
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Séries">
              <input type="number" className={inp} value={exForm.sets} onChange={e => setExForm({ ...exForm, sets: +e.target.value })} />
            </Field>
            <Field label="Repetições">
              <input className={inp} value={exForm.reps} onChange={e => setExForm({ ...exForm, reps: e.target.value })} placeholder="12 ou 8-12" />
            </Field>
            <Field label="Descanso (s)">
              <input type="number" className={inp} value={exForm.rest_seconds} onChange={e => setExForm({ ...exForm, rest_seconds: +e.target.value })} />
            </Field>
          </div>
          <Field label="URL do vídeo / GIF">
            <div className="flex gap-2">
              <input
                className={`${inp} flex-1`}
                value={exForm.video_url}
                onChange={e => setExForm({ ...exForm, video_url: e.target.value })}
                placeholder="https://... ou selecione um GIF →"
              />
              <button
                type="button"
                onClick={() => setGifPicker(true)}
                className="shrink-0 flex items-center gap-1.5 bg-dark-card border border-lime-green/40 text-lime-green px-3 py-2 text-xs font-bold uppercase hover:bg-lime-green/10 transition-colors"
                title="Selecionar GIF da biblioteca"
              >
                <Images size={14} /> GIF
              </button>
            </div>
            {exForm.video_url && /\.gif/i.test(exForm.video_url) && (
              <img src={exForm.video_url} alt="preview" className="mt-2 h-20 border border-dark-border object-contain" />
            )}
          </Field>
          <Field label="Observações">
            <textarea rows={2} className={`${inp} resize-none`} value={exForm.notes} onChange={e => setExForm({ ...exForm, notes: e.target.value })} />
          </Field>
          <button onClick={saveEx} disabled={saving || !exForm.name}
            className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Exercício'}
          </button>
        </Modal>
      )}

      {gifPicker && (
        <GifPickerModal
          onSelect={url => setExForm(f => ({ ...f, video_url: url }))}
          onClose={() => setGifPicker(false)}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4"
          onClick={() => setConfirmModal(null)}>
          <div className="bg-[#111] border border-red-500/30 w-full max-w-sm p-6 space-y-5"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Trash2 size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Confirmar exclusão</p>
                <p className="text-gray-400 text-xs mt-1">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 text-sm font-bold border border-dark-border text-gray-400 hover:border-gray-500 hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                className="flex-1 py-2.5 text-sm font-bold bg-red-500/10 border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}