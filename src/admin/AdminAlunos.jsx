import React, { useState, useEffect } from 'react';
import { Search, User, ChevronRight, X, Save, Dumbbell, Salad } from 'lucide-react';
import { adminUsers, adminWorkouts, adminNutrition } from '../services/adminApi';

const PLANS = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE'];
const planColor = { BRONZE: 'text-orange-400 border-orange-400', PRATA: 'text-gray-300 border-gray-300', OURO: 'text-yellow-400 border-yellow-400', DIAMANTE: 'text-purple-400 border-purple-400' };

export default function AdminAlunos() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [draft, setDraft]         = useState({});
  const [saving, setSaving]       = useState(false);
  const [wPlans, setWPlans]       = useState([]);
  const [nPlans, setNPlans]       = useState([]);
  const [assignW, setAssignW]     = useState('');
  const [assignN, setAssignN]     = useState('');
  const [tab, setTab]             = useState('dados');

  useEffect(() => {
    adminUsers.listAll()
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.users ?? d?.data ?? d?.alunos ?? []);
        if (list[0]) console.log('[AdminAlunos] user keys:', Object.keys(list[0]));
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
    adminWorkouts.templates().then(d => setWPlans(Array.isArray(d) ? d : (d?.templates ?? d?.data ?? [])));
    adminNutrition.plans().then(d => setNPlans(Array.isArray(d) ? d : (d?.plans ?? d?.data ?? [])));
  }, []);

  const openUser = (u) => {
    setSelected(u);
    setDraft({
      name:         u.name         ?? '',
      email:        u.email        ?? '',
      phone:        u.phone        ?? '',
      plan:         u.plan         ?? 'BRONZE',
      plan_start:   u.plan_start   ? u.plan_start.split('T')[0]   : '',
      plan_renewal: u.plan_renewal ? u.plan_renewal.split('T')[0] : '',
      goal:         u.goal         ?? '',
    });
    setTab('dados'); setAssignW(''); setAssignN('');
  };

  const save = async () => {
    setSaving(true);
    await adminUsers.update(selected.id, draft).catch(() => {});
    setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, ...draft } : u));
    setSaving(false);
    setSelected(null);
  };

  const doAssignW = async () => {
    if (!assignW) return;
    await adminWorkouts.createCycle({ user_id: selected.id_user, template_id: Number(assignW), start_date: new Date().toISOString().split('T')[0] }).catch(() => {});
    setAssignW('');
  };

  const doAssignN = async () => {
    if (!assignN) return;
    await adminNutrition.assignPlan(selected.id_user, assignN).catch(() => {});
    setAssignN('');
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
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
            <button key={u.id_user ?? u.id ?? u.user_id ?? i} onClick={() => openUser(u)}
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
          <div className="bg-[#111] border border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-dark-border">
              <div className="flex items-center gap-3">
                <User size={18} className="text-lime-green" />
                <h3 className="text-lg font-bebas uppercase text-white">{selected.name}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-border">
              {[['dados', 'Dados'], ['treino', 'Treino'], ['nutricao', 'Nutrição']].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === k ? 'text-lime-green border-b-2 border-lime-green' : 'text-gray-500 hover:text-gray-300'}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {tab === 'dados' && (
                <>
                  {[['Nome', 'name', 'text'], ['E-mail', 'email', 'email'], ['Telefone', 'phone', 'tel'], ['Início do plano', 'plan_start', 'date'], ['Renovação', 'plan_renewal', 'date']].map(([label, key, type]) => (
                    <div key={key}>
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                      <input type={type} value={draft[key] ?? ''} onChange={e => setDraft({ ...draft, [key]: e.target.value })}
                        className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Plano</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PLANS.map(p => (
                        <button key={p} onClick={() => setDraft({ ...draft, plan: p })}
                          className={`py-2 text-xs font-bold border uppercase transition-colors ${draft.plan === p ? planColor[p] : 'border-dark-border text-gray-600'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={save} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-60">
                    <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                </>
              )}

              {tab === 'treino' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Atribuir plano de treino ao aluno:</p>
                  <select value={assignW} onChange={e => setAssignW(e.target.value)}
                    className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green">
                    <option value="">Selecionar plano...</option>
                    {wPlans.map((p, i) => <option key={p.id_plan ?? p.id_workout_plan ?? p.id ?? p.id_user ?? i} value={p.id_plan ?? p.id_workout_plan ?? p.id ?? p.id_user}>{p.name}</option>)}
                  </select>
                  <button onClick={doAssignW} disabled={!assignW}
                    className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-40">
                    <Dumbbell size={15} /> Atribuir Treino
                  </button>
                </div>
              )}

              {tab === 'nutricao' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Atribuir plano nutricional ao aluno:</p>
                  <select value={assignN} onChange={e => setAssignN(e.target.value)}
                    className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green">
                    <option value="">Selecionar plano...</option>
                    {nPlans.map((p, i) => <option key={p.id_plan ?? p.id_nutrition_plan ?? p.id ?? p.id_user ?? i} value={p.id_plan ?? p.id_nutrition_plan ?? p.id ?? p.id_user}>{p.name}</option>)}
                  </select>
                  <button onClick={doAssignN} disabled={!assignN}
                    className="w-full flex items-center justify-center gap-2 bg-purple-400 text-black font-bold py-3 uppercase text-sm hover:bg-purple-300 transition-colors disabled:opacity-40">
                    <Salad size={15} /> Atribuir Nutrição
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
