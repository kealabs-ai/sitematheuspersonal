import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { users, workouts as workoutsApi } from './services/alunoApi';

// ─── Planos de treino por gênero + objetivo ───────────────────────────────────

const PLANOS = {
  male: {
    Hipertrofia: {
      name: 'Hipertrofia Masculino',
      days: [
        {
          name: 'Peito e Tríceps', day: 'SEG', duration_min: 60, status: 'upcoming',
          exercises: [
            { name: 'Supino Reto', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Peito' },
            { name: 'Supino Inclinado', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Peito' },
            { name: 'Crucifixo', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Peito' },
            { name: 'Tríceps Pulley', sets: 4, reps: '10-12', rest_seconds: 60, muscle_group: 'Tríceps' },
            { name: 'Tríceps Francês', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Tríceps' },
          ],
        },
        {
          name: 'Costas e Bíceps', day: 'TER', duration_min: 60, status: 'upcoming',
          exercises: [
            { name: 'Puxada Frontal', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Costas' },
            { name: 'Remada Curvada', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Costas' },
            { name: 'Remada Unilateral', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
            { name: 'Rosca Direta', sets: 4, reps: '10-12', rest_seconds: 60, muscle_group: 'Bíceps' },
            { name: 'Rosca Martelo', sets: 3, reps: '10-12', rest_seconds: 60, muscle_group: 'Bíceps' },
          ],
        },
        { name: 'Descanso', day: 'QUA', duration_min: 0, status: 'rest', exercises: [] },
        {
          name: 'Pernas', day: 'QUI', duration_min: 70, status: 'upcoming',
          exercises: [
            { name: 'Agachamento Livre', sets: 4, reps: '8-12', rest_seconds: 120, muscle_group: 'Quadríceps' },
            { name: 'Leg Press', sets: 4, reps: '10-15', rest_seconds: 90, muscle_group: 'Quadríceps' },
            { name: 'Cadeira Extensora', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Quadríceps' },
            { name: 'Mesa Flexora', sets: 4, reps: '10-12', rest_seconds: 75, muscle_group: 'Posterior' },
            { name: 'Panturrilha em Pé', sets: 4, reps: '15-20', rest_seconds: 45, muscle_group: 'Panturrilha' },
          ],
        },
        {
          name: 'Ombro e Trapézio', day: 'SEX', duration_min: 55, status: 'upcoming',
          exercises: [
            { name: 'Desenvolvimento com Halteres', sets: 4, reps: '8-12', rest_seconds: 90, muscle_group: 'Ombro' },
            { name: 'Elevação Lateral', sets: 4, reps: '12-15', rest_seconds: 60, muscle_group: 'Ombro' },
            { name: 'Elevação Frontal', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Ombro' },
            { name: 'Encolhimento com Halteres', sets: 4, reps: '12-15', rest_seconds: 60, muscle_group: 'Trapézio' },
          ],
        },
        { name: 'Descanso', day: 'SAB', duration_min: 0, status: 'rest', exercises: [] },
        { name: 'Descanso', day: 'DOM', duration_min: 0, status: 'rest', exercises: [] },
      ],
    },
    Emagrecimento: {
      name: 'Emagrecimento Masculino',
      days: [
        {
          name: 'Circuito Full Body A', day: 'SEG', duration_min: 50, status: 'upcoming',
          exercises: [
            { name: 'Agachamento com Salto', sets: 4, reps: '15', rest_seconds: 45, muscle_group: 'Full Body' },
            { name: 'Flexão de Braço', sets: 4, reps: '15', rest_seconds: 45, muscle_group: 'Peito' },
            { name: 'Burpee', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Full Body' },
            { name: 'Remada com Elástico', sets: 3, reps: '15', rest_seconds: 45, muscle_group: 'Costas' },
            { name: 'Mountain Climber', sets: 3, reps: '30s', rest_seconds: 45, muscle_group: 'Core' },
          ],
        },
        {
          name: 'HIIT Cardio', day: 'TER', duration_min: 40, status: 'upcoming',
          exercises: [
            { name: 'Corrida Intervalada', sets: 8, reps: '30s sprint / 30s caminhada', rest_seconds: 0, muscle_group: 'Cardio' },
            { name: 'Polichinelo', sets: 3, reps: '1 min', rest_seconds: 30, muscle_group: 'Cardio' },
            { name: 'Corda (simulado)', sets: 3, reps: '1 min', rest_seconds: 30, muscle_group: 'Cardio' },
          ],
        },
        { name: 'Descanso Ativo', day: 'QUA', duration_min: 0, status: 'rest', exercises: [] },
        {
          name: 'Circuito Full Body B', day: 'QUI', duration_min: 50, status: 'upcoming',
          exercises: [
            { name: 'Avanço Alternado', sets: 4, reps: '12 cada', rest_seconds: 45, muscle_group: 'Pernas' },
            { name: 'Supino com Halteres', sets: 3, reps: '15', rest_seconds: 45, muscle_group: 'Peito' },
            { name: 'Puxada no Cabo', sets: 3, reps: '15', rest_seconds: 45, muscle_group: 'Costas' },
            { name: 'Prancha', sets: 4, reps: '45s', rest_seconds: 30, muscle_group: 'Core' },
            { name: 'Jumping Jack', sets: 3, reps: '1 min', rest_seconds: 30, muscle_group: 'Cardio' },
          ],
        },
        {
          name: 'HIIT + Abdômen', day: 'SEX', duration_min: 45, status: 'upcoming',
          exercises: [
            { name: 'Tabata (Agachamento)', sets: 8, reps: '20s on / 10s off', rest_seconds: 0, muscle_group: 'Full Body' },
            { name: 'Abdominal Crunch', sets: 4, reps: '20', rest_seconds: 30, muscle_group: 'Abdômen' },
            { name: 'Elevação de Pernas', sets: 4, reps: '15', rest_seconds: 30, muscle_group: 'Abdômen' },
            { name: 'Bicicleta Abdominal', sets: 3, reps: '30', rest_seconds: 30, muscle_group: 'Abdômen' },
          ],
        },
        { name: 'Descanso', day: 'SAB', duration_min: 0, status: 'rest', exercises: [] },
        { name: 'Descanso', day: 'DOM', duration_min: 0, status: 'rest', exercises: [] },
      ],
    },
  },
  female: {
    Hipertrofia: {
      name: 'Hipertrofia Feminino',
      days: [
        {
          name: 'Glúteos e Posterior', day: 'SEG', duration_min: 60, status: 'upcoming',
          exercises: [
            { name: 'Agachamento Sumô', sets: 4, reps: '10-12', rest_seconds: 90, muscle_group: 'Glúteos' },
            { name: 'Hip Thrust', sets: 4, reps: '12-15', rest_seconds: 75, muscle_group: 'Glúteos' },
            { name: 'Stiff', sets: 3, reps: '10-12', rest_seconds: 75, muscle_group: 'Posterior' },
            { name: 'Cadeira Abdutora', sets: 3, reps: '15-20', rest_seconds: 60, muscle_group: 'Glúteos' },
            { name: 'Elevação Pélvica Unilateral', sets: 3, reps: '12 cada', rest_seconds: 60, muscle_group: 'Glúteos' },
          ],
        },
        {
          name: 'Costas e Bíceps', day: 'TER', duration_min: 55, status: 'upcoming',
          exercises: [
            { name: 'Puxada Frontal', sets: 4, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
            { name: 'Remada Baixa', sets: 4, reps: '10-12', rest_seconds: 75, muscle_group: 'Costas' },
            { name: 'Remada Unilateral', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Costas' },
            { name: 'Rosca Direta', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Bíceps' },
            { name: 'Rosca Concentrada', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Bíceps' },
          ],
        },
        { name: 'Descanso', day: 'QUA', duration_min: 0, status: 'rest', exercises: [] },
        {
          name: 'Quadríceps e Panturrilha', day: 'QUI', duration_min: 60, status: 'upcoming',
          exercises: [
            { name: 'Leg Press 45°', sets: 4, reps: '12-15', rest_seconds: 90, muscle_group: 'Quadríceps' },
            { name: 'Agachamento Hack', sets: 3, reps: '12-15', rest_seconds: 75, muscle_group: 'Quadríceps' },
            { name: 'Cadeira Extensora', sets: 3, reps: '15', rest_seconds: 60, muscle_group: 'Quadríceps' },
            { name: 'Avanço com Halteres', sets: 3, reps: '12 cada', rest_seconds: 60, muscle_group: 'Pernas' },
            { name: 'Panturrilha no Leg Press', sets: 4, reps: '20', rest_seconds: 45, muscle_group: 'Panturrilha' },
          ],
        },
        {
          name: 'Ombro e Tríceps', day: 'SEX', duration_min: 50, status: 'upcoming',
          exercises: [
            { name: 'Desenvolvimento com Halteres', sets: 3, reps: '12', rest_seconds: 75, muscle_group: 'Ombro' },
            { name: 'Elevação Lateral', sets: 4, reps: '15', rest_seconds: 60, muscle_group: 'Ombro' },
            { name: 'Elevação Frontal', sets: 3, reps: '15', rest_seconds: 60, muscle_group: 'Ombro' },
            { name: 'Tríceps Pulley', sets: 3, reps: '12-15', rest_seconds: 60, muscle_group: 'Tríceps' },
            { name: 'Tríceps Coice', sets: 3, reps: '12', rest_seconds: 60, muscle_group: 'Tríceps' },
          ],
        },
        { name: 'Descanso', day: 'SAB', duration_min: 0, status: 'rest', exercises: [] },
        { name: 'Descanso', day: 'DOM', duration_min: 0, status: 'rest', exercises: [] },
      ],
    },
    Emagrecimento: {
      name: 'Emagrecimento Feminino',
      days: [
        {
          name: 'Circuito Inferior A', day: 'SEG', duration_min: 50, status: 'upcoming',
          exercises: [
            { name: 'Agachamento com Salto', sets: 4, reps: '15', rest_seconds: 45, muscle_group: 'Pernas' },
            { name: 'Hip Thrust com Elástico', sets: 4, reps: '20', rest_seconds: 45, muscle_group: 'Glúteos' },
            { name: 'Avanço Alternado', sets: 3, reps: '12 cada', rest_seconds: 45, muscle_group: 'Pernas' },
            { name: 'Prancha', sets: 3, reps: '40s', rest_seconds: 30, muscle_group: 'Core' },
            { name: 'Mountain Climber', sets: 3, reps: '30s', rest_seconds: 30, muscle_group: 'Core' },
          ],
        },
        {
          name: 'HIIT Cardio', day: 'TER', duration_min: 35, status: 'upcoming',
          exercises: [
            { name: 'Corrida Intervalada', sets: 8, reps: '30s sprint / 30s caminhada', rest_seconds: 0, muscle_group: 'Cardio' },
            { name: 'Polichinelo', sets: 3, reps: '1 min', rest_seconds: 30, muscle_group: 'Cardio' },
            { name: 'Pular Corda (simulado)', sets: 3, reps: '1 min', rest_seconds: 30, muscle_group: 'Cardio' },
          ],
        },
        { name: 'Descanso Ativo', day: 'QUA', duration_min: 0, status: 'rest', exercises: [] },
        {
          name: 'Circuito Superior', day: 'QUI', duration_min: 45, status: 'upcoming',
          exercises: [
            { name: 'Flexão de Braço Modificada', sets: 4, reps: '12', rest_seconds: 45, muscle_group: 'Peito' },
            { name: 'Remada com Elástico', sets: 4, reps: '15', rest_seconds: 45, muscle_group: 'Costas' },
            { name: 'Elevação Lateral', sets: 3, reps: '15', rest_seconds: 45, muscle_group: 'Ombro' },
            { name: 'Burpee', sets: 3, reps: '10', rest_seconds: 60, muscle_group: 'Full Body' },
            { name: 'Abdominal Crunch', sets: 4, reps: '20', rest_seconds: 30, muscle_group: 'Abdômen' },
          ],
        },
        {
          name: 'Circuito Inferior B + Abdômen', day: 'SEX', duration_min: 45, status: 'upcoming',
          exercises: [
            { name: 'Agachamento Sumô com Salto', sets: 4, reps: '15', rest_seconds: 45, muscle_group: 'Glúteos' },
            { name: 'Cadeira Abdutora', sets: 3, reps: '20', rest_seconds: 45, muscle_group: 'Glúteos' },
            { name: 'Elevação de Pernas', sets: 4, reps: '15', rest_seconds: 30, muscle_group: 'Abdômen' },
            { name: 'Bicicleta Abdominal', sets: 3, reps: '30', rest_seconds: 30, muscle_group: 'Abdômen' },
            { name: 'Jumping Jack', sets: 3, reps: '1 min', rest_seconds: 30, muscle_group: 'Cardio' },
          ],
        },
        { name: 'Descanso', day: 'SAB', duration_min: 0, status: 'rest', exercises: [] },
        { name: 'Descanso', day: 'DOM', duration_min: 0, status: 'rest', exercises: [] },
      ],
    },
  },
};

// ─── Criação do plano via API ─────────────────────────────────────────────────

async function criarPlanoCompleto(gender, goal) {
  const plano = PLANOS[gender]?.[goal];
  if (!plano) throw new Error('Plano não encontrado');

  const planRes = await workoutsApi.createPlan({
    name: plano.name,
    description: `Plano de ${goal} para ${gender === 'male' ? 'homem' : 'mulher'}`,
    goal,
    gender,
  });

  const planId = planRes?.plan_id ?? planRes?.id ?? planRes?.data?.plan_id ?? planRes?.data?.id;
  if (!planId) throw new Error(`Falha ao criar plano: ${JSON.stringify(planRes)}`);

  for (const day of plano.days) {
    const dayRes = await workoutsApi.createDay(planId, {
      name: day.name,
      day_of_week: day.day,
      duration_min: day.duration_min,
      is_rest: day.status === 'rest',
    });

    const dayId = dayRes?.day_id ?? dayRes?.id ?? dayRes?.data?.day_id ?? dayRes?.data?.id;
    if (!dayId || day.exercises.length === 0) continue;

    for (const ex of day.exercises) {
      await workoutsApi.createExercise(dayId, {
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        muscle_group: ex.muscle_group,
      });
    }
  }

  return planId;
}

// ─── Opções de seleção ────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: 'male',   label: 'Masculino', icon: '♂️' },
  { value: 'female', label: 'Feminino',  icon: '♀️' },
];

const GOAL_OPTIONS = [
  { value: 'Hipertrofia',   label: 'Hipertrofia',   icon: '💪', desc: 'Ganho de massa muscular' },
  { value: 'Emagrecimento', label: 'Emagrecimento', icon: '🔥', desc: 'Queima de gordura' },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function OnboardingModal({ userName, userGender, onComplete }) {
  const [step, setStep]     = useState(0); // 0=loading, 1=gênero, 2=objetivo, 3=criando, 4=sucesso
  const [gender, setGender] = useState(null);
  const [goal, setGoal]     = useState(null);
  const [error, setError]   = useState('');

  useEffect(() => {
    users.me()
      .then(user => {
        const g = userGender || user?.gender || null;
        setGender(g);
        // Se já tem gênero, pula direto para escolha do objetivo
        setStep(g ? 2 : 1);
      })
      .catch(() => setStep(userGender ? 2 : 1));
  }, []);

  // Dispara criação quando step muda para 3
  useEffect(() => {
    if (step !== 3) return;
    setError('');

    const run = async () => {
      try {
        await users.update({ gender, goal });
        await criarPlanoCompleto(gender ?? 'male', goal);
        localStorage.setItem('onboarding_done', '1');
        setStep(4);
      } catch (err) {
        setError(err.message || 'Erro ao criar plano. Tente novamente.');
        setStep(2);
      }
    };

    run();
  }, [step]);

  const SelectionGrid = ({ options, value, onChange }) => (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex flex-col items-center justify-center p-6 border-2 transition-all ${
            value === opt.value
              ? 'border-lime-green bg-lime-green/10'
              : 'border-dark-border hover:border-lime-green/50'
          }`}
        >
          <span className="text-5xl mb-3">{opt.icon}</span>
          <span className="font-bebas text-xl uppercase text-white">{opt.label}</span>
          {opt.desc && <span className="text-gray-500 text-xs mt-1">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-dark-card border border-dark-border w-full max-w-md p-8"
      >
        <AnimatePresence mode="wait">

          {/* STEP 0 — Loading */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <div className="text-6xl mb-6 animate-bounce">⚙️</div>
              <p className="text-gray-400">Carregando sua configuração...</p>
            </motion.div>
          )}

          {/* STEP 1 — Gênero */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <p className="text-lime-green text-xs uppercase tracking-widest mb-1">Passo 1 de 2 · Bem-vindo(a)</p>
              <h2 className="text-3xl font-bebas uppercase mb-2 text-white">
                Olá, {userName?.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                Vamos configurar seu plano de treino personalizado. Qual é o seu gênero?
              </p>
              <SelectionGrid options={GENDER_OPTIONS} value={gender} onChange={setGender} />
              <button
                onClick={() => setStep(2)}
                disabled={!gender}
                className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all disabled:opacity-40"
              >
                Próximo →
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Objetivo */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <button onClick={() => setStep(1)} className="text-gray-500 text-xs mb-4 hover:text-lime-green transition-colors">← Voltar</button>
              <p className="text-lime-green text-xs uppercase tracking-widest mb-1">Passo 2 de 2</p>
              <h2 className="text-3xl font-bebas uppercase mb-2 text-white">Qual é o seu objetivo?</h2>
              <p className="text-gray-400 text-sm mb-8">Seu plano de treino será montado de acordo com sua escolha.</p>
              <SelectionGrid options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
              {error && (
                <p className="text-red-400 text-xs text-center mb-4 bg-red-500/10 border border-red-500/30 p-3">{error}</p>
              )}
              <button
                onClick={() => setStep(3)}
                disabled={!goal}
                className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all disabled:opacity-40"
              >
                Criar Meu Plano ✓
              </button>
            </motion.div>
          )}

          {/* STEP 3 — Criando */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <div className="text-6xl mb-6 animate-bounce">⚙️</div>
              <h2 className="text-3xl font-bebas uppercase text-lime-green mb-2">Montando seu plano...</h2>
              <p className="text-gray-400 text-sm">Criando treinos personalizados para você</p>
              <div className="mt-6 flex justify-center gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-lime-green rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Sucesso */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bebas uppercase text-lime-green mb-2">Plano criado!</h2>
              <p className="text-gray-300 text-sm mb-1">
                Seu plano de <span className="text-lime-green font-bold">{goal}</span> foi configurado com sucesso.
              </p>
              <p className="text-gray-500 text-xs mb-8">4 dias de treino + 3 dias de descanso por semana</p>
              <button
                onClick={onComplete}
                className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all"
              >
                Começar a Treinar 💪
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
