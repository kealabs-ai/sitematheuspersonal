import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Salad, ChevronDown, ChevronUp, MessageSquare, Clock, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { nutrition as nutritionApi } from './services/alunoApi';
import { getUser } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';

export default function Nutricao() {
  useBlockBack();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [todayData, setTodayData] = useState(null);
  const [note, setNote] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      nutritionApi.plan(),
      nutritionApi.today(),
      nutritionApi.note(),
    ]).then(([planData, today, noteData]) => {
      // plan: { plan: {...} } ou { id, name, ... } ou { detail: '...' }
      const p = planData?.plan ?? (planData?.id ? planData : null);
      setPlan(p);

      // today: { meals: [...], totals: {...} } ou { data: { meals, totals } }
      const t = today?.meals ? today : (today?.data?.meals ? today.data : null);
      setTodayData(t);

      // note: { message, nutritionist, crn, updated_at }
      setNote(noteData?.message ? noteData : null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  const toggleConsumed = async (meal) => {
    const isConsumed = meal.consumed;
    if (isConsumed) {
      await nutritionApi.removeLog(meal.id).catch(() => {});
    } else {
      await nutritionApi.logMeal(meal.id, new Date().toISOString().split('T')[0]).catch(() => {});
    }
    setTodayData(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === meal.id ? { ...m, consumed: !isConsumed } : m),
    }));
  };

  const meals = todayData?.meals ?? [];
  const totals = todayData?.totals ?? {};

  const currentUser = getUser();
  if (!loading && currentUser?.plan !== 'DIAMANTE') {
    return (
      <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px]">
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <span className="text-6xl mb-4">💎</span>
          <p className="text-purple-400 font-bebas text-3xl uppercase mb-2">Exclusivo Diamante</p>
          <p className="text-gray-500 text-sm mb-6">O plano nutricional é exclusivo do Plano Diamante.<br />Faça upgrade para ter acesso.</p>
          <button
            onClick={() => navigate('/#consultoria')}
            className="bg-purple-400 text-black font-bold px-8 py-3 uppercase hover:bg-purple-300 transition-all"
          >
            Ver Plano Diamante
          </button>
        </div>
      </div>
    );
  }
  const goals = plan
    ? { calories: plan.goal_calories, protein: plan.goal_protein_g, carbs: plan.goal_carbs_g, fat: plan.goal_fat_g }
    : { calories: 2800, protein: 180, carbs: 300, fat: 70 };
  const consumedCals = meals.filter(m => m.consumed).reduce((s, m) => s + (m.calories ?? 0), 0);
  const waterGoal = plan?.water_goal_ml ?? 3000;

  const macros = [
    { label: 'Calorias', value: totals.calories_consumed ?? 0, goal: goals.calories, color: 'text-orange-400', bg: 'bg-orange-400', icon: <Flame size={14} />, unit: 'kcal' },
    { label: 'Proteína', value: totals.protein_g ?? 0, goal: goals.protein, color: 'text-red-400', bg: 'bg-red-400', icon: <Beef size={14} />, unit: 'g' },
    { label: 'Carboidratos', value: totals.carbs_g ?? 0, goal: goals.carbs, color: 'text-yellow-400', bg: 'bg-yellow-400', icon: <Wheat size={14} />, unit: 'g' },
    { label: 'Gorduras', value: totals.fat_g ?? 0, goal: goals.fat, color: 'text-blue-400', bg: 'bg-blue-400', icon: <Droplets size={14} />, unit: 'g' },
  ];

  return (
    <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-10">

      <main className="max-w-2xl md:max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {loading && <p className="text-center text-gray-600 text-xs py-8 animate-pulse">Carregando...</p>}

        {!loading && !plan && meals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Salad size={48} className="text-gray-700 mb-4" />
            <p className="text-gray-400 font-bebas text-2xl uppercase mb-2">Nenhum plano ativo</p>
            <p className="text-gray-600 text-sm">Seu plano nutricional ainda não foi configurado.<br />Entre em contato com o Matheus para começar.</p>
          </div>
        )}

        {/* Recado da nutricionista */}
        {note && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-purple-400/10 border border-purple-400/40 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="bg-purple-400/20 border border-purple-400/30 p-2 flex-shrink-0">
                <MessageSquare size={18} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">{note.nutritionist}</p>
                  <p className="text-gray-600 text-[10px]">
                    {note.updated_at ? new Date(note.updated_at).toLocaleString('pt-BR') : ''}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mb-2">{note.crn}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{note.message}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Layout desktop: macros à esquerda, refeições à direita */}
        <div className="md:grid md:grid-cols-[340px_1fr] md:gap-6 md:items-start space-y-5 md:space-y-0">
          <div className="space-y-5">
        {/* Macros do dia */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-dark-card border border-dark-border p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Macros do dia</p>
            <div className="text-right">
              <span className="text-purple-400 font-bebas text-2xl">{consumedCals}</span>
              <span className="text-gray-500 text-xs"> / {goals.calories} kcal</span>
            </div>
          </div>
          {macros.map((m, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={m.color}>{m.icon}</span>
                  <span className="text-gray-300 text-xs font-semibold">{m.label}</span>
                </div>
                <span className="text-xs text-gray-400">{m.value} / {m.goal} {m.unit}</span>
              </div>
              <div className="w-full bg-dark-border h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((m.value / m.goal) * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-2 ${m.bg}`}
                />
              </div>
            </div>
          ))}
        </motion.div>

          </div>

          {/* Refeições */}
          <div className="space-y-2">
          {meals.map((meal, i) => {
            const isOpen = expanded === meal.id;
            const isDone = meal.consumed;

            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`border overflow-hidden transition-all
                  ${meal.is_highlight
                    ? isDone ? 'border-purple-400/40 bg-purple-400/5' : 'border-purple-400/60 bg-purple-400/5'
                    : isDone ? 'border-lime-green/30 bg-lime-green/5' : 'border-dark-border bg-dark-card'
                  }`}
              >
                <button onClick={() => toggleExpand(meal.id)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meal.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{meal.meal_type}</p>
                        {meal.is_highlight && (
                          <span className="bg-purple-400/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 uppercase border border-purple-400/30">
                            Foco
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={10} /> {meal.meal_time}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Flame size={10} /> {meal.calories} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleConsumed(meal); }}
                      className={`text-xs font-bold px-3 py-1 border transition-all
                        ${isDone ? 'bg-lime-green text-black border-lime-green' : 'border-dark-border text-gray-500 hover:border-lime-green/50'}`}
                    >
                      {isDone ? '✓' : '○'}
                    </button>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-dark-border px-4 pb-4 pt-3">
                        <div className="grid grid-cols-5 gap-2 mb-2 px-1">
                          <span className="col-span-2 text-[10px] text-gray-600 uppercase">Alimento</span>
                          <span className="text-[10px] text-gray-600 uppercase text-center">Prot.</span>
                          <span className="text-[10px] text-gray-600 uppercase text-center">Carb.</span>
                          <span className="text-[10px] text-gray-600 uppercase text-center">Gord.</span>
                        </div>
                        <div className="space-y-2">
                          {(meal.items ?? []).map((item, j) => (
                            <div key={j} className="grid grid-cols-5 gap-2 items-center bg-black/40 px-3 py-2">
                              <div className="col-span-2">
                                <p className="text-white text-xs font-medium">{item.food_name ?? item.name}</p>
                                <p className="text-gray-600 text-[10px]">{item.quantity ?? (item.quantity_g ? `${item.quantity_g}g` : '')}</p>
                              </div>
                              <span className="text-red-400 text-xs text-center font-semibold">{item.protein_g ?? 0}g</span>
                              <span className="text-yellow-400 text-xs text-center font-semibold">{item.carbs_g ?? 0}g</span>
                              <span className="text-blue-400 text-xs text-center font-semibold">{item.fat_g ?? 0}g</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex justify-between items-center border-t border-dark-border pt-2">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">Total</span>
                          <div className="flex gap-4 text-xs">
                            <span className="text-red-400 font-bold">{(meal.items ?? []).reduce((s, i) => s + (i.protein_g ?? 0), 0)}g prot</span>
                            <span className="text-yellow-400 font-bold">{(meal.items ?? []).reduce((s, i) => s + (i.carbs_g ?? 0), 0)}g carb</span>
                            <span className="text-orange-400 font-bold">{meal.calories} kcal</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          </div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-blue-400/10 border border-blue-400/20 p-4 flex items-center gap-3"
        >
          <Droplets size={24} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Hidratação</p>
            <p className="text-gray-300 text-sm mt-0.5">
              Meta: <span className="text-blue-400 font-bold">{(waterGoal / 1000).toFixed(1)} litros</span> de água por dia
            </p>
          </div>
        </motion.div>

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
