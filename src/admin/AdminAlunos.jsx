import React, { useState, useEffect } from 'react';
import { Search, User, ChevronRight, X } from 'lucide-react';
import { adminUsers } from '../services/adminApi';

const planColor = { BRONZE: 'text-orange-400 border-orange-400', PRATA: 'text-gray-300 border-gray-300', OURO: 'text-yellow-400 border-yellow-400', DIAMANTE: 'text-purple-400 border-purple-400' };

export default function AdminAlunos() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [tab, setTab]             = useState('dados');

  useEffect(() => {
    adminUsers.listAll()
      .then(d => {
        const list = Array.isArray(d) ? d : (d?.users ?? d?.data ?? d?.alunos ?? []);
        setUsers(list);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));

  }, []);

  const openUser = (u) => {
    setSelected(u);
    setTab('dados');
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
              <button onClick={() => setTab('dados')}
                className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-lime-green border-b-2 border-lime-green">
                Dados
              </button>
            </div>

            <div className="p-5 space-y-3">
              {tab === 'dados' && (
                <>
                  {[
                    ['Nome',            selected.name],
                    ['E-mail',          selected.email],
                    ['Telefone',        selected.phone        ?? '—'],
                    ['Início do plano', selected.plan_start   ? selected.plan_start.split('T')[0]   : '—'],
                    ['Renovação',       selected.plan_renewal ? selected.plan_renewal.split('T')[0] : '—'],
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
                </>
              )}


            </div>
          </div>
        </div>
      )}
    </div>
  );
}
