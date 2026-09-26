import React, { useEffect, useState } from 'react';
import { Activity, CalendarClock, Dumbbell, Users, UserCheck, UserX, RefreshCw, X } from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { adminUsers } from '../services/adminApi';

const fmtPhone = (v) => {
  if (!v) return '—';
  const d = String(v).replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return v;
};

const fmtDate = (v) => {
  if (!v) return '—';
  const s = String(v).split('T')[0];
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  const parts = s.split('-');
  if (parts.length === 3 && parts[0].length === 4) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return v;
};

const LEVELS = [
  { key: 'beginner', label: 'Iniciantes', color: '#84cc16' },
  { key: 'intermediate', label: 'Intermediários', color: '#38bdf8' },
  { key: 'advanced', label: 'Avançados', color: '#c084fc' },
];

function StatCard({ icon, label, value, color, onDetails }) {
  return (
    <div className="bg-dark-card border border-dark-border p-5">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-gray-500 text-xs uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-bebas mt-1 ${color}`}>{value ?? '—'}</p>
      {onDetails && <button type="button" onClick={onDetails} className="mt-3 text-[11px] uppercase tracking-wider text-gray-400 border border-dark-border px-2.5 py-1.5 hover:text-lime-green hover:border-lime-green/50 transition-colors">Ver alunos</button>}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentModal, setStudentModal] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [levelModal, setLevelModal] = useState(null); // { students, filter }
  const [levelFilter, setLevelFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminUsers.dashboard();
      if (!result || result.error || result.detail) throw new Error(result?.detail || result?.message || 'Não foi possível carregar o dashboard.');
      setData(result);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openLevelModal = async () => {
    setLevelModal({ students: [] });
    setLevelFilter('all');
    setStudentsLoading(true);
    setStudentsError('');
    try {
      const result = await adminUsers.listAll();
      if (!result || result.error || result.detail) throw new Error(result?.detail || result?.message || 'Não foi possível carregar os alunos.');
      const users = Array.isArray(result) ? result : (result.users ?? []);
      setLevelModal({ students: users.filter(s => s.role === 'student') });
    } catch (err) {
      setStudentsError(err.message);
    } finally {
      setStudentsLoading(false);
    }
  };

  const openStudentList = async (active) => {
    setStudentModal({ active, students: [] });
    setStudentsLoading(true);
    setStudentsError('');
    try {
      const result = await adminUsers.listAll();
      if (!result || result.error || result.detail) throw new Error(result?.detail || result?.message || 'Não foi possível carregar os alunos.');
      const users = Array.isArray(result) ? result : (result.users ?? []);
      const isActive = (value) => value === true || value === 1 || value === '1';
      setStudentModal({ active, students: users.filter(student => student.role === 'student' && isActive(student.active) === active) });
    } catch (err) {
      setStudentsError(err.message || 'Não foi possível carregar os alunos.');
    } finally {
      setStudentsLoading(false);
    }
  };

  const stats = data?.stats ?? {};
  const statusData = [
    { name: 'Ativos', value: stats.active_students ?? 0, color: '#84cc16' },
    { name: 'Inativos', value: stats.inactive_students ?? 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-gray-400 text-sm">Visão geral dos alunos e dos treinos</p>
          <p className="text-gray-600 text-xs mt-1">Frequência considera os últimos 30 dias · Renovação nos próximos 30 dias</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 border border-dark-border px-3 py-2 text-xs text-gray-300 hover:text-lime-green disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {error && <div className="border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">{error}</div>}
      {loading && !data ? <p className="text-gray-500 text-sm animate-pulse">Carregando indicadores...</p> : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <StatCard icon={<Users size={22} />} label="Total de alunos" value={stats.total_students} color="text-cyan-400" />
            <StatCard icon={<UserCheck size={22} />} label="Alunos ativos" value={stats.active_students} color="text-lime-green" onDetails={() => openStudentList(true)} />
            <StatCard icon={<UserX size={22} />} label="Alunos inativos" value={stats.inactive_students} color="text-red-400" onDetails={() => openStudentList(false)} />
            <StatCard icon={<CalendarClock size={22} />} label="Planos a vencer" value={data?.upcoming_renewals?.length ?? 0} color="text-yellow-400" />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <section className="bg-dark-card border border-dark-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bebas uppercase text-white text-lg">Nível dos alunos</h2>
                <button onClick={openLevelModal} className="text-[11px] uppercase tracking-wider text-gray-400 border border-dark-border px-2.5 py-1.5 hover:text-lime-green hover:border-lime-green/50 transition-colors">Ver detalhes</button>
              </div>
              <div className="space-y-4">
                {LEVELS.map(level => {
                  const count = data?.levels?.[level.key] ?? 0;
                  const percent = stats.total_students ? Math.round(count / stats.total_students * 100) : 0;
                  return <div key={level.key}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-gray-400">{level.label}</span><span className="text-white">{count}</span></div>
                    <div className="h-2 bg-black"><div className="h-full" style={{ width: `${percent}%`, backgroundColor: level.color }} /></div>
                  </div>;
                })}
              </div>
              <p className="text-gray-600 text-[10px] mt-4">Nível calculado pelo treino atribuído no ciclo ativo.</p>
            </section>

            <section className="bg-dark-card border border-dark-border p-5">
              <h2 className="font-bebas uppercase text-white text-lg mb-2">Ativos e inativos</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={4}>
                    {statusData.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie><Tooltip contentStyle={{ background: '#111', border: '1px solid #333', color: '#fff' }} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-5 text-xs text-gray-400"><span><i className="inline-block w-2 h-2 bg-lime-green mr-2" />Ativos {stats.active_students ?? 0}</span><span><i className="inline-block w-2 h-2 bg-red-500 mr-2" />Inativos {stats.inactive_students ?? 0}</span></div>
            </section>

            <section className="bg-dark-card border border-dark-border p-5">
              <div className="flex items-center gap-2 mb-4"><Dumbbell size={17} className="text-orange-400" /><h2 className="font-bebas uppercase text-white text-lg">Mais frequência de treinos</h2></div>
              {data?.top_students?.length ? <ol className="space-y-3">{data.top_students.map((student, index) => <li key={student.id} className="flex items-center justify-between gap-3 border-b border-dark-border pb-2 last:border-0">
                <div className="min-w-0"><p className="text-sm text-white truncate"><span className="text-gray-600 mr-2">{index + 1}.</span>{student.name}</p><p className="text-[10px] text-gray-600 truncate">{student.email}</p></div>
                <span className="text-lime-green font-bebas text-lg shrink-0">{student.completed_workouts} treinos</span>
              </li>)}</ol> : <p className="text-gray-600 text-sm">Sem treinos concluídos no período.</p>}
            </section>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <section className="bg-dark-card border border-dark-border p-5">
              <div className="flex items-center gap-2 mb-4"><Activity size={17} className="text-cyan-400" /><h2 className="font-bebas uppercase text-white text-lg">Desempenho dos treinos</h2></div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.performance ?? []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="workoutsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} /><stop offset="95%" stopColor="#84cc16" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: '#737373', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', color: '#fff' }} />
                    <Area type="monotone" dataKey="completed_workouts" name="Treinos concluídos" stroke="#84cc16" fill="url(#workoutsFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-dark-card border border-dark-border p-5">
              <div className="flex items-center gap-2 mb-4"><CalendarClock size={17} className="text-yellow-400" /><h2 className="font-bebas uppercase text-white text-lg">Planos próximos do vencimento</h2></div>
              {data?.upcoming_renewals?.length ? <div className="space-y-3 max-h-64 overflow-y-auto">{data.upcoming_renewals.map(student => <div key={student.id} className="flex items-center justify-between gap-3 border-b border-dark-border pb-2">
                <div className="min-w-0"><p className="text-sm text-white truncate">{student.name}</p><p className="text-[10px] text-gray-600 truncate">{student.email}</p></div>
                <div className="text-right shrink-0"><p className="text-yellow-400 text-xs">{student.days_remaining === 0 ? 'Vence hoje' : `${student.days_remaining} dias`}</p><p className="text-gray-600 text-[10px]">{student.plan_renewal}</p></div>
              </div>)}</div> : <p className="text-gray-600 text-sm">Nenhum plano vencendo nos próximos 30 dias.</p>}
            </section>
          </div>
        </>
      )}

      {levelModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={() => setLevelModal(null)}>
          <section role="dialog" aria-modal="true" className="bg-[#111] border border-dark-border w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between gap-4 p-5 border-b border-dark-border">
              <div>
                <h2 className="font-bebas uppercase text-xl text-white">Nível dos alunos</h2>
                <p className="text-gray-500 text-xs mt-1">
                  {studentsLoading ? 'Buscando lista...' : `${(levelFilter === 'all' ? levelModal.students : levelModal.students.filter(s => s.level === levelFilter)).length} aluno(s)`}
                </p>
              </div>
              <button onClick={() => setLevelModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </header>
            <div className="flex gap-2 px-5 pt-4 flex-wrap">
              {[{ key: 'all', label: 'Todos', color: 'text-white border-dark-border' }, ...LEVELS.map(l => ({ key: l.key, label: l.label, color: '' }))].map(f => (
                <button key={f.key} onClick={() => setLevelFilter(f.key)}
                  className={`text-[11px] uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                    levelFilter === f.key
                      ? f.key === 'all' ? 'border-white text-white' : f.key === 'beginner' ? 'border-lime-400 text-lime-400' : f.key === 'intermediate' ? 'border-sky-400 text-sky-400' : 'border-purple-400 text-purple-400'
                      : 'border-dark-border text-gray-500 hover:text-gray-300'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="p-5 overflow-y-auto">
              {studentsLoading ? <p className="text-gray-500 text-sm animate-pulse">Carregando alunos...</p> : studentsError ? <p className="text-red-300 text-sm">{studentsError}</p> : (() => {
                const list = levelFilter === 'all' ? levelModal.students : levelModal.students.filter(s => s.level === levelFilter);
                return list.length ? (
                  <div className="space-y-3">{list.map(student => (
                    <article key={student.id ?? student.id_user} className="grid sm:grid-cols-2 gap-x-6 gap-y-2 bg-black/40 border border-dark-border p-4">
                      <div className="sm:col-span-2 flex items-center justify-between">
                        <div><p className="text-white font-semibold">{student.name || 'Nome não informado'}</p><p className="text-gray-500 text-xs">{student.email}</p></div>
                        {student.level && (
                          <span className={`text-[10px] font-bold uppercase border px-2 py-0.5 ${
                            student.level === 'beginner' ? 'text-lime-400 border-lime-400' : student.level === 'intermediate' ? 'text-sky-400 border-sky-400' : 'text-purple-400 border-purple-400'
                          }`}>
                            {LEVELS.find(l => l.key === student.level)?.label ?? student.level}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">Telefone: <span className="text-gray-200">{fmtPhone(student.phone)}</span></p>
                      <p className="text-xs text-gray-400">Plano: <span className="text-gray-200">{student.plan || 'Sem plano'}</span></p>
                      <p className="text-xs text-gray-400">Início do plano: <span className="text-gray-200">{fmtDate(student.plan_start)}</span></p>
                      <p className="text-xs text-gray-400">Vencimento: <span className="text-gray-200">{fmtDate(student.plan_renewal)}</span></p>
                    </article>
                  ))}</div>
                ) : <p className="text-gray-500 text-sm">Nenhum aluno neste nível.</p>;
              })()}
            </div>
          </section>
        </div>
      )}

      {studentModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4" onClick={() => setStudentModal(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="student-list-title" className="bg-[#111] border border-dark-border w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={event => event.stopPropagation()}>
            <header className="flex items-center justify-between gap-4 p-5 border-b border-dark-border">
              <div>
                <h2 id="student-list-title" className={`font-bebas uppercase text-xl ${studentModal.active ? 'text-lime-green' : 'text-red-400'}`}>Alunos {studentModal.active ? 'ativos' : 'inativos'}</h2>
                <p className="text-gray-500 text-xs mt-1">{studentsLoading ? 'Buscando lista...' : `${studentModal.students.length} aluno(s)`}</p>
              </div>
              <button type="button" aria-label="Fechar" onClick={() => setStudentModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </header>
            <div className="p-5 overflow-y-auto">
              {studentsLoading ? <p className="text-gray-500 text-sm animate-pulse">Carregando alunos...</p> : studentsError ? <p className="text-red-300 text-sm">{studentsError}</p> : studentModal.students.length ? (
                <div className="space-y-3">{studentModal.students.map(student => <article key={student.id ?? student.id_user} className="grid sm:grid-cols-2 gap-x-6 gap-y-2 bg-black/40 border border-dark-border p-4">
                  <div className="sm:col-span-2"><p className="text-white font-semibold">{student.name || 'Nome não informado'}</p><p className="text-gray-500 text-xs break-all">{student.email || 'E-mail não informado'}</p></div>
                  <p className="text-xs text-gray-400">Telefone: <span className="text-gray-200">{fmtPhone(student.phone)}</span></p>
                  <p className="text-xs text-gray-400">Plano: <span className="text-gray-200">{student.plan || 'Sem plano'}</span></p>
                  <p className="text-xs text-gray-400">Início do plano: <span className="text-gray-200">{fmtDate(student.plan_start)}</span></p>
                  <p className="text-xs text-gray-400">Vencimento: <span className="text-gray-200">{fmtDate(student.plan_renewal)}</span></p>
                </article>)}</div>
              ) : <p className="text-gray-500 text-sm">Nenhum aluno nesta lista.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
