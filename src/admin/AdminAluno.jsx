import React, { useState, useEffect } from 'react';
import {
  Search, User, ChevronRight, X,
  Scale, Ruler, MessageSquare, TrendingUp,
} from 'lucide-react';
import { adminUsers, adminNutrition } from '../services/adminApi';

const planColor  = { BRONZE: 'text-orange-400 border-orange-400', PRATA: 'text-gray-300 border-gray-300', OURO: 'text-yellow-400 border-yellow-400', DIAMANTE: 'text-purple-400 border-purple-400' };
const inp        = 'w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors';
const TABS       = ['dados', 'metricas', 'notas'];
const TAB_LABEL  = { dados: 'Dados', metricas: 'Métricas', notas: 'Notas' };

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

  // dados — somente leitura, sem draft/saving
  // métricas — somente leitura
  const [metrics, setMetrics]   = useState(null);
  const [loadingM, setLoadingM] = useState(false);

  // notas do nutricionista
  const [note, setNote]         = useState({ nutritionist: '', crn: '', message: '' });
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved]   = useState(false);

  useEffect(() => {
    adminUsers.listAll()
      .then(u => setUsers(Array.isArray(u) ? u : (u?.users ?? u?.data ?? [])))
      .finally(() => setLoading(false));
  }, []);

  const uid = (u) => u?.id ?? u?.id_user;

  const openUser = (u) => {
    setSelected(u);
    setTab('dados');
    setMetrics(null);
    setNote({ nutritionist: '', crn: '', message: '' });
    setNoteSaved(false);
    // Busca métricas do aluno
    setLoadingM(true);
    adminUsers.metrics(u.id ?? u.id_user)
      .then(d => setMetrics(d.metrics ?? null))
      .catch(() => setMetrics(null))
      .finally(() => setLoadingM(false));
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

              {/* ── Dados (somente leitura) ── */}
              {tab === 'dados' && (
                <div className="space-y-3">
                  {[
                    ['Nome',            selected.name],
                    ['E-mail',          selected.email],
                    ['Telefone',        selected.phone        ?? '—'],
                    ['Início do plano', selected.plan_start   ? selected.plan_start.split('T')[0]   : '—'],
                    ['Renovação',       selected.plan_renewal ? selected.plan_renewal.split('T')[0] : '—'],
                    ['Objetivo',        selected.goal         ?? '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center border-b border-dark-border/50 pb-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</span>
                      <span className="text-white text-sm font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">Plano</span>
                    <span className={`text-xs font-bold border px-2.5 py-1 uppercase ${planColor[selected.plan] ?? 'text-gray-400 border-gray-600'}`}>
                      {selected.plan ?? '—'}
                    </span>
                  </div>
                </div>
              )}

              {/* ── Métricas (somente leitura) ── */}
              {tab === 'metricas' && (
                <div className="space-y-3">
                  {loadingM ? (
                    <p className="text-gray-500 text-xs text-center py-6 animate-pulse">Carregando...</p>
                  ) : !metrics ? (
                    <div className="text-center py-8">
                      <Scale size={28} className="text-gray-700 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Nenhuma métrica registrada ainda.</p>
                    </div>
                  ) : (
                    <>
                      {[
                        ['Peso',        metrics.weight    != null ? `${metrics.weight} kg`  : '—', <Scale size={13} />],
                        ['Altura',      metrics.height    != null ? `${metrics.height} cm`  : '—', <Ruler size={13} />],
                        ['% Gordura',   metrics.body_fat  != null ? `${metrics.body_fat}%`  : '—', <TrendingUp size={13} />],
                        ['Cintura',     metrics.waist     != null ? `${metrics.waist} cm`   : '—', <Ruler size={13} />],
                        ['Braço',       metrics.arm       != null ? `${metrics.arm} cm`     : '—', <Ruler size={13} />],
                        ['Perna',       metrics.leg       != null ? `${metrics.leg} cm`     : '—', <Ruler size={13} />],
                      ].map(([label, value, icon]) => (
                        <div key={label} className="flex justify-between items-center border-b border-dark-border/50 pb-2">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wide flex items-center gap-1.5">{icon}{label}</span>
                          <span className="text-white text-sm font-medium">{value}</span>
                        </div>
                      ))}
                      {metrics.weight && metrics.height && (
                        <div className="flex justify-between items-center pt-1 border border-dark-border/40 px-3 py-2 bg-black">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wide">IMC</span>
                          <span className="text-lime-green font-bebas text-xl">
                            {(metrics.weight / ((metrics.height / 100) ** 2)).toFixed(1)}
                          </span>
                        </div>
                      )}
                      {metrics.recorded_at && (
                        <p className="text-gray-600 text-[10px] text-right">Registrado em: {metrics.recorded_at}</p>
                      )}
                    </>
                  )}
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
