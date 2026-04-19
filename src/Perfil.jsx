import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Edit3, Save, X, LogOut,
  Dumbbell, Calendar, Scale, Ruler,
  Star, ChevronRight, Shield, Bell, Lock, Eye, EyeOff, Camera, Flame
} from 'lucide-react';
import { users as usersApi, auth, clearSession, getUser } from './services/alunoApi';
import { useBlockBack } from './hooks/useBlockBack';
import BottomNav from './BottomNav';
import AppFooter from './AppFooter';
import { ShimmerButton } from './components/magicui/shimmer-button';
import { AnimatedGradientText } from './components/magicui/animated-gradient-text';

const GOALS = [
  { value: 'Hipertrofia',   icon: <Dumbbell size={28} />, color: 'border-lime-green text-lime-green bg-lime-green/10' },
  { value: 'Emagrecimento', icon: <Flame size={28} />,    color: 'border-orange-400 text-orange-400 bg-orange-400/10' },
];

const planColors = {
  BRONZE:   { text: 'text-orange-400', border: 'border-orange-400', bg: 'bg-orange-400/10' },
  PRATA:    { text: 'text-gray-300',   border: 'border-gray-300',   bg: 'bg-gray-300/10'   },
  OURO:     { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/10' },
  DIAMANTE: { text: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-400/10' },
};
const planEmoji = { BRONZE: '🥉', PRATA: '🥈', OURO: '🥇', DIAMANTE: '💎' };

const calcImc  = (w, h) => (w / ((h / 100) ** 2)).toFixed(1);
const imcLabel = (v) => {
  if (v < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-400' };
  if (v < 25)   return { label: 'Peso normal',    color: 'text-lime-green' };
  if (v < 30)   return { label: 'Sobrepeso',      color: 'text-yellow-400' };
  return              { label: 'Obesidade',       color: 'text-red-400' };
};
const calcAge = (d) => Math.floor((Date.now() - new Date(d)) / (1000 * 60 * 60 * 24 * 365.25));
const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)));

// Detecta o ciclo em meses comparando plan_start e plan_renewal
const detectCycle = (start, renewal) => {
  if (!start || !renewal) return 1;
  const months = (new Date(renewal).getFullYear() - new Date(start).getFullYear()) * 12
    + (new Date(renewal).getMonth() - new Date(start).getMonth());
  if (months >= 5) return 6;
  if (months >= 2) return 3;
  return 1;
};

// Calcula a próxima data de renovação de acordo com o ciclo detectado
const nextRenewal = (start, renewal) => {
  if (!start) return renewal ? new Date(renewal) : null;
  const now   = new Date();
  // Se a data de renovação da API ainda está no futuro, usa ela
  if (renewal) {
    const r = new Date(renewal);
    if (r > now) return r;
  }
  const cycle = detectCycle(start, renewal);
  const next  = new Date(start);
  while (next <= now) next.setMonth(next.getMonth() + cycle);
  return next;
};

