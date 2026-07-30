import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, Tag, Copy, CheckCircle } from 'lucide-react';
import { adminCoupons } from '../services/adminApi';

const inp = 'w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors';

const emptyCoupon = {
  code: '', description: '', discount_type: 'percent', discount_value: '',
  valid_from: new Date().toISOString().split('T')[0],
  valid_until: '', usage_limit: '', min_purchase_amount: '',
};

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-border">
          <h3 className="text-lg font-bebas uppercase text-lime-green">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

export default function AdminCupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'new' | coupon obj
  const [form, setForm]       = useState(emptyCoupon);
  const [saving, setSaving]   = useState(false);
  const [copied, setCopied]   = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const d = await adminCoupons.list().catch(() => ({}));
    setCoupons(d.coupons ?? (Array.isArray(d) ? d : []));
    setLoading(false);
  };

  const openNew = () => { setForm(emptyCoupon); setModal('new'); };
  const openEdit = (c) => {
    setForm({
      code:                c.code,
      description:         c.description ?? '',
      discount_type:       c.discount_type,
      discount_value:      c.discount_value,
      valid_from:          c.valid_from?.split('T')[0] ?? '',
      valid_until:         c.valid_until?.split('T')[0] ?? '',
      usage_limit:         c.usage_limit ?? '',
      min_purchase_amount: c.min_purchase_amount ?? '',
    });
    setModal(c);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      code:                form.code.toUpperCase().trim(),
      discount_value:      parseFloat(form.discount_value),
      usage_limit:         form.usage_limit ? parseInt(form.usage_limit) : null,
      min_purchase_amount: parseFloat(form.min_purchase_amount || 0),
    };
    if (modal === 'new') {
      await adminCoupons.create(payload).catch(() => null);
    } else {
      await adminCoupons.update(modal.id_coupon, payload).catch(() => null);
    }
    setSaving(false);
    setModal(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Desativar este cupom?')) return;
    await adminCoupons.delete(id).catch(() => {});
    setCoupons(p => p.filter(c => c.id_coupon !== id));
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const isExpired = (c) => c.valid_until && new Date(c.valid_until) < new Date();
  const isActive  = (c) => c.is_active && !isExpired(c);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openNew}
          className="flex items-center gap-2 bg-lime-green text-black font-bold px-4 py-2.5 text-sm uppercase hover:bg-neon-green transition-colors">
          <Plus size={16} /> Novo Cupom
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12">
          <Tag size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Nenhum cupom cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((c, i) => {
            const active  = isActive(c);
            const expired = isExpired(c);
            const pct     = c.discount_type === 'percent';
            return (
              <div key={c.id_coupon ?? i} className={`border bg-dark-card p-4 flex items-center justify-between gap-3 ${active ? 'border-dark-border' : 'border-dark-border/40 opacity-60'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {/* Badge código */}
                  <button onClick={() => copyCode(c.code)}
                    className="flex items-center gap-1.5 bg-black border border-dark-border px-3 py-1.5 font-mono text-sm font-bold text-lime-green hover:border-lime-green transition-colors shrink-0">
                    {copied === c.code ? <CheckCircle size={13} /> : <Copy size={13} />}
                    {c.code}
                  </button>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{c.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-lime-green text-xs font-bold">
                        {pct ? `${c.discount_value}%` : `R$ ${parseFloat(c.discount_value).toFixed(2)}`} off
                      </span>
                      {c.min_purchase_amount > 0 && (
                        <span className="text-gray-500 text-[10px]">mín. R$ {parseFloat(c.min_purchase_amount).toFixed(2)}</span>
                      )}
                      <span className="text-gray-600 text-[10px]">
                        {c.valid_from?.split('T')[0]} → {c.valid_until?.split('T')[0]}
                      </span>
                      {c.usage_limit && (
                        <span className="text-gray-500 text-[10px]">{c.usage_count}/{c.usage_limit} usos</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {expired && <span className="text-[10px] text-red-400 border border-red-400/30 px-1.5 py-0.5">Expirado</span>}
                  {!c.is_active && !expired && <span className="text-[10px] text-gray-500 border border-dark-border px-1.5 py-0.5">Inativo</span>}
                  {active && <span className="text-[10px] text-lime-green border border-lime-green/30 px-1.5 py-0.5">Ativo</span>}
                  <button onClick={() => openEdit(c)} className="p-1.5 text-gray-500 hover:text-lime-green transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(c.id_coupon)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && (
        <Modal title={modal === 'new' ? 'Novo Cupom' : 'Editar Cupom'} onClose={() => setModal(null)}>
          <Field label="Código do cupom">
            <input className={inp} value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="Ex: PROMO20" disabled={modal !== 'new'} />
          </Field>
          <Field label="Descrição">
            <input className={inp} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: 20% de desconto no plano Ouro" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tipo de desconto">
              <select className={inp} value={form.discount_type}
                onChange={e => setForm({ ...form, discount_type: e.target.value })}>
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </Field>
            <Field label={form.discount_type === 'percent' ? 'Desconto (%)' : 'Desconto (R$)'}>
              <input type="number" step="0.01" min="0" className={inp} value={form.discount_value}
                onChange={e => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === 'percent' ? '20' : '10.00'} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Válido de">
              <input type="date" className={inp} value={form.valid_from}
                onChange={e => setForm({ ...form, valid_from: e.target.value })} />
            </Field>
            <Field label="Válido até">
              <input type="date" className={inp} value={form.valid_until}
                onChange={e => setForm({ ...form, valid_until: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Limite de usos (opcional)">
              <input type="number" min="1" className={inp} value={form.usage_limit}
                onChange={e => setForm({ ...form, usage_limit: e.target.value })}
                placeholder="Ilimitado" />
            </Field>
            <Field label="Compra mínima (R$)">
              <input type="number" step="0.01" min="0" className={inp} value={form.min_purchase_amount}
                onChange={e => setForm({ ...form, min_purchase_amount: e.target.value })}
                placeholder="0.00" />
            </Field>
          </div>
          {modal !== 'new' && (
            <Field label="Status">
              <div className="grid grid-cols-2 gap-2">
                {[{ v: 1, l: 'Ativo' }, { v: 0, l: 'Inativo' }].map(({ v, l }) => (
                  <button key={v} type="button"
                    onClick={() => setForm({ ...form, is_active: v })}
                    className={`py-2 text-sm font-bold border transition-colors ${
                      (form.is_active ?? 1) === v
                        ? v === 1 ? 'border-lime-green text-lime-green' : 'border-red-400 text-red-400'
                        : 'border-dark-border text-gray-600'
                    }`}>{l}</button>
                ))}
              </div>
            </Field>
          )}
          <button onClick={save}
            disabled={saving || !form.code || !form.discount_value || !form.valid_until}
            className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Cupom'}
          </button>
        </Modal>
      )}
    </div>
  );
}
