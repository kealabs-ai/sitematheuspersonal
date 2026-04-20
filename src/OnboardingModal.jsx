import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { users, workouts as workoutsApi, dashboard } from './services/alunoApi';

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
        {
          name: 'Descanso', day: 'QUA', duration_min: 0, status: 'rest', exercises: [],
        },
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
        {
          name: 'Descanso', day: 'SAB', duration_min: 0, status: 'rest', exercises: [],
        },
        {
          name: 'Descanso', day: 'DOM', duration_min: 0, status: 'rest', exercises: [],
        },
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
        {
          name: 'Descanso Ativo', day: 'QUA', duration_min: 0, status: 'rest', exercises: [],
        },
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
};

// ─── Criação do plano via API ─────────────────────────────────────────────────

async function criarPlanoCompleto(gender, goal) {
  const plano = PLANOS[gender]?.[goal];
  if (!plano) throw new Error('Plano não encontrado');

  console.log('%c[ONBOARDING] Criando plano:', 'color:#84cc16;font-weight:bold', plano.name);

  // 1. POST /api/aluno/workouts/plans
  const planRes = await workoutsApi.createPlan({
    name: plano.name,
    description: `Plano de ${goal} para ${gender === 'male' ? 'homem' : 'mulher'}`,
    goal,
    gender,
  });
  console.log('%c[ONBOARDING] Plano criado:', 'color:#84cc16;font-weight:bold', planRes);

  const planId = planRes?.plan_id ?? planRes?.id ?? planRes?.data?.plan_id ?? planRes?.data?.id;
  if (!planId) throw new Error(`Falha ao criar plano: ${JSON.stringify(planRes)}`);

  // 2. POST /api/aluno/workouts/plans/:planId/days
  for (const day of plano.days) {
    const dayRes = await workoutsApi.createDay(planId, {
      name: day.name,
      day_of_week: day.day,
      duration_min: day.duration_min,
      is_rest: day.status === 'rest',
    });
    console.log('%c[ONBOARDING] Dia criado:', 'color:#84cc16', day.name, dayRes);

    const dayId = dayRes?.day_id ?? dayRes?.id ?? dayRes?.data?.day_id ?? dayRes?.data?.id;
    if (!dayId || day.exercises.length === 0) continue;

    // 3. POST /api/aluno/workouts/days/:dayId/exercises
    for (const ex of day.exercises) {
      const exRes = await workoutsApi.createExercise(dayId, {
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        rest_seconds: ex.rest_seconds,
        muscle_group: ex.muscle_group,
      });
      console.log('%c[ONBOARDING] Exercício criado:', 'color:#84cc16', ex.name, exRes);
    }
  }

  return planId;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function OnboardingModal({ userName, onComplete }) {
  const [step, setStep] = useState(1); // 1 = gênero (ou skip se já tem), 2 = objetivo (ou skip se já tem), 3 = criando, 4 = sucesso
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [userGoal, setUserGoal] = useState(null); // Objetivo vindo do admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Buscar dados do usuário ao carregar
  useEffect(() => {
    users.me()
      .then(user => {
        console.log('%c[ONBOARDING] Dados do usuário:', 'color:#84cc16;font-weight:bold', user);
        const userGoalFromAdmin = user?.goal || user?.objective || null;
        setUserGoal(userGoalFromAdmin);
        setGender(user?.gender || null);
        
        // Se já tem objetivo configurado no admin, usa ele
        if (userGoalFromAdmin) {
          setGoal(userGoalFromAdmin);
          // Pula para o step de criação
          setStep(3);
        } else {
          // Caso contrário, começa do step 1
          setStep(1);
        }
      })
      .catch(err => {
        console.error('[ONBOARDING] Erro ao buscar usuário:', err);
        setStep(1); // Começa mesmo assim
      })
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async () => {
    setStep(3);
    setError('');
    try {
      // Salvar gênero e objetivo no perfil (apenas se não estava configurado)
      if (!userGoal) {
        await users.update({ gender, goal });
      }
      console.log('%c[ONBOARDING] Perfil atualizado:', 'color:#84cc16;font-weight:bold', { gender, goal: goal || userGoal });

      // Criar plano de treino com o objetivo (do admin ou selecionado agora)
      const finalGoal = goal || userGoal;
      await criarPlanoCompleto(gender || 'male', finalGoal);

      // Marcar onboarding como concluído
      localStorage.setItem('onboarding_done', '1');
      setStep(4);
    } catch (err) {
      console.error('[ONBOARDING] Erro:', err);
      setError(err.message || 'Erro ao criar plano. Tente novamente.');
      setStep(userGoal ? 2 : 1); // Volta para o step anterior
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
        <motion.div className="bg-dark-card border border-dark-border w-full max-w-md p-8 text-center py-12">
          <div className="text-6xl mb-6 animate-bounce">⚙️</div>
          <p className="text-gray-400">Carregando sua configuração...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-dark-card border border-dark-border w-full max-w-md p-8"
      >
        <AnimatePresence mode="wait">

          {/* STEP 1 — Gênero (pula se já vem do usuário) */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <p className="text-lime-green text-xs uppercase tracking-widest mb-1">Bem-vindo(a)</p>
              <h2 className="text-3xl font-bebas uppercase mb-2 text-white">
                Olá, {userName?.split(' ')[0]}! 👋
              </h2>
              <p className="text-gray-400 text-sm mb-8">Vamos configurar seu plano de treino personalizado. Primeiro, qual é o seu gênero?</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: 'male', label: 'Masculino', icon: '♂️' },
                  { value: 'female', label: 'Feminino', icon: '♀️' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGender(opt.value)}
                    className={`flex flex-col items-center justify-center p-6 border-2 transition-all ${
                      gender === opt.value
                        ? 'border-lime-green bg-lime-green/10'
                        : 'border-dark-border hover:border-lime-green/50'
                    }`}
                  >
                    <span className="text-5xl mb-3">{opt.icon}</span>
                    <span className="font-bebas text-xl uppercase text-white">{opt.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!gender}
                className="w-full bg-lime-green text-black font-bold py-4 uppercase hover:bg-neon-green transition-all disabled:opacity-40"
              >
                Próximo →
              </button>
            </motion.div>
          )}

          {/* STEP 2 — Objetivo (pula se já vem do admin) */}
          {step === 2 && !userGoal && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <button onClick={() => setStep(1)} className="text-gray-500 text-xs mb-4 hover:text-lime-green transition-colors">← Voltar</button>
              <p className="text-lime-green text-xs uppercase tracking-widest mb-1">Passo 2 de 2</p>
              <h2 className="text-3xl font-bebas uppercase mb-2 text-white">Qual é o seu objetivo?</h2>
              <p className="text-gray-400 text-sm mb-8">Seu plano de treino será montado de acordo com sua escolha.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: 'Hipertrofia', label: 'Hipertrofia', icon: '💪', desc: 'Ganho de massa muscular' },
                  { value: 'Emagrecimento', label: 'Emagrecimento', icon: '🔥', desc: 'Queima de gordura' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`flex flex-col items-center justify-center p-6 border-2 transition-all ${
                      goal === opt.value
                        ? 'border-lime-green bg-lime-green/10'
                        : 'border-dark-border hover:border-lime-green/50'
                    }`}
                  >
                    <span className="text-5xl mb-3">{opt.icon}</span>
                    <span className="font-bebas text-xl uppercase text-white">{opt.label}</span>
                    <span className="text-gray-500 text-xs mt-1">{opt.desc}</span>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center mb-4 bg-red-500/10 border border-red-500/30 p-3">{error}</p>
              )}

              <button
                onClick={handleConfirm}
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
              <p className="text-gray-300 text-sm mb-2">
                Seu plano de <span className="text-lime-green font-bold">{goal || userGoal}</span> foi configurado com sucesso.
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
