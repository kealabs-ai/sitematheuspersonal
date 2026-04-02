import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Edit3, Save, X, LogOut,
  Dumbbell, Calendar, Target, Scale, Ruler,
  Star, ChevronRight, Shield, Bell, Lock
} from 'lucide-react';

// Mock — substituir por dados reais da API
const MOCK_USER = {
  name: 'João Silva',
  email: 'joao@email.com',
  phone: '(35) 99999-0000',
  birthdate: '1995-03-22',
  goal: 'Hipertrofia',
  plan: 'OURO',
  planStart: '2024-01-15',
  planRenewal: '2025-01-15',
  weight: 83,
  height: 178,
  bodyFat: 14,
  avatar: null,
};

const GOALS = ['Hipertrofia', 'Emagrecimento', 'Condicionamento', 'Saúde Geral', 'Performance'];

const planColors = {
  BRONZE: { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400/10' },
  PRATA:  { text: 'text-gray-300',   border: 'border-gray-300',   bg: 'bg-gray-300/10'   },
  OURO:   { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10' },
  DIAMANTE: { text: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10' },
};

const planEmoji = { BRONZE: '🥉', PRATA: '🥈', OURO: '🥇', DIAMANTE: '💎' };

const imc = (weight, height) => (weight / ((height / 100) ** 2)).toFixed(1);
const imcLabel = (v) => {
  if (v < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-400' };
  if (v < 25)   return { label: 'Peso normal', color: 'text-lime-green' };
  if (v < 30)   return { label: 'Sobrepeso', color: 'text-yellow-400' };
  return { label: 'Obesidade', color: 'text-red-400' };
};

const age = (birthdate) => {
  const diff = Date.now() - new Date(birthdate).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(MOCK_USER);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(MOCK_USER);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const pc = planColors[user.plan] ?? planColors.OURO;
  const imcVal = imc(user.weight, user.height);
  const imcInfo = imcLabel(parseFloat(imcVal));
  const renewDays = daysUntil(user.planRenewal);

  const saveEdit = () => { setUser(draft); setEditing(false); };
  const cancelEdit = () => { setDraft(user); setEditing(false); };

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    // TODO: integrar com API
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedback(''); setFeedbackOpen(false); }, 2000);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-inter">

      {/* Header */}
      <header className="bg-black border-b border-dark-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-lime-green transition-colors">
            <ArrowLeft size={22} />
          </button>
          <User size={20} className="text-gray-400" />
          <h1 className="text-xl font-bebas uppercase tracking-wide">Meu Perfil</h1>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-lime-green border border-lime-green/40 px-3 py-1.5 hover:bg-lime-green/10 transition-colors"
          >
            <Edit3 size={13} /> Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="flex items-center gap-1 text-xs text-gray-400 border border-dark-border px-3 py-1.5 hover:border-gray-400 transition-colors">
              <X size={13} /> Cancelar
            </button>
            <button onClick={saveEdit} className="flex items-center gap-1 text-xs text-black bg-lime-green px-3 py-1.5 font-bold hover:bg-neon-green transition-colors">
              <Save size={13} /> Salvar
            </button>
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Avatar + nome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="relative">
            <div className={`w-20 h-20 rounded-full border-2 ${pc.border} flex items-center justify-center bg-dark-card`}>
              <span className="text-3xl font-bebas text-white">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            {editing && (
              <button className="absolute -bottom-1 -right-1 bg-lime-green text-black p-1 rounded-full">
                <Edit3 size={12} />
              </button>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bebas text-white">{user.name}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className={`inline-flex items-center gap-1.5 mt-1 border px-2 py-0.5 text-xs font-bold ${pc.border} ${pc.text} ${pc.bg}`}>
              {planEmoji[user.plan]} Plano {user.plan}
            </div>
          </div>
        </motion.div>

        {/* Card do plano */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`border ${pc.border} ${pc.bg} p-4`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${pc.text}`}>
              {planEmoji[user.plan]} Plano {user.plan} — Ativo
            </p>
            <button
              onClick={() => window.open('https://www.matheuspersonal.com.br/#consultoria', '_blank')}
              className={`text-xs border ${pc.border} ${pc.text} px-3 py-1 hover:opacity-80 transition-opacity`}
            >
              Upgrade
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide">Início</p>
              <p className="text-white text-sm font-semibold mt-0.5">
                {new Date(user.planStart).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide">Renovação</p>
              <p className={`text-sm font-semibold mt-0.5 ${renewDays <= 30 ? 'text-red-400' : 'text-white'}`}>
                {new Date(user.planRenewal).toLocaleDateString('pt-BR')}
                {renewDays <= 30 && <span className="text-red-400 text-[10px] ml-1">({renewDays}d)</span>}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dados pessoais */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-dark-card border border-dark-border p-4 space-y-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-widest">Dados Pessoais</p>

          {[
            { label: 'Nome completo', field: 'name', type: 'text', icon: <User size={15} /> },
            { label: 'E-mail', field: 'email', type: 'email', icon: <Shield size={15} /> },
            { label: 'Telefone', field: 'phone', type: 'tel', icon: <Bell size={15} /> },
            { label: 'Data de nascimento', field: 'birthdate', type: 'date', icon: <Calendar size={15} /> },
          ].map(({ label, field, type, icon }) => (
            <div key={field}>
              <label className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">
                <span className="text-gray-600">{icon}</span> {label}
              </label>
              {editing ? (
                <input
                  type={type}
                  value={draft[field]}
                  onChange={e => setDraft({ ...draft, [field]: e.target.value })}
                  className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors"
                />
              ) : (
                <p className="text-white text-sm">
                  {field === 'birthdate'
                    ? `${new Date(user[field]).toLocaleDateString('pt-BR')} (${age(user[field])} anos)`
                    : user[field]}
                </p>
              )}
            </div>
          ))}

          {/* Objetivo */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">
              <Target size={15} className="text-gray-600" /> Objetivo
            </label>
            {editing ? (
              <select
                value={draft.goal}
                onChange={e => setDraft({ ...draft, goal: e.target.value })}
                className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors"
              >
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            ) : (
              <p className="text-lime-green text-sm font-semibold">{user.goal}</p>
            )}
          </div>
        </motion.div>

        {/* Métricas físicas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-dark-card border border-dark-border p-4 space-y-4"
        >
          <p className="text-xs text-gray-400 uppercase tracking-widest">Métricas Físicas</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Peso', field: 'weight', unit: 'kg', icon: <Scale size={16} />, color: 'text-lime-green' },
              { label: 'Altura', field: 'height', unit: 'cm', icon: <Ruler size={16} />, color: 'text-blue-400' },
              { label: '% Gordura', field: 'bodyFat', unit: '%', icon: <Dumbbell size={16} />, color: 'text-orange-400' },
            ].map(({ label, field, unit, icon, color }) => (
              <div key={field} className="bg-black border border-dark-border p-3 text-center">
                <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                {editing ? (
                  <input
                    type="number"
                    value={draft[field]}
                    onChange={e => setDraft({ ...draft, [field]: parseFloat(e.target.value) })}
                    className="w-full bg-transparent text-center text-white font-bebas text-2xl focus:outline-none border-b border-dark-border focus:border-lime-green"
                  />
                ) : (
                  <p className={`font-bebas text-2xl ${color}`}>{user[field]}</p>
                )}
                <p className="text-gray-500 text-[10px] uppercase mt-0.5">{label} ({unit})</p>
              </div>
            ))}
          </div>

          {/* IMC */}
          <div className="bg-black border border-dark-border p-3 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide">IMC</p>
              <p className={`font-bebas text-3xl mt-0.5 ${imcInfo.color}`}>{imcVal}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${imcInfo.color}`}>{imcInfo.label}</p>
              <p className="text-gray-600 text-xs mt-0.5">
                {user.weight}kg / {(user.height / 100).toFixed(2)}m²
              </p>
            </div>
          </div>
        </motion.div>

        {/* Ações rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-dark-card border border-dark-border divide-y divide-dark-border"
        >
          {[
            { icon: <Lock size={16} />, label: 'Alterar senha', action: () => {} },
            { icon: <Bell size={16} />, label: 'Notificações', action: () => {} },
            { icon: <Star size={16} />, label: 'Enviar feedback ao personal', action: () => setFeedbackOpen(true), highlight: true },
          ].map(({ icon, label, action, highlight }, i) => (
            <button
              key={i}
              onClick={action}
              className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors
                ${highlight ? 'text-lime-green' : 'text-gray-300'}`}
            >
              <div className="flex items-center gap-3">
                <span className={highlight ? 'text-lime-green' : 'text-gray-500'}>{icon}</span>
                <span className="text-sm">{label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          ))}
        </motion.div>

        {/* Modal feedback */}
        {feedbackOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setFeedbackOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-dark-card border border-lime-green/40 p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bebas uppercase text-lime-green">Feedback ao Personal</h3>
                <button onClick={() => setFeedbackOpen(false)} className="text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              {feedbackSent ? (
                <div className="text-center py-6">
                  <p className="text-4xl mb-3">🙏</p>
                  <p className="text-lime-green font-bold">Feedback enviado!</p>
                  <p className="text-gray-400 text-sm mt-1">O Matheus vai adorar saber disso.</p>
                </div>
              ) : (
                <>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    rows={4}
                    placeholder="Como está sendo sua experiência? Dúvidas, sugestões, resultados..."
                    className="w-full bg-black border border-dark-border text-white text-sm p-3 focus:outline-none focus:border-lime-green transition-colors resize-none mb-4"
                  />
                  <button
                    onClick={sendFeedback}
                    disabled={!feedback.trim()}
                    className="w-full bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-all disabled:opacity-40"
                  >
                    Enviar Feedback
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Sair */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 py-3 hover:bg-red-500/10 transition-colors text-sm font-semibold uppercase tracking-wide"
          >
            <LogOut size={16} /> Sair da conta
          </button>
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
