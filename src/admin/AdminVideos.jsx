import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save, PlayCircle } from 'lucide-react';
import { adminVideos } from '../services/adminApi';

const CATEGORIES = ['Aquecimento', 'Peito', 'Costas', 'Pernas', 'Ombro', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio', 'Alongamento', 'Geral'];

const empty = { title: '', description: '', url: '', thumbnail_url: '', category: 'Geral', duration_min: '' };

function getYoutubeId(url) {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function AdminVideos() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | 'new' | video obj
  const [form, setForm]       = useState(empty);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [playVideo, setPlayVideo] = useState(null);

  useEffect(() => {
    adminVideos.list()
      .then(d => setVideos(Array.isArray(d) ? d : (d?.videos ?? [])))
      .finally(() => setLoading(false));
  }, []);

  const openNew  = () => { setForm(empty); setModal('new'); };
  const openEdit = (v) => { setForm({ title: v.title, description: v.description ?? '', url: v.url, thumbnail_url: v.thumbnail_url ?? '', category: v.category ?? 'Geral', duration_min: v.duration_min ?? '' }); setModal(v); };

  const save = async () => {
    setSaving(true);
    if (modal === 'new') {
      const res = await adminVideos.create(form).catch(() => null);
      if (res?.id) setVideos(prev => [res, ...prev]);
    } else {
      const res = await adminVideos.update(modal.id, form).catch(() => null);
      if (res) setVideos(prev => prev.map(v => v.id === modal.id ? { ...v, ...form } : v));
    }
    setSaving(false);
    setModal(null);
  };

  const remove = async (id) => {
    if (!confirm('Excluir este vídeo?')) return;
    await adminVideos.delete(id).catch(() => {});
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const ytId = form.url ? getYoutubeId(form.url) : null;
  const filtered = videos.filter(v =>
    v.title?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar vídeo..."
          className="bg-dark-card border border-dark-border text-white text-sm px-4 py-2.5 focus:outline-none focus:border-lime-green transition-colors w-full max-w-sm" />
        <button onClick={openNew}
          className="flex items-center gap-2 bg-lime-green text-black font-bold px-4 py-2.5 text-sm uppercase hover:bg-neon-green transition-colors whitespace-nowrap">
          <Plus size={16} /> Novo Vídeo
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm animate-pulse">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(v => {
            const ytId = getYoutubeId(v.url ?? '');
            const thumb = v.thumbnail_url || (ytId ? `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg` : null);
            return (
              <div key={v.id} className="bg-dark-card border border-dark-border overflow-hidden group">
                <div className="relative aspect-video bg-black">
                  {thumb ? (
                    <img src={thumb} alt={v.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PlayCircle size={40} className="text-gray-700" />
                    </div>
                  )}
                  <button onClick={() => setPlayVideo(v)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <PlayCircle size={48} className="text-white drop-shadow-lg" />
                  </button>
                  {v.duration_min && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5">{v.duration_min} min</span>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{v.title}</p>
                      <span className="text-[10px] text-lime-green border border-lime-green/30 px-1.5 py-0.5 mt-1 inline-block uppercase">{v.category}</span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(v)} className="p-1.5 text-gray-500 hover:text-lime-green transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => remove(v.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {v.description && <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{v.description}</p>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-12">
              <PlayCircle size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Nenhum vídeo cadastrado.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Player */}
      {playVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setPlayVideo(null)}>
          <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold truncate pr-4">{playVideo.title}</p>
              <button onClick={() => setPlayVideo(null)} className="text-gray-400 hover:text-white flex-shrink-0"><X size={22} /></button>
            </div>
            {getYoutubeId(playVideo.url ?? '') ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${getYoutubeId(playVideo.url)}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full"
                  title={playVideo.title}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                <video src={playVideo.url} controls autoPlay className="w-full h-full" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Editar/Criar */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-[#111] border border-dark-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-dark-border">
              <h3 className="text-lg font-bebas uppercase text-lime-green">{modal === 'new' ? 'Novo Vídeo' : 'Editar Vídeo'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[['Título', 'title', 'text'], ['URL do vídeo (YouTube, etc.)', 'url', 'url'], ['Thumbnail (URL)', 'thumbnail_url', 'url']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green transition-colors" />
                </div>
              ))}

              {/* Preview YouTube */}
              {ytId && (
                <div className="aspect-video bg-black border border-dark-border overflow-hidden">
                  <img src={`https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Categoria</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Duração (min)</label>
                  <input type="number" value={form.duration_min} onChange={e => setForm({ ...form, duration_min: e.target.value })}
                    className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Descrição</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-black border border-dark-border text-white text-sm p-2.5 focus:outline-none focus:border-lime-green resize-none" />
              </div>

              <button onClick={save} disabled={saving || !form.title || !form.url}
                className="w-full flex items-center justify-center gap-2 bg-lime-green text-black font-bold py-3 uppercase text-sm hover:bg-neon-green transition-colors disabled:opacity-50">
                <Save size={15} /> {saving ? 'Salvando...' : 'Salvar Vídeo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
