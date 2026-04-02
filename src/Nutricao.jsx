import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Salad, ChevronDown, ChevronUp, MessageSquare, Clock, Flame, Beef, Wheat, Droplets } from 'lucide-react';

// Mock — substituir por dados reais da API
const MOCK_NUTRITIONIST = {
  name: 'Dra. Ana Paula',
  crn: 'CRN-3 12345',
  note: 'Olá! Lembre-se de beber pelo menos 3L de água hoje. Ajustei sua pré-treino para incluir mais carboidratos — você vai sentir mais energia no treino de pernas. Qualquer dúvida, me chame! 💚',
  updatedAt: 'Hoje, 08:30',
};

const MOCK_PLAN = [
  {
    id: 1,
    type: 'Café da Manhã',
    time: '07:00',
    icon: '🌅',
    calories: 480,
    items: [
      { food: 'Ovos mexidos', qty: '3 unidades', cal: 210, protein: 18, carbs: 2, fat: 15 },
      { food: 'Pão integral', qty: '2 fatias', cal: 140, protein: 6, carbs: 26, fat: 2 },
      { food: 'Banana', qty: '1 unidade', cal: 90, protein: 1, carbs: 23, fat: 0 },
      { food: 'Café preto', qty: '200ml', cal: 5, protein: 0, carbs: 1, fat: 0 },
    ],
  },
  {
    id: 2,
    type: 'Lanche da Manhã',
    time: '10:00',
    icon: '🍎',
    calories: 220,
    items: [
      { food: 'Iogurte grego', qty: '170g', cal: 130, protein: 17, carbs: 6, fat: 4 },
      { food: 'Granola', qty: '30g', cal: 90, protein: 2, carbs: 16, fat: 3 },
    ],
  },
  {
    id: 3,
    type: 'Almoço',
    time: '12:30',
    icon: '🍽️',
    calories: 680,
    items: [
      { food: 'Frango grelhado', qty: '200g', cal: 280, protein: 52, carbs: 0, fat: 6 },
      { food: 'Arroz integral', qty: '150g cozido', cal: 165, protein: 4, carbs: 35, fat: 1 },
      { food: 'Feijão', qty: '100g cozido', cal: 110, protein: 7, carbs: 20, fat: 0 },
      { food: 'Salada verde', qty: 'À vontade', cal: 30, protein: 2, carbs: 5, fat: 0 },
      { food: 'Azeite', qty: '1 colher', cal: 90, protein: 0, carbs: 0, fat: 10 },
    ],
  },
  {
    id: 4,
    type: 'Pré-Treino',
    time: '15:30',
    icon: '⚡',
    calories: 350,
    highlight: true,
    items: [
      { food: 'Batata doce', qty: '150g cozida', cal: 130, protein: 2, carbs: 30, fat: 0 },
      { food: 'Peito de frango', qty: '120g', cal: 168, protein: 31, carbs: 0, fat: 4 },
      { food: 'Banana', qty: '1 unidade', cal: 90, protein: 1, carbs: 23, fat: 0 },
    ],
  },
  {
    id: 5,
    type: 'Pós-Treino',
    time: '18:00',
    icon: '💪',
    calories: 420,
    highlight: true,
    items: [
      { food: 'Whey Protein', qty: '40g (1 scoop)', cal: 160, protein: 30, carbs: 6, fat: 3 },
      { food: 'Arroz branco', qty: '100g cozido', cal: 130, protein: 3, carbs: 28, fat: 0 },
      { food: 'Ovo cozido', qty: '2 unidades', cal: 140, protein: 12, carbs: 1, fat: 10 },
    ],
  },
  {
    id: 6,
    type: 'Jantar',
    time: '20:00',
    icon: '🌙',
    calories: 520,
    items: [
      { food: 'Salmão grelhado', qty: '180g', cal: 300, protein: 36, carbs: 0, fat: 16 },
      { food: 'Batata doce', qty: '100g', cal: 86, protein: 2, carbs: 20, fat: 0 },
      { food: 'Brócolis', qty: '150g', cal: 50, protein: 4, carbs: 10, fat: 0 },
      { food: 'Azeite', qty: '1 colher', cal: 90, protein: 0, carbs: 0, fat: 10 },
    ],
  },
];

const TOTAL_MACROS = {
  calories: MOCK_PLAN.reduce((s, m) => s + m.calories, 0),
  protein: MOCK_PLAN.flatMap(m => m.items).reduce((s, i) => s + i.protein, 0),
  carbs: MOCK_PLAN.flatMap(m => m.items).reduce((s, i) => s + i.carbs, 0),
  fat: MOCK_PLAN.flatMap(m => m.items).reduce((s, i) => s + i.fat, 0),
};

const GOALS = { calories: 2800, protein: 180, carbs: 300, fat: 70 };

const MacroBar = ({ label, value, goal, color, icon }) => {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className={color}>{icon}</span>
          <span className="text-gray-300 text-xs font-semibold">{label}</span>
        </div>
        <span className="text-xs text-gray-400">{value}g / {goal}g</span>
      </div>
      <div className="w-full bg-dark-border h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-2 ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );
};

