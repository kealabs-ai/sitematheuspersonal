import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronRight, Salad, Users } from 'lucide-react';
import { adminNutrition, adminUsers } from '../services/adminApi';

const MEAL_TYPES = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Pré-treino', 'Jantar', 'Pós-treino', 'Ceia'];
const MEAL_ICONS = { 'Café da manhã': '☕', 'Lanche da manhã': '🍎', 'Almoço': '🍽️', 'Lanche da tarde': '🥪', 'Jantar': '🌙', 'Ceia': '🌛', 'Pré-treino': '⚡', 'Pós-treino': '💪' };

const emptyPlan = { name: '', user_id: '', nutritionist_id: 1, goal_calories: '', goal_protein_g: '', goal_carbs_g: '', goal_fat_g: '', water_goal_ml: 3000, valid_from: '', valid_until: '', active: true };
const emptyMeal = { meal_type: 'Café da manhã', meal_time: '07:00' };
const emptyItem = { name: '', quantity_g: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' };

const inp = 'w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-purple-400 transition-colors';
const sel = 'w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-purple-400 transition-colors appearance-none';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-lg font-bebas uppercase text-purple-400">{title}</h3>
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

export default function AdminNutricao() {
  const [plans, setPlans]         = useState([]);
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [expanded, setExpanded]   = useState(null);
  const [meals, setMeals]         = useState({});
  const [items, setItems]         = useState({});

  const [planModal, setPlanModal] = useState(null);
  const [mealModal, setMealModal] = useState(null);
  const [itemModal, setItemModal] = useState(null);
  const [planForm, setPlanForm]   = useState(emptyPlan);
  const [mealForm, setMealForm]   = useState(emptyMeal);
  const [itemForm, setItemForm]   = useState(emptyItem);
  const [saving, setSaving]       = useState(false);

  const loadPlans = () => {
    setLoading(true);
    setLoadError(null);
    Promise.all([
      adminNutrition.plans(),
      adminUsers.listAll(),
    ]).then(([plansData, usersData]) => {
      // Aceita qualquer envelope: { plans } | { data } | { results } | array direto
      const p =
        Array.isArray(plansData) ? plansData :
        Array.isArray(plansData?.plans)   ? plansData.plans   :
        Array.isArray(plansData?.data)    ? plansData.data    :
        Array.isArray(plansData?.results) ? plansData.results :
        null;
      if (p === null) {
        setLoadError(`Resposta inesperada: ${JSON.stringify(plansData).slice(0, 200)}`);
        setPlans([]);
      } else {
        setPlans(p);
      }
      setStudents(Array.isArray(usersData) ? usersData : (usersData?.users ?? []));
    }).catch(err => {
      setLoadError(`Erro de rede: ${err?.message ?? String(err)}`);
    }).finally(() => setLoading(false));
  };

  // Força reload toda vez que o componente monta (troca de aba no admin)
  useEffect(() => { loadPlans(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlan = async (planId) => {
    if (expanded === planId) { setExpanded(null); return; }
    setExpanded(planId);
    if (!meals[planId]) {
      const d = await adminNutrition.planMeals(planId).catch(() => ({}));
      const raw = Array.isArray(d) ? d : (d?.meals ?? []);
      setMeals(prev => ({ ...prev, [planId]: raw }));
    }
  };

  // ── Plano ──
  const openNewPlan = () => { setPlanForm(emptyPlan); setPlanModal('new'); };
  const openEditPlan = (plan) => {
    setPlanForm({
      name: plan.name, user_id: plan.user_id ?? '',
      nutritionist_id: plan.nutritionist_id ?? 1,
      goal_calories: plan.goal_calories ?? '', goal_protein_g: plan.goal_protein_g ?? '',
      goal_carbs_g: plan.goal_carbs_g ?? '', goal_fat_g: plan.goal_fat_g ?? '',
      water_goal_ml: plan.water_goal_ml ?? 3000,
      valid_from: plan.valid_from ? plan.valid_from.split('T')[0] : '',
      valid_until: plan.valid_until ? plan.valid_until.split('T')[0] : '',
      active: plan.active ?? true,
    });
    setPlanModal(plan);
  };

  const savePlan = async () => {
    setSaving(true);
    const body = {
      user_id:        Number(planForm.user_id),
      nutritionist_id: Number(planForm.nutritionist_id) || 1,
      name:           planForm.name,
      goal_calories:  Number(planForm.goal_calories)  || 0,
      goal_protein_g: Number(planForm.goal_protein_g) || 0,
      goal_carbs_g:   Number(planForm.goal_carbs_g)   || 0,
      goal_fat_g:     Number(planForm.goal_fat_g)     || 0,
      water_goal_ml:  Number(planForm.water_goal_ml)  || 3000,
      valid_from:     planForm.valid_from  || null,
      valid_until:    planForm.valid_until || null,
      active:         planForm.active,
    };
    if (planModal === 'new') {
      await adminNutrition.createPlan(body).catch(() => null);
      const updated = await adminNutrition.plans().catch(() => null);
      if (updated) {
        const p = updated?.plans ?? updated?.data ?? updated?.results ?? (Array.isArray(updated) ? updated : []);
        setPlans(p);
      }
    } else {
      await adminNutrition.updatePlan(planModal.id, body).catch(() => {});
      setPlans(prev => prev.map(p => p.id === planModal.id ? { ...p, ...body } : p));
    }
    setSaving(false); setPlanModal(null);
  };

  const deletePlan = async (id) => {
    if (!confirm('Excluir este plano nutricional?')) return;
    await adminNutrition.deletePlan(id).catch(() => {});
    setPlans(prev => prev.filter(p => p.id !== id));
    if (expanded === id) setExpanded(null);
  };

  // ── Refeição ──
  const saveMeal = async () => {
    setSaving(true);
    const { planId, meal } = mealModal;
    const payload = { meal_type: mealForm.meal_type, meal_time: mealForm.meal_time, icon: MEAL_ICONS[mealForm.meal_type] ?? '🍽️' };
    if (!meal) {
      const res = await adminNutrition.createMeal(planId, payload).catch(() => null);
      if (res?.meal_id) setMeals(prev => ({ ...prev, [planId]: [...(prev[planId] ?? []), { ...payload, id: res.meal_id }] }));
    } else {
      await adminNutrition.updateMeal(meal.id, payload).catch(() => {});
      setMeals(prev => ({ ...prev, [planId]: (prev[planId] ?? []).map(m => m.id === meal.id ? { ...m, ...payload } : m) }));
    }
    setSaving(false); setMealModal(null);
  };

  const deleteMeal = async (planId, mealId) => {
    if (!confirm('Excluir esta refeição?')) return;
    await adminNutrition.deleteMeal(mealId).catch(() => {});
    setMeals(prev => ({ ...prev, [planId]: (prev[planId] ?? []).filter(m => m.id !== mealId) }));
  };

  const loadItems = async (mealId) => {
    if (items[mealId] !== undefined) return;
    const d = await adminNutrition.mealItems(mealId).catch(() => ({}));
    setItems(prev => ({ ...prev, [mealId]: Array.isArray(d) ? d : (d?.items ?? []) }));
  };

  // ── Itens ──
  const saveItem = async () => {
    setSaving(true);
    const { mealId, item } = itemModal;
    const body = {
      name:       itemForm.name,
      quantity_g: itemForm.quantity_g !== '' ? Number(itemForm.quantity_g) : null,
      calories:   itemForm.calories   !== '' ? Number(itemForm.calories)   : null,
      protein_g:  itemForm.protein_g  !== '' ? Number(itemForm.protein_g)  : null,
      carbs_g:    itemForm.carbs_g    !== '' ? Number(itemForm.carbs_g)    : null,
      fat_g:      itemForm.fat_g      !== '' ? Number(itemForm.fat_g)      : null,
    };
    if (!item) {
      const res = await adminNutrition.createItem(mealId, body).catch(() => null);
      if (res?.item_id) setItems(prev => ({ ...prev, [mealId]: [...(prev[mealId] ?? []), { ...body, id: res.item_id }] }));
    } else {
      await adminNutrition.updateItem(item.id, body).catch(() => {});
      setItems(prev => ({ ...prev, [mealId]: (prev[mealId] ?? []).map(it => it.id === item.id ? { ...it, ...body } : it) }));
    }
    setSaving(false); setItemModal(null);
  };

  const deleteItem = async (mealId, itemId) => {
    if (!confirm('Excluir este alimento?')) return;
    await adminNutrition.deleteItem(itemId).catch(() => {});
    setItems(prev => ({ ...prev, [mealId]: (prev[mealId] ?? []).filter(it => it.id !== itemId) }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs">{plans.length} plano{plans.length !== 1 ? 's' : ''} cadastrado{plans.length !== 1 ? 's' : ''}</p>
        <button onClick={openNewPlan}
          className="flex items-center gap-2 bg-purple-400 text-black font-bold px-4 py-2.5 text-sm uppercase hover:bg-purple-300 transition-colors">
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando planos...</p>
      ) : loadError ? (
        <div className="border border-red-500/30 bg-red-500/5 p-4 space-y-2">
          <p className="text-red-400 text-xs font-bold uppercase tracking-wide">Erro ao carregar planos</p>
          <p className="text-red-300/70 text-xs font-mono break-all">{loadError}</p>
          <button onClick={loadPlans} className="text-xs text-red-400 border border-red-500/30 px-3 py-1.5 hover:bg-red-500/10 transition-colors">
            ↺ Tentar novamente
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 border border-dark-border">
          <Salad size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Nenhum plano nutricional criado.</p>
          <button onClick={openNewPlan} className="mt-4 text-purple-400 text-sm hover:text-purple-300">+ Criar primeiro plano</button>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map(plan => (
            <div key={plan.id} className="border border-dark-border bg-dark-card overflow-hidden">

              {/* Header do plano */}
              <div className="flex items-center justify-between px-4 py-3">
                <button onClick={() => togglePlan(plan.id)} className="flex items-center gap-3 flex-1 text-left min-w-0">
                  {expanded === plan.id
                    ? <ChevronDown size={16} className="text-purple-400 shrink-0" />
                    : <ChevronRight size={16} className="text-gray-500 shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{plan.name}</p>
                      {plan.active
                        ? <span className="text-[10px] bg-purple-400/10 text-purple-400 border border-purple-400/30 px-1.5 py-0.5">Ativo</span>
                        : <span className="text-[10px] bg-gray-800 text-gray-500 border border-gray-700 px-1.5 py-0.5">Inativo</span>}
                    </div>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      {plan.user_name         && <span className="text-[10px] text-lime-green flex items-center gap-1"><Users size={9} />{plan.user_name}</span>}
                      {plan.nutritionist_name && <span className="text-[10px] text-blue-400">🥗 {plan.nutritionist_name}</span>}
                      {plan.crn               && <span className="text-[10px] text-gray-500">{plan.crn}</span>}
                      {plan.goal_calories     && <span className="text-[10px] text-orange-400">🔥 {plan.goal_calories} kcal</span>}
                      {plan.goal_protein_g    && <span className="text-[10px] text-red-400">🥩 {plan.goal_protein_g}g prot</span>}
                      {plan.goal_carbs_g      && <span className="text-[10px] text-yellow-500">🌾 {plan.goal_carbs_g}g carb</span>}
                      {plan.goal_fat_g        && <span className="text-[10px] text-gray-400">🫒 {plan.goal_fat_g}g gord</span>}
                      {plan.water_goal_ml     && <span className="text-[10px] text-blue-400">💧 {plan.water_goal_ml / 1000}L</span>}
                      {plan.valid_from        && <span className="text-[10px] text-gray-500">📅 {plan.valid_from} → {plan.valid_until ?? '...'}</span>}
                    </div>
                  </div>
                </button>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => openEditPlan(plan)} className="p-1.5 text-gray-500 hover:text-purple-400 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Refeições */}
              {expanded === plan.id && (
                <div className="border-t border-dark-border bg-black/30 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Refeições</p>
                    <button onClick={() => { setMealForm(emptyMeal); setMealModal({ planId: plan.id }); }}
                      className="flex items-center gap-1 text-xs text-purple-400 border border-purple-400/30 px-2.5 py-1 hover:bg-purple-400/10 transition-colors">
                      <Plus size={12} /> Adicionar Refeição
                    </button>
                  </div>

                  {(meals[plan.id] ?? []).length === 0 && (
                    <p className="text-gray-700 text-xs py-2">Nenhuma refeição configurada.</p>
                  )}

                  {(meals[plan.id] ?? []).map(meal => {
                    const mealName = meal.meal_type ?? meal.name ?? '—';
                    const mealTime = meal.meal_time ?? meal.time_label ?? '';
                    return (
                      <div key={meal.id} className="border border-dark-border bg-dark-card overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2.5">
                          <button onClick={() => loadItems(meal.id)} className="flex items-center gap-2 flex-1 text-left">
                            <span className="text-lg">{MEAL_ICONS[mealName] ?? '🍽️'}</span>
                            <div>
                              <p className="text-white text-sm">{mealName}</p>
                              {mealTime && <span className="text-gray-500 text-[10px]">{mealTime}</span>}
                            </div>
                          </button>
                          <div className="flex gap-1">
                            <button onClick={() => { loadItems(meal.id); setItemForm(emptyItem); setItemModal({ mealId: meal.id }); }}
                              className="p-1 text-gray-600 hover:text-purple-400 transition-colors" title="Adicionar alimento"><Plus size={13} /></button>
                            <button onClick={() => { setMealForm({ meal_type: mealName, meal_time: mealTime }); setMealModal({ planId: plan.id, meal }); }}
                              className="p-1 text-gray-600 hover:text-purple-400 transition-colors"><Pencil size={13} /></button>
                            <button onClick={() => deleteMeal(plan.id, meal.id)}
                              className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </div>

                        {/* Itens da refeição */}
                        {items[meal.id] && (
                          <div className="border-t border-dark-border px-3 pb-2 pt-1">
                            {items[meal.id].length === 0 && (
                              <p className="text-gray-700 text-xs py-1">Nenhum alimento. Clique em + para adicionar.</p>
                            )}
                            {items[meal.id].map(it => (
                              <div key={it.id} className="flex items-center justify-between py-1.5 border-b border-dark-border/40 last:border-0">
                                <div>
                                  <span className="text-white text-xs font-medium">{it.name}</span>
                                  <span className="text-gray-500 text-[10px] ml-2">
                                    {it.quantity_g ? `${it.quantity_g}g` : ''}
                                    {it.calories ? ` · ${it.calories} kcal` : ''}
                                    {it.protein_g ? ` · P:${it.protein_g}g` : ''}
                                    {it.carbs_g   ? ` · C:${it.carbs_g}g`   : ''}
                                    {it.fat_g     ? ` · G:${it.fat_g}g`     : ''}
                                  </span>
                                </div>
                                <div className="flex gap-1 shrink-0 ml-2">
                                  <button onClick={() => { setItemForm({ name: it.name, quantity_g: it.quantity_g ?? '', calories: it.calories ?? '', protein_g: it.protein_g ?? '', carbs_g: it.carbs_g ?? '', fat_g: it.fat_g ?? '' }); setItemModal({ mealId: meal.id, item: it }); }}
                                    className="p-1 text-gray-600 hover:text-purple-400 transition-colors"><Pencil size={12} /></button>
                                  <button onClick={() => deleteItem(meal.id, it.id)}
                                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Plano */}
      {planModal !== null && (
        <Modal title={planModal === 'new' ? 'Novo Plano Nutricional' : 'Editar Plano'} onClose={() => setPlanModal(null)}>
          <Field label="Aluno">
            <select className={sel} value={planForm.user_id} onChange={e => setPlanForm({ ...planForm, user_id: e.target.value })}>
              <option value="">Selecione o aluno...</option>
              {students.map(s => (
                <option key={s.id ?? s.id_user} value={s.id ?? s.id_user}>{s.name} — {s.email}</option>
              ))}
            </select>
          </Field>
          <Field label="Nome do plano">
            <input className={inp} value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} placeholder="Ex: Plano Hipertrofia - Julho" />
          </Field>
          <Field label="ID do Nutricionista">
            <input type="number" className={inp} value={planForm.nutritionist_id} onChange={e => setPlanForm({ ...planForm, nutritionist_id: e.target.value })} placeholder="1" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            {[['Meta de calorias (kcal)', 'goal_calories'], ['Proteína (g)', 'goal_protein_g'], ['Carboidratos (g)', 'goal_carbs_g'], ['Gorduras (g)', 'goal_fat_g']].map(([label, key]) => (
              <Field key={key} label={label}>
                <input type="number" className={inp} value={planForm[key]} onChange={e => setPlanForm({ ...planForm, [key]: e.target.value })} />
              </Field>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Meta de água (ml)">
              <input type="number" className={inp} value={planForm.water_goal_ml} onChange={e => setPlanForm({ ...planForm, water_goal_ml: +e.target.value })} />
            </Field>
            <Field label="Status">
              <button onClick={() => setPlanForm({ ...planForm, active: !planForm.active })}
                className={`w-full py-2.5 text-sm font-bold border transition-colors ${planForm.active ? 'border-purple-400 text-purple-400' : 'border-dark-border text-gray-600'}`}>
                {planForm.active ? '✓ Ativo' : 'Inativo'}
              </button>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Válido de">
              <input type="date" className={inp} value={planForm.valid_from} onChange={e => setPlanForm({ ...planForm, valid_from: e.target.value })} />
            </Field>
            <Field label="Válido até">
              <input type="date" className={inp} value={planForm.valid_until} onChange={e => setPlanForm({ ...planForm, valid_until: e.target.value })} />
            </Field>
          </div>
          <button onClick={savePlan} disabled={saving || !planForm.name || !planForm.user_id}
            className="w-full flex items-center justify-center gap-2 bg-purple-400 text-black font-bold py-3 uppercase text-sm hover:bg-purple-300 transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Plano'}
          </button>
        </Modal>
      )}

      {/* Modal Refeição */}
      {mealModal !== null && (
        <Modal title={mealModal.meal ? 'Editar Refeição' : 'Nova Refeição'} onClose={() => setMealModal(null)}>
          <Field label="Tipo de refeição">
            <select className={sel} value={mealForm.meal_type} onChange={e => setMealForm({ ...mealForm, meal_type: e.target.value })}>
              {MEAL_TYPES.map(t => <option key={t} value={t}>{MEAL_ICONS[t]} {t}</option>)}
            </select>
          </Field>
          <Field label="Horário">
            <input type="time" className={inp} value={mealForm.meal_time} onChange={e => setMealForm({ ...mealForm, meal_time: e.target.value })} />
          </Field>
          <button onClick={saveMeal} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-purple-400 text-black font-bold py-3 uppercase text-sm hover:bg-purple-300 transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Refeição'}
          </button>
        </Modal>
      )}

      {/* Modal Item */}
      {itemModal !== null && (
        <Modal title={itemModal.item ? 'Editar Alimento' : 'Novo Alimento'} onClose={() => setItemModal(null)}>
          <Field label="Nome do alimento">
            <input className={inp} value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Ex: Frango Grelhado" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantidade (g)">
              <input type="number" className={inp} value={itemForm.quantity_g} onChange={e => setItemForm({ ...itemForm, quantity_g: e.target.value })} />
            </Field>
            <Field label="Calorias (kcal)">
              <input type="number" className={inp} value={itemForm.calories} onChange={e => setItemForm({ ...itemForm, calories: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['Proteína (g)', 'protein_g'], ['Carboidratos (g)', 'carbs_g'], ['Gorduras (g)', 'fat_g']].map(([label, key]) => (
              <Field key={key} label={label}>
                <input type="number" className={inp} value={itemForm[key]} onChange={e => setItemForm({ ...itemForm, [key]: e.target.value })} />
              </Field>
            ))}
          </div>
          <button onClick={saveItem} disabled={saving || !itemForm.name}
            className="w-full flex items-center justify-center gap-2 bg-purple-400 text-black font-bold py-3 uppercase text-sm hover:bg-purple-300 transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Alimento'}
          </button>
        </Modal>
      )}
    </div>
  );
}
