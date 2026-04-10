import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, ChevronDown, ChevronRight, Salad } from 'lucide-react';
import { adminNutrition } from '../services/adminApi';

const MEAL_ICONS = { 'Café da manhã': '☕', 'Lanche da manhã': '🍎', 'Almoço': '🍽️', 'Lanche da tarde': '🥪', 'Jantar': '🌙', 'Ceia': '🌛', 'Pré-treino': '⚡', 'Pós-treino': '💪' };

const emptyPlan = { name: '', user_id: '', nutritionist_id: '', goal_calories: '', goal_protein_g: '', goal_carbs_g: '', goal_fat_g: '', water_goal_ml: 3000, valid_from: '', valid_until: '', active: true };
const emptyMeal = { name: '', time_label: '12:00' };
const emptyItem = { name: '', quantity_g: '', calories: '', protein_g: '', carbs_g: '', fat_g: '' };

const inp = "w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-purple-400 transition-colors";

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
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState(null);
  const [meals, setMeals]         = useState({});   // planId → meals[]
  const [items, setItems]         = useState({});   // mealId → items[]

  const [planModal, setPlanModal] = useState(null); // null | 'new' | plan obj
  const [mealModal, setMealModal] = useState(null); // null | { planId } | { planId, meal }
  const [itemModal, setItemModal] = useState(null); // null | { mealId } | { mealId, item }
  const [planForm, setPlanForm]   = useState(emptyPlan);
  const [mealForm, setMealForm]   = useState(emptyMeal);
  const [itemForm, setItemForm]   = useState(emptyItem);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    adminNutrition.plans()
      .then(d => setPlans(Array.isArray(d) ? d : (d?.plans ?? [])))
      .finally(() => setLoading(false));
  }, []);

  const togglePlan = async (planId) => {
    if (expanded === planId) { setExpanded(null); return; }
    setExpanded(planId);
    if (!meals[planId]) {
      const d = await adminNutrition.planMeals(planId).catch(() => ({}));
      const raw = Array.isArray(d) ? d : (d?.meals ?? []);
      setMeals(prev => ({ ...prev, [planId]: raw.map(m => ({ ...m, name: m.name ?? m.meal_type })) }));
    }
  };

  // ── Plano ──
  const savePlan = async () => {
    setSaving(true);
    const body = {
      ...planForm,
      user_id: Number(planForm.user_id),
      nutritionist_id: Number(planForm.nutritionist_id),
      goal_calories: Number(planForm.goal_calories),
      goal_protein_g: Number(planForm.goal_protein_g),
      goal_carbs_g: Number(planForm.goal_carbs_g),
      goal_fat_g: Number(planForm.goal_fat_g),
      water_goal_ml: Number(planForm.water_goal_ml),
    };
    if (planModal === 'new') {
      const res = await adminNutrition.createPlan(body).catch(() => null);
      if (res?.id) setPlans(prev => [{ ...body, id: res.id }, ...prev]);
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
    const payload = { meal_type: mealForm.name, meal_time: mealForm.time_label };
    if (!meal) {
      const res = await adminNutrition.createMeal(planId, payload).catch(() => null);
      if (res?.meal_id) setMeals(prev => ({ ...prev, [planId]: [...(prev[planId] ?? []), { ...mealForm, id: res.meal_id }] }));
    } else {
      await adminNutrition.updateMeal(meal.id, payload).catch(() => {});
      setMeals(prev => ({ ...prev, [planId]: (prev[planId] ?? []).map(m => m.id === meal.id ? { ...m, ...mealForm } : m) }));
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
      ...itemForm,
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
      <div className="flex justify-end">
        <button onClick={() => { setPlanForm(emptyPlan); setPlanModal('new'); }}
          className="flex items-center gap-2 bg-purple-400 text-black font-bold px-4 py-2.5 text-sm uppercase hover:bg-purple-300 transition-colors">
          <Plus size={16} /> Novo Plano
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
      ) : plans.length === 0 ? (
        <div className="text-center py-12">
          <Salad size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Nenhum plano nutricional criado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map(plan => (
            <div key={plan.id} className="border border-dark-border bg-dark-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <button onClick={() => togglePlan(plan.id)} className="flex items-center gap-3 flex-1 text-left">
                  {expanded === plan.id ? <ChevronDown size={16} className="text-purple-400" /> : <ChevronRight size={16} className="text-gray-500" />}
                  <div>
                    <p className="text-white font-semibold text-sm">{plan.name}</p>
                    <div className="flex gap-3 mt-0.5 flex-wrap">
                      {plan.user_name          && <span className="text-[10px] text-lime-green">👤 {plan.user_name}</span>}
                      {plan.nutritionist_name  && <span className="text-[10px] text-blue-400">🥗 {plan.nutritionist_name}</span>}
                      {plan.goal_calories      && <span className="text-[10px] text-orange-400">{plan.goal_calories} kcal</span>}
                      {plan.goal_protein_g     && <span className="text-[10px] text-red-400">{plan.goal_protein_g}g prot</span>}
                      {plan.water_goal_ml      && <span className="text-[10px] text-blue-400">{plan.water_goal_ml / 1000}L água</span>}
                      {plan.active === false   && <span className="text-[10px] text-gray-600 border border-gray-700 px-1">Inativo</span>}
                    </div>
                  </div>
                </button>
                <div className="flex gap-1">
                  <button onClick={() => { setPlanForm({ name: plan.name, user_id: plan.user_id ?? '', nutritionist_id: plan.nutritionist_id ?? '', goal_calories: plan.goal_calories ?? '', goal_protein_g: plan.goal_protein_g ?? '', goal_carbs_g: plan.goal_carbs_g ?? '', goal_fat_g: plan.goal_fat_g ?? '', water_goal_ml: plan.water_goal_ml ?? 3000, valid_from: plan.valid_from ? plan.valid_from.split('T')[0] : '', valid_until: plan.valid_until ? plan.valid_until.split('T')[0] : '', active: plan.active ?? true }); setPlanModal(plan); }}
                    className="p-1.5 text-gray-500 hover:text-purple-400 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => deletePlan(plan.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              {expanded === plan.id && (
                <div className="border-t border-dark-border bg-black/30 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Refeições</p>
                    <button onClick={() => { setMealForm(emptyMeal); setMealModal({ planId: plan.id }); }}
                      className="flex items-center gap-1 text-xs text-purple-400 border border-purple-400/30 px-2.5 py-1 hover:bg-purple-400/10 transition-colors">
                      <Plus size={12} /> Adicionar Refeição
                    </button>
                  </div>

                  {(meals[plan.id] ?? []).map(meal => (
                    <div key={meal.id} className="border border-dark-border bg-dark-card overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <button onClick={() => loadItems(meal.id)} className="flex items-center gap-2 flex-1 text-left">
                          <span className="text-lg">{MEAL_ICONS[meal.name] ?? '🍽️'}</span>
                          <div>
                            <p className="text-white text-sm">{meal.name}</p>
                            <span className="text-gray-500 text-[10px]">{meal.time_label}</span>
                          </div>
                        </button>
                        <div className="flex gap-1">
                          <button onClick={() => { loadItems(meal.id); setItemForm(emptyItem); setItemModal({ mealId: meal.id }); }}
                            className="p-1 text-gray-600 hover:text-purple-400 transition-colors" title="Adicionar alimento"><Plus size={13} /></button>
                          <button onClick={() => { setMealForm({ name: meal.name, time_label: meal.time_label }); setMealModal({ planId: plan.id, meal }); }}
                            className="p-1 text-gray-600 hover:text-purple-400 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => deleteMeal(plan.id, meal.id)}
                            className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </div>
                      {items[meal.id] && (
                        <div className="border-t border-dark-border px-3 pb-2 pt-1 space-y-1">
                          {items[meal.id].map(it => (
                            <div key={it.id} className="flex items-center justify-between py-1.5 border-b border-dark-border/50 last:border-0">
                              <div>
                                <span className="text-white text-xs font-medium">{it.name}</span>
                                <span className="text-gray-500 text-[10px] ml-2">{it.quantity_g}g · {it.calories} kcal</span>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => { setItemForm({ name: it.name, quantity_g: it.quantity_g ?? '', calories: it.calories ?? '', protein_g: it.protein_g ?? '', carbs_g: it.carbs_g ?? '', fat_g: it.fat_g ?? '' }); setItemModal({ mealId: meal.id, item: it }); }}
                                  className="p-1 text-gray-600 hover:text-purple-400 transition-colors"><Pencil size={12} /></button>
                                <button onClick={() => deleteItem(meal.id, it.id)}
                                  className="p-1 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                              </div>
                            </div>
                          ))}
                          {items[meal.id].length === 0 && <p className="text-gray-700 text-xs py-1">Nenhum alimento. Clique em + para adicionar.</p>}
                        </div>
                      )}
                    </div>
                  ))}
                  {(meals[plan.id] ?? []).length === 0 && (
                    <p className="text-gray-700 text-xs">Nenhuma refeição configurada.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Plano */}
      {planModal !== null && (
        <Modal title={planModal === 'new' ? 'Novo Plano Nutricional' : 'Editar Plano'} onClose={() => setPlanModal(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ID do Usuário (aluno)">
              <input type="number" className={inp} value={planForm.user_id} onChange={e => setPlanForm({ ...planForm, user_id: e.target.value })} placeholder="Ex: 42" />
            </Field>
            <Field label="ID do Nutricionista">
              <input type="number" className={inp} value={planForm.nutritionist_id} onChange={e => setPlanForm({ ...planForm, nutritionist_id: e.target.value })} placeholder="Ex: 2" />
            </Field>
          </div>
          <Field label="Nome do plano">
            <input className={inp} value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} placeholder="Ex: Plano Hipertrofia" />
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
            <Field label="Ativo?">
              <button onClick={() => setPlanForm({ ...planForm, active: !planForm.active })}
                className={`w-full py-2.5 text-sm font-bold border transition-colors ${planForm.active ? 'border-purple-400 text-purple-400' : 'border-dark-border text-gray-600'}`}>
                {planForm.active ? '✓ Sim' : 'Não'}
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
          <button onClick={savePlan} disabled={saving || !planForm.name || !planForm.user_id || !planForm.nutritionist_id}
            className="w-full flex items-center justify-center gap-2 bg-purple-400 text-black font-bold py-3 uppercase text-sm hover:bg-purple-300 transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Plano'}
          </button>
        </Modal>
      )}

      {/* Modal Refeição */}
      {mealModal !== null && (
        <Modal title={mealModal.meal ? 'Editar Refeição' : 'Nova Refeição'} onClose={() => setMealModal(null)}>
          <Field label="Nome da refeição">
            <input className={inp} value={mealForm.name} onChange={e => setMealForm({ ...mealForm, name: e.target.value })} placeholder="Ex: Café da Manhã" />
          </Field>
          <Field label="Horário">
            <input type="time" className={inp} value={mealForm.time_label} onChange={e => setMealForm({ ...mealForm, time_label: e.target.value })} />
          </Field>
          <button onClick={saveMeal} disabled={saving || !mealForm.name}
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