export default function Nutricao() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const [consumed, setConsumed] = useState({});

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);
  const toggleConsumed = (id) => setConsumed(prev => ({ ...prev, [id]: !prev[id] }));

  const consumedCals = MOCK_PLAN.filter(m => consumed[m.id]).reduce((s, m) => s + m.calories, 0);

  return (
    <div className="min-h-screen bg-dark-bg text-white font-inter">

      {/* Header */}
      <header className="bg-black border-b border-dark-border px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-purple-400 transition-colors">
          <ArrowLeft size={22} />
        </button>
        <Salad size={20} className="text-purple-400" />
        <h1 className="text-xl font-bebas uppercase tracking-wide">Plano Nutricional</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Recado da nutricionista */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-purple-400/10 border border-purple-400/40 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="bg-purple-400/20 border border-purple-400/30 p-2 flex-shrink-0">
              <MessageSquare size={18} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-purple-400 text-xs font-bold uppercase tracking-widest">{MOCK_NUTRITIONIST.name}</p>
                <p className="text-gray-600 text-[10px]">{MOCK_NUTRITIONIST.updatedAt}</p>
              </div>
              <p className="text-xs text-gray-500 mb-2">{MOCK_NUTRITIONIST.crn}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{MOCK_NUTRITIONIST.note}</p>
            </div>
          </div>
        </motion.div>

        {/* Macros do dia */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-dark-card border border-dark-border p-4 space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Macros do dia</p>
            <div className="text-right">
              <span className="text-purple-400 font-bebas text-2xl">{consumedCals}</span>
              <span className="text-gray-500 text-xs"> / {TOTAL_MACROS.calories} kcal</span>
            </div>
          </div>

          {/* Calorias totais */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Flame size={14} className="text-orange-400" />
                <span className="text-gray-300 text-xs font-semibold">Calorias</span>
              </div>
              <span className="text-xs text-gray-400">{TOTAL_MACROS.calories} / {GOALS.calories} kcal</span>
            </div>
            <div className="w-full bg-dark-border h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((TOTAL_MACROS.calories / GOALS.calories) * 100, 100)}%` }}
                transition={{ duration: 0.8 }}
                className="h-2 bg-orange-400"
              />
            </div>
          </div>

          <MacroBar label="Proteína" value={TOTAL_MACROS.protein} goal={GOALS.protein} color="text-red-400" icon={<Beef size={14} />} />
          <MacroBar label="Carboidratos" value={TOTAL_MACROS.carbs} goal={GOALS.carbs} color="text-yellow-400" icon={<Wheat size={14} />} />
          <MacroBar label="Gorduras" value={TOTAL_MACROS.fat} goal={GOALS.fat} color="text-blue-400" icon={<Droplets size={14} />} />
        </motion.div>

        {/* Refeições */}
        <div className="space-y-2">
          {MOCK_PLAN.map((meal, i) => {
            const isOpen = expanded === meal.id;
            const isDone = consumed[meal.id];

            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className={`border overflow-hidden transition-all
                  ${meal.highlight
                    ? isDone ? 'border-purple-400/40 bg-purple-400/5' : 'border-purple-400/60 bg-purple-400/5'
                    : isDone ? 'border-lime-green/30 bg-lime-green/5' : 'border-dark-border bg-dark-card'
                  }`}
              >
                {/* Cabeçalho da refeição */}
                <button
                  onClick={() => toggleExpand(meal.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meal.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{meal.type}</p>
                        {meal.highlight && (
                          <span className="bg-purple-400/20 text-purple-400 text-[10px] font-bold px-2 py-0.5 uppercase border border-purple-400/30">
                            Foco
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={10} /> {meal.time}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Flame size={10} /> {meal.calories} kcal
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleConsumed(meal.id); }}
                      className={`text-xs font-bold px-3 py-1 border transition-all
                        ${isDone
                          ? 'bg-lime-green text-black border-lime-green'
                          : 'border-dark-border text-gray-500 hover:border-lime-green/50'
                        }`}
                    >
                      {isDone ? '✓' : '○'}
                    </button>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Itens da refeição */}
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
                        {/* Header da tabela */}
                        <div className="grid grid-cols-5 gap-2 mb-2 px-1">
                          <span className="col-span-2 text-[10px] text-gray-600 uppercase">Alimento</span>
                          <span className="text-[10px] text-gray-600 uppercase text-center">Prot.</span>
                          <span className="text-[10px] text-gray-600 uppercase text-center">Carb.</span>
                          <span className="text-[10px] text-gray-600 uppercase text-center">Gord.</span>
                        </div>
                        <div className="space-y-2">
                          {meal.items.map((item, j) => (
                            <div key={j} className="grid grid-cols-5 gap-2 items-center bg-black/40 px-3 py-2">
                              <div className="col-span-2">
                                <p className="text-white text-xs font-medium">{item.food}</p>
                                <p className="text-gray-600 text-[10px]">{item.qty}</p>
                              </div>
                              <span className="text-red-400 text-xs text-center font-semibold">{item.protein}g</span>
                              <span className="text-yellow-400 text-xs text-center font-semibold">{item.carbs}g</span>
                              <span className="text-blue-400 text-xs text-center font-semibold">{item.fat}g</span>
                            </div>
                          ))}
                        </div>
                        {/* Total da refeição */}
                        <div className="mt-3 flex justify-between items-center border-t border-dark-border pt-2">
                          <span className="text-gray-500 text-xs uppercase tracking-wide">Total</span>
                          <div className="flex gap-4 text-xs">
                            <span className="text-red-400 font-bold">{meal.items.reduce((s, i) => s + i.protein, 0)}g prot</span>
                            <span className="text-yellow-400 font-bold">{meal.items.reduce((s, i) => s + i.carbs, 0)}g carb</span>
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

        {/* Dica de hidratação */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-blue-400/10 border border-blue-400/20 p-4 flex items-center gap-3"
        >
          <Droplets size={24} className="text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Hidratação</p>
            <p className="text-gray-300 text-sm mt-0.5">Meta: <span className="text-blue-400 font-bold">3 litros</span> de água por dia</p>
          </div>
        </motion.div>

        <p className="text-center text-gray-700 text-xs pb-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-lime-green transition-colors">
            ← Voltar ao Dashboard
          </button>
        </p>
      </main>
    </div>
  );
}
