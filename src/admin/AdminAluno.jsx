import React, { useState, useEffect } from 'react';
import {
  Search, User, ChevronRight, X, Save, Dumbbell, Salad,
  Scale, Ruler, Bell, MessageSquare, Plus, Trash2, Pencil,
  TrendingUp, Calendar, Shield, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import { adminUsers, adminWorkouts, adminNutrition } from '../services/adminApi';

const PLANS      = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE'];
const planColor  = { BRONZE: 'text-orange-400 border-orange-400', PRATA: 'text-gray-300 border-gray-300', OURO: 'text-yellow-400 border-yellow-400', DIAMANTE: 'text-purple-400 border-purple-400' };
const inp        = 'w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors';
const TABS       = ['dados', 'treino', 'nutricao', 'metricas', 'notas'];
const TAB_LABEL  = { dados: 'Dados', treino: 'Treino', nutricao: 'Nutrição', metricas: 'Métricas', notas: 'Notas' };

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
      {children}
    </div>
  );
}

export default function AdminAluno() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [tab, setTab]           = useState('dados');

  // dados
  const [draft, setDraft]       = useState({});
  const [saving, setSaving]     = useState(false);

  // treino
  const [wPlans, setWPlans]     = useState([]);
  const [assignW, setAssignW]   = useState('');
  const [assigningW, setAssigningW] = useState(false);
  const [assignedW, setAssignedW]   = useState(null);

  // nutrição
  const [nPlans, setNPlans]     = useState([]);
  const [assignN, setAssignN]   = useState('');
  const [assigningN, setAssigningN] = useState(false);
  const [assignedN, setAssignedN]   = useState(null);

  // métricas
  const [metrics, setMetrics]   = useState({ weight: '', height: '', body_fat: '' });
  const [savingM, setSavingM]   = useState(false);

  // notas do nutricionista
  const [note, setNote]         = useState({ nutritionist: '', crn: '', message: '' });
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved]   = useState(false);

  useEffect(() => {
    Promise.all([
      adminUsers.listAll(),
      adminWorkouts.templates(),
      adminNutrition.plans(),
    ]).then(([u, w, n]) => {
      setUsers(Array.isArray(u) ? u : (u?.users ?? u?.data ?? []));
      setWPlans(Array.isArray(w) ? w : (w?.templates ?? w?.data ?? []));
      setNPlans(Array.isArray(n) ? n : (n?.plans ?? n?.data ?? []));
    }).finally(() => setLoading(false));
  }, []);

  const uid = (u) => u?.id ?? u?.id_user;

  const openUser = (u) => {
    setSelected(u);
    setTab('dados');
    setDraft({
      name:         u.name         ?? '',
      email:        u.email        ?? '',
      phone:        u.phone        ?? '',
      plan:         u.plan         ?? 'BRONZE',
      plan_start:   u.plan_start   ? u.plan_start.split('T')[0]   : '',
      plan_renewal: u.plan_renewal ? u.plan_renewal.split('T')[0] : '',
      goal:         u.goal         ?? '',
    });
    setMetrics({ weight: u.latest_metrics?.weight ?? '', height: u.latest_metrics?.height ?? '', body_fat: u.latest_metrics?.body_fat ?? '' });
    setAssignW(''); setAssignN('');
    setAssignedW(null); setAssignedN(null);
    setNote({ nutritionist: '', crn: '', message: '' });
    setNoteSaved(false);
  };

  const saveData = async () => {
    setSaving(true);
    await adminUsers.update(uid(selected), draft).catch(() => {});
    setUsers(prev => prev.map(u => uid(u) === uid(selected) ? { ...u, ...draft } : u));
    setSaving(false);
    setSelected(null);
  };

  const doAssignW = async () => {
    if (!assignW) return;
    setAssigningW(true);
    const plan = wPlans.find(p => String(p.id ?? p.id_user) === String(assignW));
    await adminWorkouts.createCycle({
      user_id:     uid(selected),
      template_id: Number(assignW),
      plan_name:   plan?.name ?? 'Plano',
      valid_from:  new Date().toISOString().split('T')[0],
    }).catch(() => {});
    setAssignedW(plan?.name ?? 'Plano atribuído');
    setAssigningW(false);
  };

  const doAssignN = async () => {
    if (!assignN) return;
    setAssigningN(true);
    await adminNutrition.assignPlan(uid(selected), assignN).catch(() => {});
    const plan = nPlans.find(p => String(p.id ?? p.id_user) === String(assignN));
    setAssignedN(plan?.name ?? 'Plano atribuído');
    setAssigningN(false);
  };

  const saveMetrics = async () => {
    setSavingM(true);
    await adminUsers.update(uid(selected), { latest_metrics: metrics }).catch(() => {});
    setSavingM(false);
  };

  const saveNote = async () => {
    setSavingNote(true);
    await adminNutrition.saveNote({ ...note, user_id: uid(selected) }).catch(() => {});
    setSavingNote(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2500);
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..."
            className="w-full bg-dark-card border border-dark-border text-white text-sm pl-9 pr-4 py-2.5 focus:outline-none focus:border-lime-green transition-colors" />
        </div>
        <span className="text-gray-500 text-xs">{filtered.length} alunos</span>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((u, i) => (
            <button key={uid(u) ?? i} onClick={() => openUser(u)}
              className="w-full flex items-center justify-between bg-dark-card border border-dark-border px-4 py-3 hover:border-lime-green/40 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-black border border-dark-border flex items-center justify-center text-xs font-bold text-white">
                  {u.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{u.name}</p>
                  <p className="text-gray-500 text-xs">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold border px-2 py-0.5 uppercase ${planColor[u.plan] ?? 'text-gray-400 border-gray-600'}`}>{u.plan ?? '—'}</span>
                <ChevronRight size={16} className="text-gray-600" />
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-gray-600 text-sm text-center py-8">Nenhum aluno encontrado.</p>}
        </div>
      )}

      {/* Modal aluno */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#111] border border-dark-border w-full max-w-xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-border sticky top-0 bg-[#111] z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black border border-dark-border flex items-center justify-center text-sm font-bold text-white">
                  {selected.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bebas uppercase text-white leading-tight">{selected.name}</h3>
                  <p className="text-gray-500 text-xs">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-border overflow-x-auto">
              {TABS.map(k => (
                <button key={k} onClick={() => setTab(k)}
                  className={`flex-shrink-0 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === k ? 'text-lime-green border-b-2 border-lime-green' : 'text-gray-500 hover:text-gray-300'}`}>
                  {TAB_LABEL[k]}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">

              {/* ── Dados ── */}
              {tab === 'dados' && (
                <>
                  {[
                    ['Nome', 'name', 'text'],
                    ['E-mail', 'email', 'email'],
                    ['Telefone', 'phone', 'tel'],
                    ['Início do plano', 'plan_start', 'date'],
                    ['Renovação', 'plan_renewal', 'date'],
                    ['Objetivo', 'goal', 'text'],
                  ].map(([label, key, type]) => (
                    <Field key={key} label={label}>
                      <input type={type} value={draft[key] ?? ''} onChange={e => setDraft({ ...draft, [key]: e.target.value })} className={inp} />
                    </Field>
                  ))}
                  <Field label="Plano">
                    <div className="grid grid-cols-4 gap-2">
                      {PLANS.map(p => (
                        <button key={p} onClick={() => setDraft({ ...draft, plan: p })}
                          className={`py-2 text-xs font-bold border uppercase transition-colors ${draft.plan === p ? planColor[p] : 'border-dark-border text-gray-600'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <button onClick={saveData} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-60">
                    <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Dados'}
                  </button>
                </>
              )}

              {/* ── Treino ── */}
              {tab === 'treino' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Atribuir plano de treino</p>
                  <Field label="Plano de treino">
                    <select value={assignW} onChange={e => setAssignW(e.target.value)} className={inp}>
                      <option value="">Selecionar plano...</option>
                      {wPlans.map((p, i) => (
                        <option key={p.id ?? p.id_user ?? i} value={p.id ?? p.id_user}>
                          {p.name}{p.gender ? ` (${p.gender})` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <button onClick={doAssignW} disabled={!assignW || assigningW}
                    className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-40">
                    <Dumbbell size={15} /> {assigningW ? 'Atribuindo...' : 'Atribuir Treino'}
                  </button>
                  {assignedW && (
                    <p className="text-lime-green text-xs text-center">✓ "{assignedW}" atribuído com sucesso</p>
                  )}
                </div>
              )}

              {/* ── Nutrição ── */}
              {tab === 'nutricao' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Atribuir plano nutricional</p>
                  <Field label="Plano nutricional">
                    <select value={assignN} onChange={e => setAssignN(e.target.value)} className={inp}>
                      <option value="">Selecionar plano...</option>
                      {nPlans.map((p, i) => (
                        <option key={p.id ?? p.id_user ?? i} value={p.id ?? p.id_user}>{p.name}</option>
                      ))}
                    </select>
                  </Field>
                  <button onClick={doAssignN} disabled={!assignN || assigningN}
                    className="w-full flex items-center justify-center gap-2 bg-purple-400 text-black font-bold py-3 uppercase text-sm hover:bg-purple-300 transition-colors disabled:opacity-40">
                    <Salad size={15} /> {assigningN ? 'Atribuindo...' : 'Atribuir Nutrição'}
                  </button>
                  {assignedN && (
                    <p className="text-purple-400 text-xs text-center">✓ "{assignedN}" atribuído com sucesso</p>
                  )}
                </div>
              )}

              {/* ── Métricas ── */}
              {tab === 'metricas' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Métricas físicas do aluno</p>
                  {[
                    ['Peso (kg)', 'weight', <Scale size={14} />],
                    ['Altura (cm)', 'height', <Ruler size={14} />],
                    ['% Gordura', 'body_fat', <TrendingUp size={14} />],
                  ].map(([label, key, icon]) => (
                    <Field key={key} label={label}>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">{icon}</span>
                        <input type="number" step="0.1" value={metrics[key]}
                          onChange={e => setMetrics({ ...metrics, [key]: e.target.value })}
                          className={`${inp} pl-9`} />
                      </div>
                    </Field>
                  ))}
                  {metrics.weight && metrics.height && (
                    <div className="bg-black border border-dark-border p-3 flex items-center justify-between">
                      <span className="text-gray-500 text-xs uppercase tracking-wide">IMC calculado</span>
                      <span className="text-white font-bebas text-xl">
                        {(metrics.weight / ((metrics.height / 100) ** 2)).toFixed(1)}
                      </span>
                    </div>
                  )}
                  <button onClick={saveMetrics} disabled={savingM}
                    className="w-full flex items-center justify-center gap-2 bg-blue-400 text-black font-bold py-3 uppercase text-sm hover:bg-blue-300 transition-colors disabled:opacity-60">
                    <Save size={15} /> {savingM ? 'Salvando...' : 'Salvar Métricas'}
                  </button>
                </div>
              )}

              {/* ── Notas ── */}
              {tab === 'notas' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Recado da nutricionista (visível ao aluno)</p>
                  <Field label="Nome da nutricionista">
                    <input className={inp} value={note.nutritionist} onChange={e => setNote({ ...note, nutritionist: e.target.value })} placeholder="Ex: Dra. Ana Lima" />
                  </Field>
                  <Field label="CRN">
                    <input className={inp} value={note.crn} onChange={e => setNote({ ...note, crn: e.target.value })} placeholder="Ex: CRN-3 12345" />
                  </Field>
                  <Field label="Mensagem">
                    <textarea rows={5} className={`${inp} resize-none`} value={note.message}
                      onChange={e => setNote({ ...note, message: e.target.value })}
                      placeholder="Orientações, observações ou recados para o aluno..." />
                  </Field>
                  <button onClick={saveNote} disabled={savingNote || !note.message}
                    className="w-full flex items-center justify-center gap-2 bg-purple-400 text-black font-bold py-3 uppercase text-sm hover:bg-purple-300 transition-colors disabled:opacity-60">
                    <MessageSquare size={15} /> {savingNote ? 'Salvando...' : 'Salvar Nota'}
                  </button>
                  {noteSaved && <p className="text-purple-400 text-xs text-center">✓ Nota salva e visível ao aluno</p>}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
