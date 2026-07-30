import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, ShoppingBag, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { adminFinance } from '../services/adminApi';

const STATUS_COLOR = {
  paid:      'text-lime-green border-lime-green/40 bg-lime-green/10',
  pending:   'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
  cancelled: 'text-red-400 border-red-400/40 bg-red-400/10',
  refunded:  'text-gray-400 border-gray-400/40 bg-gray-400/10',
};
const STATUS_LABEL = { paid: 'Pago', pending: 'Pendente', cancelled: 'Cancelado', refunded: 'Reembolsado' };

const PLAN_COLOR = {
  BRONZE:   'text-orange-400 border-orange-400/40',
  PRATA:    'text-gray-300 border-gray-300/40',
  OURO:     'text-yellow-400 border-yellow-400/40',
  DIAMANTE: 'text-purple-400 border-purple-400/40',
};

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-dark-card border border-dark-border p-5">
      <div className={`mb-3 ${color}`}>{icon}</div>
      <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-bebas ${color}`}>{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminFinanceiro() {
  const [summary, setSummary]   = useState(null);
  const [orders, setOrders]     = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('resumo');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    Promise.all([
      adminFinance.payments().catch(() => null),
      adminFinance.orders().catch(() => null),
      adminFinance.students().catch(() => null),
    ]).then(([p, o, st]) => {
      const paymentList = Array.isArray(p) ? p : (p?.payments ?? []);
      const orderList   = Array.isArray(o) ? o : (o?.orders   ?? []);
      const studentList = Array.isArray(st) ? st : (st?.users  ?? []);

      // Mescla orders com seus payments pelo id_order
      const normalized = orderList.map(ord => {
        const pay = paymentList.find(pm => pm.id_order === ord.id_order);
        const status = pay?.payment_status ?? ord.payment_status;
        return {
          ...ord,
          ...pay,
          id_order:   ord.id_order,
          status:     status === 'approved' ? 'paid' : (status ?? 'pending'),
          amount:     pay?.amount ?? ord.total_amount,
          user_name:  ord.user_name  ?? pay?.user_name,
          user_email: ord.user_email ?? pay?.user_email,
          items:      ord.items ?? [],
        };
      });

      setOrders(normalized);
      setStudents(studentList);

      const paid = normalized.filter(o => o.status === 'paid' || o.status === 'approved');
      const total_revenue   = paid.reduce((acc, o) => acc + parseFloat(o.amount ?? 0), 0);
      const now = new Date();
      const monthly_revenue = paid
        .filter(o => { const d = new Date(o.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
        .reduce((acc, o) => acc + parseFloat(o.amount ?? 0), 0);
      const by_plan = studentList.reduce((acc, s) => { if (s.plan) acc[s.plan] = (acc[s.plan] ?? 0) + 1; return acc; }, {});
      setSummary({ total_revenue, monthly_revenue, active_students: studentList.length, total_orders: normalized.length, by_plan });
    }).finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.user_name?.toLowerCase().includes(search.toLowerCase()) || o.id_user?.toString().includes(search);
    const matchFilter = filter === 'all' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (v) => v != null ? `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—';

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex border-b border-dark-border">
        {[['resumo', 'Resumo'], ['pedidos', 'Pedidos'], ['alunos', 'Alunos Ativos']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${tab === k ? 'text-lime-green border-b-2 border-lime-green' : 'text-gray-500 hover:text-gray-300'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
      ) : (
        <>
          {/* ── Resumo ── */}
          {tab === 'resumo' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={<DollarSign size={24} />} label="Receita total" value={fmt(summary?.total_revenue)} color="text-lime-green" />
                <StatCard icon={<DollarSign size={24} />} label="Receita mensal" value={fmt(summary?.monthly_revenue)} sub="Mês atual" color="text-blue-400" />
                <StatCard icon={<Users size={24} />} label="Alunos ativos" value={summary?.active_students ?? '—'} color="text-purple-400" />
                <StatCard icon={<ShoppingBag size={24} />} label="Pedidos totais" value={summary?.total_orders ?? '—'} color="text-orange-400" />
              </div>

              {/* Distribuição por plano */}
              {summary?.by_plan && (
                <div className="bg-dark-card border border-dark-border p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Alunos por plano</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(summary.by_plan).map(([plan, count]) => (
                      <div key={plan} className={`border px-4 py-3 text-center ${PLAN_COLOR[plan] ?? 'text-gray-400 border-gray-600'}`}>
                        <p className="text-2xl font-bebas">{count}</p>
                        <p className="text-[10px] uppercase tracking-wider mt-0.5">{plan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Últimos pedidos */}
              <div className="bg-dark-card border border-dark-border p-5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Últimos pedidos</p>
                <div className="space-y-2">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id_order} className="flex items-center justify-between py-2 border-b border-dark-border last:border-0">
                      <div>
                        <p className="text-white text-sm">{o.user_name ?? `Pedido #${o.id_order}`}</p>
                        <p className="text-gray-500 text-xs">{o.order_number} · {o.created_at ? new Date(o.created_at).toLocaleDateString('pt-BR') : '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-semibold">{fmt(o.amount)}</p>
                        <span className={`text-[10px] font-bold border px-1.5 py-0.5 ${STATUS_COLOR[o.status] ?? 'text-gray-400 border-gray-600'}`}>
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-gray-600 text-sm text-center py-4">Nenhum pedido.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Pedidos ── */}
          {tab === 'pedidos' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pedido..."
                    className="w-full bg-dark-card border border-dark-border text-white text-sm pl-9 pr-4 py-2.5 focus:outline-none focus:border-lime-green transition-colors" />
                </div>
                <div className="flex gap-1">
                  {[['all', 'Todos'], ['paid', 'Pagos'], ['pending', 'Pendentes'], ['cancelled', 'Cancelados']].map(([k, l]) => (
                    <button key={k} onClick={() => setFilter(k)}
                      className={`px-3 py-2 text-xs font-bold border uppercase transition-colors ${filter === k ? 'border-lime-green text-lime-green' : 'border-dark-border text-gray-600 hover:text-gray-400'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                {filteredOrders.map(o => (
                  <div key={o.id_order} className="bg-dark-card border border-dark-border overflow-hidden">
                    <button onClick={() => setExpanded(expanded === o.id_order ? null : o.id_order)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-white text-sm font-semibold">{o.user_name ?? `Pedido #${o.id_order}`}</p>
                          <p className="text-gray-500 text-xs">{o.user_email} · {o.created_at ? new Date(o.created_at).toLocaleDateString('pt-BR') : '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold border px-2 py-0.5 ${STATUS_COLOR[o.status] ?? 'text-gray-400 border-gray-600'}`}>
                          {STATUS_LABEL[o.status] ?? o.status}
                        </span>
                        <p className="text-white font-semibold text-sm">{fmt(o.amount)}</p>
                        {expanded === o.id_order ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
                      </div>
                    </button>
                    {expanded === o.id_order && (
                      <div className="border-t border-dark-border px-4 py-3 bg-black/30 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {[['Nº Pedido', o.order_number ?? `#${o.id_order}`], ['Método', o.payment_method ?? '—'], ['Parcelas', o.installments ? `${o.installments}x` : '1x'], ['Status pgto', o.payment_status ?? '—']].map(([label, val]) => (
                            <div key={`${o.id_order}-${label}`}>
                              <p className="text-gray-600 uppercase tracking-wide mb-0.5">{label}</p>
                              <p className="text-white font-semibold">{val}</p>
                            </div>
                          ))}
                        </div>
                        {o.items?.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-600 uppercase tracking-widest">Itens</p>
                            {o.items.map((it, i) => (
                              <div key={`${o.id_order}-item-${it.id ?? i}`} className="flex justify-between text-xs">
                                <span className="text-gray-400">{it.plan_name} · {it.plan_frequency}</span>
                                <span className="text-white">{fmt(it.plan_price)} × {it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {filteredOrders.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-8">Nenhum pedido encontrado.</p>
                )}
              </div>
            </div>
          )}

          {/* ── Alunos Ativos ── */}
          {tab === 'alunos' && (
            <div className="space-y-3">
              <div className="relative max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..."
                  className="w-full bg-dark-card border border-dark-border text-white text-sm pl-9 pr-4 py-2.5 focus:outline-none focus:border-lime-green transition-colors" />
              </div>

              <div className="space-y-1">
                {filteredStudents.map(s => {
                  const renewal = s.plan_renewal ? new Date(s.plan_renewal) : null;
                  const daysLeft = renewal ? Math.max(0, Math.ceil((renewal - new Date()) / 86400000)) : null;
                  return (
                    <div key={s.id_user} className="bg-dark-card border border-dark-border px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-black border border-dark-border flex items-center justify-center text-xs font-bold text-white">
                          {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{s.name}</p>
                          <p className="text-gray-500 text-xs">{s.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold border px-2 py-0.5 ${PLAN_COLOR[s.plan] ?? 'text-gray-400 border-gray-600'}`}>{s.plan}</span>
                        {daysLeft !== null && (
                          <p className={`text-[10px] mt-1 ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 30 ? 'text-yellow-400' : 'text-gray-600'}`}>
                            {daysLeft === 0 ? 'Vence hoje' : `Vence em ${daysLeft}d`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <p className="text-gray-600 text-sm text-center py-8">Nenhum aluno ativo.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