export default function Perfil() {
  useBlockBack();
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [metrics, setMetrics]     = useState(null);
  const [editing, setEditing]     = useState(false);
  const [draft, setDraft]         = useState({});
  const [saving, setSaving]       = useState(false);
  const [feedbackOpen, setFeedbackOpen]   = useState(false);
  const [feedback, setFeedback]           = useState('');
  const [feedbackSent, setFeedbackSent]   = useState(false);
  const [metricsOpen, setMetricsOpen]     = useState(false);
  const [metricsDraft, setMetricsDraft]   = useState({});
  const [metricsSaving, setMetricsSaving] = useState(false);
  const [passwordOpen, setPasswordOpen]   = useState(false);
  const [pwDraft, setPwDraft]             = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving]           = useState(false);
  const [pwError, setPwError]             = useState('');
  const [pwShow, setPwShow]               = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [notifPrefs, setNotifPrefs]       = useState(null);
  const [notifSaving, setNotifSaving]     = useState(false);
  const [avatar, setAvatar]               = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const avatarInputRef                    = React.useRef(null);

  const PRESET_AVATARS = [
    'https://api.dicebear.com/8.x/adventurer/svg?seed=gym1&backgroundColor=1a1a2e&hair=short01&eyes=variant01',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=gym2&backgroundColor=1a1a2e&hair=short02&eyes=variant02',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=gym3&backgroundColor=0d1b2a&hair=short03',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=gym4&backgroundColor=1a1a2e&hair=short04',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=gym5&backgroundColor=0d1b2a&hair=short05',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=gym6&backgroundColor=1a1a2e',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=athlete1&backgroundColor=0d1b2a&hair=long01',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=athlete2&backgroundColor=1a1a2e&hair=long02',
    'https://api.dicebear.com/8.x/adventurer/svg?seed=athlete3&backgroundColor=0d1b2a&hair=long03',
  ];

  const saveAvatarUrl = async (url) => {
    setAvatarUploading(true);
    const res = await usersApi.uploadAvatar({ avatar_base64: url }).catch(() => null);
    setAvatarUploading(false);
    const finalUrl = res?.avatar_url ?? url;
    setAvatar(finalUrl);
    const updated = { ...getUser(), avatar_url: finalUrl };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(prev => ({ ...prev, avatar_url: finalUrl }));
    window.dispatchEvent(new Event('storage'));
  };

  const handlePresetAvatar = async (url) => {
    setAvatarModalOpen(false);
    await saveAvatarUrl(url);
  };

  useEffect(() => {
    usersApi.me().then(data => {
      setUser(data);
      setDraft(data);
      if (data.latest_metrics) setMetrics(data.latest_metrics);
      if (data.avatar_url) setAvatar(data.avatar_url); // carrega avatar do banco
    }).catch(() => {});
  }, []);

  const openMetrics = () => {
    setMetricsDraft({ weight: metrics?.weight ?? '', height: metrics?.height ?? '', body_fat: metrics?.body_fat ?? '' });
    setMetricsOpen(true);
  };

  const saveMetrics = async () => {
    setMetricsSaving(true);
    const res = await usersApi.addMetric(metricsDraft).catch(() => null);
    if (res) setMetrics(prev => ({ ...prev, ...metricsDraft }));
    setMetricsSaving(false);
    setMetricsOpen(false);
  };

  const savePassword = async () => {
    if (pwDraft.next !== pwDraft.confirm) { setPwError('As senhas não coincidem.'); return; }
    if (pwDraft.next.length < 6) { setPwError('Mínimo 6 caracteres.'); return; }
    setPwSaving(true); setPwError('');
    const res = await usersApi.password(pwDraft.current, pwDraft.next).catch(() => null);
    setPwSaving(false);
    if (res?.error) { setPwError(res.error); return; }
    setPwDraft({ current: '', next: '', confirm: '' });
    setPasswordOpen(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file)); // preview imediato
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const MAX = 800;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        await saveAvatarUrl(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const openNotif = async () => {
    setNotifOpen(true);
    if (!notifPrefs) {
      const res = await usersApi.notifPrefs().catch(() => null);
      setNotifPrefs(res ?? { workout_reminder: true, nutrition_reminder: true, plan_renewal: true, promotions: false });
    }
  };

  const saveNotif = async () => {
    setNotifSaving(true);
    await usersApi.updateNotifPrefs(notifPrefs).catch(() => {});
    setNotifSaving(false);
    setNotifOpen(false);
  };

  const pc        = planColors[user?.plan] ?? planColors.OURO;
  const imcVal    = metrics?.weight && metrics?.height ? calcImc(metrics.weight, metrics.height) : null;
  const imcInfo   = imcVal ? imcLabel(parseFloat(imcVal)) : null;
  const renewDate = nextRenewal(user?.plan_start, user?.plan_renewal);
  const renewDays  = renewDate ? daysUntil(renewDate) : null;
  const cycle      = detectCycle(user?.plan_start, user?.plan_renewal);
  const cycleLabel = { 1: 'Mensal', 3: 'Trimestral', 6: 'Semestral' }[cycle] ?? 'Mensal';

  const saveEdit = async () => {
    setSaving(true);
    await usersApi.update({ name: draft.name, phone: draft.phone, birthdate: draft.birthdate, goal: draft.goal }).catch(() => {});
    setUser(prev => ({ ...prev, ...draft }));
    setSaving(false);
    setEditing(false);
  };

  const sendFeedback = async () => {
    if (!feedback.trim()) return;
    await usersApi.feedback(feedback).catch(() => {});
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedback(''); setFeedbackOpen(false); }, 2000);
  };

  const handleLogout = async () => {
    await auth.logout(localStorage.getItem('refresh_token')).catch(() => {});
    clearSession();
    navigate('/login');
  };

  if (!user) return (
    <div className="min-h-screen sport-bg flex items-center justify-center">
      <p className="text-lime-green font-bebas text-2xl animate-pulse">Carregando...</p>
    </div>
  );

  return (
    <div className="min-h-screen sport-bg text-white font-inter pt-[60px] md:pt-[68px] pb-[60px] md:pb-10">

      <main className="max-w-2xl md:max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* Avatar + nome */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-20 h-20 rounded-full border-2 ${pc.border} overflow-hidden flex items-center justify-center bg-dark-card`}>
              {(avatar || user.avatar_url) ? (
                <img src={avatar || user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bebas text-white">
                  {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-lime-green border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button onClick={() => setAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 bg-lime-green text-black p-1.5 rounded-full hover:bg-neon-green transition-colors">
              <Camera size={12} />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bebas"><AnimatedGradientText>{user.name}</AnimatedGradientText></h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className={`inline-flex items-center gap-1.5 mt-1 border px-2 py-0.5 text-xs font-bold ${pc.border} ${pc.text} ${pc.bg}`}>
              {planEmoji[user.plan]} Plano {user.plan}
            </div>
          </div>
          {/* Botão editar inline */}
          <div className="flex-shrink-0">
            {!editing ? (
              <ShimmerButton onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs" shimmerColor="#00B4D8" background="rgba(26,26,26,1)">
                <span className="text-lime-green flex items-center gap-1"><Edit3 size={13} /> Editar</span>
              </ShimmerButton>
            ) : (
              <div className="flex flex-col gap-1.5">
                <ShimmerButton onClick={saveEdit} disabled={saving} className="px-3 py-1.5 text-xs" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
                  <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
                </ShimmerButton>
                <button onClick={() => { setDraft(user); setEditing(false); }}
                  className="flex items-center gap-1 text-xs text-gray-400 border border-dark-border px-3 py-1.5 hover:border-gray-400 transition-colors">
                  <X size={13} /> Cancelar
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Card do plano */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`relative border ${pc.border} ${pc.bg} p-4 overflow-hidden`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase tracking-widest ${pc.text}`}>
              {planEmoji[user.plan]} Plano {user.plan} — Ativo
            </p>
            <button onClick={() => window.open('https://www.matheuspersonal.com.br/#consultoria', '_blank')}
              className={`text-xs border ${pc.border} ${pc.text} px-3 py-1 hover:opacity-80 transition-opacity`}>
              Upgrade
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide">Início</p>
              <p className="text-white text-sm font-semibold mt-0.5">
                {user.plan_start ? new Date(user.plan_start).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wide">Ciclo</p>
              <p className="text-white text-sm font-semibold mt-0.5">{cycleLabel}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 text-[10px] uppercase tracking-wide">Próxima Renovação</p>
              <p className={`text-sm font-semibold mt-0.5 ${renewDays !== null && renewDays <= 7 ? 'text-red-400' : renewDays !== null && renewDays <= 30 ? 'text-yellow-400' : 'text-white'}`}>
                {renewDate ? renewDate.toLocaleDateString('pt-BR') : '—'}
                {renewDays !== null && (
                  <span className={`text-[10px] ml-1 ${renewDays <= 7 ? 'text-red-400' : renewDays <= 30 ? 'text-yellow-400' : 'text-gray-500'}`}>
                    ({renewDays === 0 ? 'hoje' : `em ${renewDays}d`})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dados pessoais + Métricas: grid no desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Dados pessoais */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-dark-card border border-dark-border p-4 space-y-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest">Dados Pessoais</p>
            {[
              { label: 'Nome completo',      field: 'name',      type: 'text',  icon: <User size={15} /> },
              { label: 'E-mail',             field: 'email',     type: 'email', icon: <Shield size={15} /> },
              { label: 'Telefone',           field: 'phone',     type: 'tel',   icon: <Bell size={15} /> },
              { label: 'Data de nascimento', field: 'birthdate', type: 'date',  icon: <Calendar size={15} /> },
            ].map(({ label, field, type, icon }) => (
              <div key={field}>
                <label className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">
                  <span className="text-gray-600">{icon}</span> {label}
                </label>
                {editing ? (
                  <input type={type} value={draft[field] ?? ''}
                    onChange={e => setDraft({ ...draft, [field]: e.target.value })}
                    className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors"
                  />
                ) : (
                  <p className="text-white text-sm">
                    {field === 'birthdate' && user[field]
                      ? `${new Date(user[field]).toLocaleDateString('pt-BR')} (${calcAge(user[field])} anos)`
                      : user[field] ?? '—'}
                  </p>
                )}
              </div>
            ))}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-2 block">Objetivo</label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(g => {
                  const active = (editing ? draft.goal : user.goal) === g.value;
                  return (
                    <button key={g.value} type="button"
                      onClick={() => editing && setDraft({ ...draft, goal: g.value })}
                      className={`flex flex-col items-center gap-2 py-4 border-2 transition-all ${
                        active ? g.color : 'border-dark-border text-gray-600 bg-transparent'
                      } ${editing ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}>
                      {g.icon}
                      <span className="text-xs font-bold uppercase tracking-wide">{g.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Métricas físicas */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="relative bg-dark-card border border-dark-border p-4 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 uppercase tracking-widest">Métricas Físicas</p>
              <button onClick={openMetrics}
                className="flex items-center gap-1 text-xs text-lime-green border border-lime-green/40 px-2.5 py-1 hover:bg-lime-green/10 transition-colors">
                <Edit3 size={11} /> Editar
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Peso',      key: 'weight',   unit: 'kg', icon: <Scale size={16} />,    color: 'text-lime-green'  },
                { label: 'Altura',    key: 'height',   unit: 'cm', icon: <Ruler size={16} />,    color: 'text-blue-400'   },
                { label: '% Gordura', key: 'body_fat', unit: '%',  icon: <Dumbbell size={16} />, color: 'text-orange-400' },
              ].map(({ label, key, unit, icon, color }) => (
                <div key={key} className="bg-black border border-dark-border p-3 text-center">
                  <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                  <p className={`font-bebas text-2xl ${color}`}>{metrics?.[key] ?? '—'}</p>
                  <p className="text-gray-500 text-[10px] uppercase mt-0.5">{label} ({unit})</p>
                </div>
              ))}
            </div>
            {imcVal && imcInfo && (
              <div className="bg-black border border-dark-border p-3 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wide">IMC</p>
                  <p className={`font-bebas text-3xl mt-0.5 ${imcInfo.color}`}>{imcVal}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${imcInfo.color}`}>{imcInfo.label}</p>
                  <p className="text-gray-600 text-xs mt-0.5">
                    {metrics.weight}kg / {(metrics.height / 100).toFixed(2)}m²
                  </p>
                </div>
              </div>
            )}
          </motion.div>

        </div>

        {/* Ações rápidas */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-dark-card border border-dark-border divide-y divide-dark-border">
          {[
            { icon: <Lock size={16} />, label: 'Alterar senha',               action: () => { setPwDraft({ current: '', next: '', confirm: '' }); setPwError(''); setPasswordOpen(true); }, highlight: false },
            { icon: <Bell size={16} />, label: 'Notificações', action: openNotif, highlight: false, hidden: true },
            { icon: <Star size={16} />, label: 'Enviar feedback ao personal',  action: () => setFeedbackOpen(true), highlight: true  },
          ].filter(item => !item.hidden).map(({ icon, label, action, highlight }, i) => (
            <button key={i} onClick={action}
              className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors ${highlight ? 'text-lime-green' : 'text-gray-300'}`}>
              <div className="flex items-center gap-3">
                <span className={highlight ? 'text-lime-green' : 'text-gray-500'}>{icon}</span>
                <span className="text-sm">{label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          ))}
        </motion.div>

        {/* Modal avatar */}
        {avatarModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setAvatarModalOpen(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-dark-card border border-lime-green/40 p-6 w-full max-w-md space-y-5"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bebas uppercase text-lime-green flex items-center gap-2">
                  <Camera size={18} /> Foto de Perfil
                </h3>
                <button onClick={() => setAvatarModalOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Avatares sugeridos</p>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AVATARS.map((url, i) => (
                    <button key={i} onClick={() => handlePresetAvatar(url)}
                      className="aspect-square rounded-full overflow-hidden border-2 border-dark-border hover:border-lime-green transition-all hover:scale-105 bg-[#1a1a2e]">
                      <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-dark-border pt-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Ou envie sua foto</p>
                <button
                  onClick={() => { setAvatarModalOpen(false); avatarInputRef.current?.click(); }}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-dark-border text-gray-400 py-4 hover:border-lime-green hover:text-lime-green transition-colors text-sm font-semibold">
                  <Camera size={16} /> Escolher da galeria
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal métricas */}
        {metricsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setMetricsOpen(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-dark-card border border-lime-green/40 p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bebas uppercase text-lime-green">Métricas Físicas</h3>
                <button onClick={() => setMetricsOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Peso (kg)',      key: 'weight',   icon: <Scale size={14} /> },
                  { label: 'Altura (cm)',    key: 'height',   icon: <Ruler size={14} /> },
                  { label: '% Gordura',     key: 'body_fat', icon: <Dumbbell size={14} /> },
                ].map(({ label, key, icon }) => (
                  <div key={key}>
                    <label className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wide mb-1.5">
                      <span className="text-gray-600">{icon}</span> {label}
                    </label>
                    <input type="number" step="0.1" value={metricsDraft[key]}
                      onChange={e => setMetricsDraft({ ...metricsDraft, [key]: e.target.value })}
                      className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors"
                    />
                  </div>
                ))}
              </div>
              <ShimmerButton onClick={saveMetrics} disabled={metricsSaving} className="w-full mt-5 justify-center" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
                {metricsSaving ? 'Salvando...' : 'Salvar Métricas'}
              </ShimmerButton>
            </motion.div>
          </motion.div>
        )}

        {/* Modal senha */}
        {passwordOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setPasswordOpen(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-dark-card border border-lime-green/40 p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bebas uppercase text-lime-green">Alterar Senha</h3>
                <button onClick={() => setPasswordOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Senha atual',       key: 'current' },
                  { label: 'Nova senha',         key: 'next'    },
                  { label: 'Confirmar nova senha', key: 'confirm' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide mb-1.5 block">{label}</label>
                    <div className="relative">
                      <input type={pwShow ? 'text' : 'password'} value={pwDraft[key]}
                        onChange={e => setPwDraft({ ...pwDraft, [key]: e.target.value })}
                        className="w-full bg-black border border-dark-border text-white text-sm p-2.5 pr-10 focus:outline-none focus:border-lime-green transition-colors"
                      />
                      {key === 'current' && (
                        <button type="button" onClick={() => setPwShow(v => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                          {pwShow ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
              </div>
              <ShimmerButton onClick={savePassword} disabled={pwSaving || !pwDraft.current || !pwDraft.next} className="w-full mt-5 justify-center" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
                {pwSaving ? 'Salvando...' : 'Alterar Senha'}
              </ShimmerButton>
            </motion.div>
          </motion.div>
        )}

        {/* Modal notificações */}
        {notifOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setNotifOpen(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-dark-card border border-lime-green/40 p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bebas uppercase text-lime-green">Notificações</h3>
                <button onClick={() => setNotifOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              {!notifPrefs ? (
                <p className="text-gray-400 text-sm text-center py-4 animate-pulse">Carregando...</p>
              ) : (
                <div className="space-y-1 divide-y divide-dark-border">
                  {[
                    { key: 'workout_reminder',   label: 'Lembrete de treino',       desc: 'Notificação diária para não perder o treino' },
                    { key: 'nutrition_reminder', label: 'Lembrete de nutrição',      desc: 'Alertas para registrar refeições' },
                    { key: 'plan_renewal',       label: 'Renovação do plano',        desc: 'Aviso quando o plano estiver próximo do vencimento' },
                    { key: 'promotions',         label: 'Promoções e novidades',     desc: 'Ofertas e conteúdos exclusivos' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3">
                      <div className="flex-1 pr-4">
                        <p className="text-white text-sm font-medium">{label}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                      </div>
                      <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                          notifPrefs[key] ? 'bg-lime-green' : 'bg-dark-border'
                        }`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          notifPrefs[key] ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ShimmerButton onClick={saveNotif} disabled={notifSaving || !notifPrefs} className="w-full mt-5 justify-center" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
                {notifSaving ? 'Salvando...' : 'Salvar Preferências'}
              </ShimmerButton>
            </motion.div>
          </motion.div>
        )}

        {/* Modal feedback */}
        {feedbackOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end md:items-center justify-center p-4"
            onClick={() => setFeedbackOpen(false)}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-dark-card border border-lime-green/40 p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bebas uppercase text-lime-green">Feedback ao Personal</h3>
                <button onClick={() => setFeedbackOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              {feedbackSent ? (
                <div className="text-center py-6">
                  <p className="text-4xl mb-3">🙏</p>
                  <p className="text-lime-green font-bold">Feedback enviado!</p>
                  <p className="text-gray-400 text-sm mt-1">O Matheus vai adorar saber disso.</p>
                </div>
              ) : (
                <>
                  <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4}
                    placeholder="Como está sendo sua experiência? Dúvidas, sugestões, resultados..."
                    className="w-full bg-black border border-dark-border text-white text-sm p-3 focus:outline-none focus:border-lime-green transition-colors resize-none mb-4"
                  />
                  <ShimmerButton onClick={sendFeedback} disabled={!feedback.trim()} className="w-full justify-center" shimmerColor="#ffffff" background="rgba(0,180,216,1)">
                    Enviar Feedback
                  </ShimmerButton>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Sair */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 py-3 hover:bg-red-500/10 transition-colors text-sm font-semibold uppercase tracking-wide">
            <LogOut size={16} /> Sair da conta
          </button>
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
