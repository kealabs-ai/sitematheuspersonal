import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronRight, Dumbbell } from 'lucide-react';
import { adminWorkouts } from '../services/adminApi';

const MUSCLES   = ['Peito', 'Costas', 'Pernas', 'Quadríceps', 'Posterior', 'Glúteos', 'Ombro', 'Tríceps', 'Bíceps', 'Abdômen', 'Core', 'Panturrilha', 'Trapézio', 'Full Body', 'Cardio'];
const WEEK_DAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

const emptyPlan = { name: '', description: '', goal: '' };
const emptyDay  = { name: '', day_of_week: 'SEG', duration_min: 60, is_rest: false };
const emptyEx   = { name: '', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Peito', video_url: '', notes: '' };

// Resolve ID de plano, dia ou exercício — aceita qualquer campo que a API retorne
const pid = (p) => p?.plan_id   ?? p?.id_plan   ?? p?.id ?? p?.id_user;
const did = (d) => d?.day_id    ?? d?.id_day    ?? d?.id ?? d?.id_user;
const eid = (e) => e?.exercise_id ?? e?.id_exercise ?? e?.id ?? e?.id_user;

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

const inp = 'w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors';

export default function AdminTreinos() {
  const [plans, setPlans]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [days, setDays]           = useState({});       // planId → days[]
  const [exercises, setExercises] = useState({});       // dayId  → exercises[]
  const [loadingDays, setLoadingDays] = useState({});   // planId → bool
  const [loadingExs, setLoadingExs]   = useState({});   // dayId  → bool

  const [planModal, setPlanModal] = useState(null);
  const [dayModal, setDayModal]   = useState(null);
  const [exModal, setExModal]     = useState(null);

  const [planForm, setPlanForm]   = useState(emptyPlan);
  const [dayForm, setDayForm]     = useState(emptyDay);
  const [exForm, setExForm]       = useState(emptyEx);
  const [saving, setSaving]       = useState(false);

  const normalizePlans = (d) => Array.isArray(d) ? d : (d?.plans ?? d?.data ?? []);
  const normalizeDays  = (d) => Array.isArray(d) ? d : (d?.days  ?? d?.data ?? []);
  const normalizeExs   = (d) => Array.isArray(d) ? d : (d?.exercises ?? d?.data ?? []);

  useEffect(() => {
    adminWorkouts.plans()
      .then(d => setPlans(normalizePlans(d)))
      .finally(() => setLoading(false));
  }, []);

  const togglePlan = async (planId) => {
    if (expanded === planId) { setExpanded(null); return; }
    setExpanded(planId);
    if (!days[planId]) {
      setLoadingDays(prev => ({ ...prev, [planId]: true }));
      const d = await adminWorkouts.planDays(planId).catch(() => ({}));
      setDays(prev => ({ ...prev, [planId]: normalizeDays(d) }));
      setLoadingDays(prev => ({ ...prev, [planId]: false }));
    }
  };

  const loadExercises = async (dayId) => {
    if (exercises[dayId] !== undefined) return;
    setLoadingExs(prev => ({ ...prev, [dayId]: true }));
    const d = await adminWorkouts.dayExercises(dayId).catch(() => ({}));
    setExercises(prev => ({ ...prev, [dayId]: normalizeExs(d) }));
    setLoadingExs(prev => ({ ...prev, [dayId]: false }));
  };

  // ── Plano ──
  const savePlan = async () => {
    setSaving(true);
    if (planModal === 'new') {
      await adminWorkouts.createPlan(planForm).catch(() => null);
      const updated = await adminWorkouts.plans().catch(() => null);
      if (updated) setPlans(normalizePlans(updated));
    } else {
      await adminWorkouts.updatePlan(pid(planModal), planForm).catch(() => {});
      setPlans(prev => prev.map(p => pid(p) === pid(planModal) ? { ...p, ...planForm } : p));
    }
    setSaving(false); setPlanModal(null);
  };

  const deletePlan = async (planId) => {
    if (!confirm('Excluir este plano?')) return;
    await adminWorkouts.deletePlan(planId).catch(() => {});
    setPlans(prev => prev.filter(p => pid(p) !== planId));
    if (expanded === planId) setExpanded(null);
  };

  // ── Dia ──
  const saveDay = async () => {
    setSaving(true);
    const { planId, day } = dayModal;
    if (!day) {
      await adminWorkouts.createDay(planId, dayForm).catch(() => null);
      const updated = await adminWorkouts.planDays(planId).catch(() => null);
      if (updated) setDays(prev => ({ ...prev, [planId]: normalizeDays(updated) }));
    } else {
      await adminWorkouts.updateDay(did(day), dayForm).catch(() => {});
      setDays(prev => ({ ...prev, [planId]: (prev[planId] ?? []).map(d => did(d) === did(day) ? { ...d, ...dayForm } : d) }));
    }
    setSaving(false); setDayModal(null);
  };

  const deleteDay = async (planId, dayId) => {
    if (!confirm('Excluir este dia?')) return;
    await adminWorkouts.deleteDay(dayId).catch(() => {});
    setDays(prev => ({ ...prev, [planId]: (prev[planId] ?? []).filter(d => did(d) !== dayId) }));
  };

  // ── Exercício ──
  const saveEx = async () => {
    setSaving(true);
    const { dayId, ex } = exModal;
    if (!ex) {
      await adminWorkouts.createExercise(dayId, exForm).catch(() => null);
      const updated = await adminWorkouts.dayExercises(dayId).catch(() => null);
      if (updated) setExercises(prev => ({ ...prev, [dayId]: normalizeExs(updated) }));
    } else {
      await adminWorkouts.updateExercise(eid(ex), exForm).catch(() => {});
      setExercises(prev => ({ ...prev, [dayId]: (prev[dayId] ?? []).map(e => eid(e) === eid(ex) ? { ...e, ...exForm } : e) }));
    }
    setSaving(false); setExModal(null);
  };

  const deleteEx = async (dayId, exId) => {
    if (!confirm('Excluir exercício?')) return;
    await adminWorkouts.deleteExercise(exId).catch(() => {});
    setExercises(prev => ({ ...prev, [dayId]: (prev[dayId] ?? []).filter(e => eid(e) !== exId) }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setPlanForm(emptyPlan); setPlanModal('new'); }}
          className="flex items-center gap-2 bg-lime-green text-black font-bold px-4 py-2.5 text-sm uppercase hover:bg-neon-green transition-colors">
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
      ) : plans.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Nenhum plano criado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((plan, pi) => (
            <div key={pid(plan) ?? pi} className="border border-dark-border bg-dark-card overflow-hidden">

              {/* Cabeçalho do plano */}
              <div className="flex items-center justify-between px-4 py-3">
                <button onClick={() => togglePlan(pid(plan))} className="flex items-center gap-3 flex-1 text-left min-w-0">
                  {expanded === pid(plan)
                    ? <ChevronDown size={16} className="text-lime-green shrink-0" />
                    : <ChevronRight size={16} className="text-gray-500 shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{plan.name}</p>
                    {plan.description && <p className="text-gray-500 text-xs truncate">{plan.description}</p>}
                  </div>
                  {plan.goal && <span className="text-[10px] text-gray-500 border border-dark-border px-2 py-0.5 ml-2 shrink-0">{plan.goal}</span>}
                  {plan.user_name && <span className="text-[10px] text-lime-green ml-2 shrink-0">{plan.user_name}</span>}
                </button>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => { setPlanForm({ name: plan.name, description: plan.description ?? '', goal: plan.goal ?? '' }); setPlanModal(plan); }}
                    className="p-1.5 text-gray-500 hover:text-lime-green transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => deletePlan(pid(plan))}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Dias do plano */}
              {expanded === pid(plan) && (
                <div className="border-t border-dark-border bg-black/30 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Dias</p>
                    <button onClick={() => { setDayForm(emptyDay); setDayModal({ planId: pid(plan) }); }}
                      className="flex items-center gap-1 text-xs text-lime-green border border-lime-green/30 px-2.5 py-1 hover:bg-lime-green/10 transition-colors">
                      <Plus size={12} /> Adicionar Dia
                    </button>
                  </div>

                  {loadingDays[pid(plan)] && <p className="text-gray-600 text-xs animate-pulse">Carregando dias...</p>}

                  {(days[pid(plan)] ?? []).map((day, di) => (
                    <div key={did(day) ?? di} className="border border-dark-border bg-dark-card overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <button onClick={() => loadExercises(did(day))} className="flex items-center gap-2 flex-1 text-left min-w-0">
                          <span className="text-[10px] font-bold text-gray-400 border border-dark-border px-1.5 py-0.5 uppercase shrink-0">
                            {day.day_of_week ?? day.week_day ?? '—'}
                          </span>
                          <span className="text-white text-sm truncate">{day.name}</span>
                          {day.is_rest && <span className="text-blue-400 text-[10px] shrink-0">Descanso</span>}
                          {day.duration_min > 0 && <span className="text-gray-600 text-xs shrink-0">{day.duration_min}min</span>}
                        </button>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => { loadExercises(did(day)); setExForm(emptyEx); setExModal({ dayId: did(day) }); }}
                            className="p-1 text-gray-600 hover:text-lime-green transition-colors" title="Adicionar exercício">
                            <Plus size={13} />
                          </button>
                          <button onClick={() => { setDayForm({ name: day.name, day_of_week: day.day_of_week ?? day.week_day ?? 'SEG', duration_min: day.duration_min ?? 60, is_rest: day.is_rest ?? false }); setDayModal({ planId: pid(plan), day }); }}
                            className="p-1 text-gray-600 hover:text-lime-green transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => deleteDay(pid(plan), did(day))}
                            className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>

                      {/* Exercícios */}
                      {loadingExs[did(day)] && (
                        <p className="text-gray-600 text-xs px-3 pb-2 animate-pulse">Carregando exercícios...</p>
                      )}
                      {exercises[did(day)] && (
                        <div className="border-t border-dark-border px-3 pb-2 pt-1 space-y-1">
                          {exercises[did(day)].length === 0 && (
                            <p className="text-gray-700 text-xs py-1">Nenhum exercício. Clique em + para adicionar.</p>
                          )}
                          {exercises[did(day)].map((ex, ei) => (
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
                                <button onClick={() => { setExForm({ name: ex.name, sets: ex.sets ?? 3, reps: ex.reps ?? '12', rest_seconds: ex.rest_seconds ?? 60, muscle_group: ex.muscle_group ?? 'Peito', video_url: ex.video_url ?? '', notes: ex.notes ?? '' }); setExModal({ dayId: did(day), ex }); }}
                                  className="p-1 text-gray-600 hover:text-lime-green transition-colors"><Pencil size={12} /></button>
                                <button onClick={() => deleteEx(did(day), eid(ex))}
                                  className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {!loadingDays[pid(plan)] && (days[pid(plan)] ?? []).length === 0 && (
                    <p className="text-gray-700 text-xs">Nenhum dia configurado.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Plano */}
      {planModal !== null && (
        <Modal title={planModal === 'new' ? 'Novo Plano' : 'Editar Plano'} onClose={() => setPlanModal(null)}>
          <Field label="Nome do plano">
            <input className={inp} value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} placeholder="Ex: Hipertrofia - Julho" />
          </Field>
          <Field label="Objetivo">
            <input className={inp} value={planForm.goal} onChange={e => setPlanForm({ ...planForm, goal: e.target.value })} placeholder="Ex: Hipertrofia" />
          </Field>
          <Field label="Descrição">
            <textarea rows={2} className={`${inp} resize-none`} value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} />
          </Field>
          <button onClick={savePlan} disabled={saving || !planForm.name}
            className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Plano'}
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
          <Field label="Grupo muscular">
            <select className={inp} value={exForm.muscle_group} onChange={e => setExForm({ ...exForm, muscle_group: e.target.value })}>
              {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
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
          <Field label="URL do vídeo (opcional)">
            <input className={inp} value={exForm.video_url} onChange={e => setExForm({ ...exForm, video_url: e.target.value })} placeholder="https://youtube.com/..." />
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
    </div>
  );
}
